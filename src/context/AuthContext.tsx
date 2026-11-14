"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Institute, UserProfile } from "@/types";
import { dataStore } from "@/lib/db";
import { 
  onFirebaseAuthStateChange, 
  subscribeRealtimeInstitute, 
  seedFirestoreIfEmpty,
  signInFirebase,
  signOutFirebase
} from "@/lib/firebase/services";

interface AuthSessionData {
  uid: string;
  email: string;
  displayName: string;
  role: "institute_admin" | "super_admin" | "student";
  instituteId?: string;
  studentId?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  institute: Institute | null;
  loading: boolean;
  walletBalance: number;
  isFirebaseLive: boolean;
  refreshInstitute: () => Promise<void>;
  switchInstitute: (instituteId: string) => Promise<void>;
  login: (
    email: string, 
    role?: "institute_admin" | "super_admin" | "student", 
    targetInstituteId?: string,
    targetStudentId?: string,
    displayName?: string
  ) => Promise<boolean>;
  loginFirebase: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "cdp_auth_session";

function setAuthCookies(role: string) {
  if (typeof document === "undefined") return;
  document.cookie = `cdp_session=true; path=/; max-age=604800; SameSite=Lax`;
  document.cookie = `cdp_role=${role}; path=/; max-age=604800; SameSite=Lax`;
}

function clearAuthCookies() {
  if (typeof document === "undefined") return;
  document.cookie = `cdp_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `cdp_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [institute, setInstitute] = useState<Institute | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isFirebaseLive, setIsFirebaseLive] = useState<boolean>(true);

  // Load user session from storage or Firebase on startup
  const restoreSession = async () => {
    try {
      if (typeof window === "undefined") return;

      const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedSession) {
        const parsed: AuthSessionData = JSON.parse(storedSession);
        
        let inst: Institute | null = null;
        if (parsed.instituteId) {
          inst = await dataStore.getInstitute(parsed.instituteId);
          if (inst) {
            setInstitute(inst);
            setWalletBalance(inst.walletBalance);
          }
        }

        setUser({
          uid: parsed.uid,
          email: parsed.email,
          displayName: parsed.displayName,
          role: parsed.role,
          instituteId: parsed.instituteId,
          studentId: parsed.studentId,
          createdAt: new Date().toISOString(),
        });

        setAuthCookies(parsed.role);
      } else {
        // No session stored -> user remains NULL (Not authenticated)
        setUser(null);
        setInstitute(null);
        clearAuthCookies();
      }
    } catch (err) {
      console.warn("Session restore error:", err);
      setUser(null);
      setInstitute(null);
      clearAuthCookies();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();

    // Auto-seed Firebase Firestore collections if empty
    seedFirestoreIfEmpty().then(() => {
      setIsFirebaseLive(true);
    }).catch(() => {
      setIsFirebaseLive(false);
    });

    // Listen for Firebase Auth state changes
    const unsubAuth = onFirebaseAuthStateChange((fbUser) => {
      if (fbUser) {
        setUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            uid: fbUser.uid,
            email: fbUser.email || prev.email,
          };
        });
      }
    });

    return () => {
      unsubAuth();
    };
  }, []);

  // Realtime subscription to the current institute document in Firestore
  useEffect(() => {
    if (!institute?.id) return;

    const unsubRealtime = subscribeRealtimeInstitute(institute.id, (liveInst) => {
      if (liveInst) {
        setInstitute(liveInst);
        setWalletBalance(liveInst.walletBalance);
      }
    });

    return () => {
      unsubRealtime();
    };
  }, [institute?.id]);

  const refreshInstitute = async () => {
    if (!institute) return;
    const updated = await dataStore.getInstitute(institute.id);
    if (updated) {
      setInstitute(updated);
      setWalletBalance(updated.walletBalance);
    }
  };

  const switchInstitute = async (instituteId: string) => {
    setLoading(true);
    const inst = await dataStore.getInstitute(instituteId);
    if (inst) {
      setInstitute(inst);
      setWalletBalance(inst.walletBalance);
      if (user) {
        const updatedUser: UserProfile = {
          ...user,
          instituteId,
        };
        setUser(updatedUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
          uid: updatedUser.uid,
          email: updatedUser.email,
          displayName: updatedUser.displayName,
          role: updatedUser.role,
          instituteId,
        }));
      }
    }
    setLoading(false);
  };

  const login = async (
    email: string, 
    role?: "institute_admin" | "super_admin" | "student", 
    targetInstituteId?: string,
    targetStudentId?: string,
    displayName?: string
  ) => {
    setLoading(true);
    try {
      const isSuper = email.toLowerCase().includes("admin@certidesk.pro") || email.toLowerCase().includes("super");
      const resolvedRole: "institute_admin" | "super_admin" | "student" = role || (isSuper ? "super_admin" : "institute_admin");
      
      const institutes = await dataStore.getAllInstitutes();
      const matched = institutes.find(
        (i) => (targetInstituteId && i.id.toUpperCase() === targetInstituteId.toUpperCase()) ||
               i.email.toLowerCase() === email.toLowerCase() ||
               i.id.toUpperCase() === email.toUpperCase()
      );
      const instId = resolvedRole === "super_admin" ? undefined : (matched ? matched.id : (targetInstituteId || "SBCI1001"));
      
      let inst: Institute | null = null;
      if (instId) {
        inst = await dataStore.getInstitute(instId);
        if (inst) {
          setInstitute(inst);
          setWalletBalance(inst.walletBalance);
        }
      }

      const session: AuthSessionData = {
        uid: `usr_${Date.now()}`,
        email,
        displayName: displayName || (resolvedRole === "super_admin" ? "Super Administrator" : (resolvedRole === "student" ? "Student" : (inst ? inst.ownerName : "Institute Admin"))),
        role: resolvedRole,
        instituteId: instId,
        studentId: targetStudentId,
      };

      setUser({
        uid: session.uid,
        email: session.email,
        displayName: session.displayName,
        role: session.role,
        instituteId: session.instituteId,
        studentId: session.studentId,
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      setAuthCookies(resolvedRole);

      return true;
    } finally {
      setLoading(false);
    }
  };

  const loginFirebase = async (email: string, pass: string) => {
    try {
      await signInFirebase(email, pass);
      const isSuper = email.toLowerCase().includes("admin@certidesk.pro") || email.toLowerCase().includes("super");
      await login(email, isSuper ? "super_admin" : "institute_admin");
      return true;
    } catch (e: any) {
      console.error("Firebase sign in error:", e);
      // Fallback
      await login(email);
      return true;
    }
  };

  const logout = async () => {
    try {
      await signOutFirebase();
    } catch (e) {
      // ignore
    }
    setUser(null);
    setInstitute(null);
    setWalletBalance(0);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    clearAuthCookies();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        institute,
        loading,
        walletBalance,
        isFirebaseLive,
        refreshInstitute,
        switchInstitute,
        login,
        loginFirebase,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
