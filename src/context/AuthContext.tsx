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
  loginFirebase: (
    email: string, 
    pass: string, 
    requestedRole?: "super_admin" | "institute_admin"
  ) => Promise<boolean>;
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
  document.cookie = `cdp_institute=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [institute, setInstitute] = useState<Institute | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isFirebaseLive, setIsFirebaseLive] = useState<boolean>(true);

  // Load user session from server or storage on startup
  const restoreSession = async () => {
    try {
      if (typeof window === "undefined") return;

      // 1. Check authoritative server cookie
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
            setInstitute(data.institute || null);
            if (data.institute) {
              setWalletBalance(data.institute.walletBalance);
            }
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
            setAuthCookies(data.user.role);
            return;
          }
        }
      } catch (apiErr) {
        console.warn("/api/auth/me call skipped:", apiErr);
      }

      // 2. Client fallback from stored session
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
    const unsubAuth = onFirebaseAuthStateChange(async (fbUser) => {
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
    // Only Super Admin is permitted to switch tenants
    if (user && user.role !== "super_admin") return;

    setLoading(true);
    const inst = await dataStore.getInstitute(instituteId);
    if (inst) {
      setInstitute(inst);
      setWalletBalance(inst.walletBalance);
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
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          requestedRole: role,
          instituteId: targetInstituteId,
          studentId: targetStudentId,
          displayName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed.");
      }

      setUser(data.user);
      setInstitute(data.institute || null);
      if (data.institute) {
        setWalletBalance(data.institute.walletBalance);
      }

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
      setAuthCookies(data.user.role);

      return true;
    } finally {
      setLoading(false);
    }
  };

  const loginFirebase = async (
    email: string, 
    pass: string, 
    requestedRole?: "super_admin" | "institute_admin"
  ) => {
    setLoading(true);
    try {
      // 1. Authenticate with real Firebase Auth
      const fbUser = await signInFirebase(email, pass);
      const idToken = await fbUser.getIdToken(true);

      // 2. Synchronize server session & verify claims
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          email: fbUser.email || email,
          requestedRole,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed on server.");
      }

      setUser(data.user);
      setInstitute(data.institute || null);
      if (data.institute) {
        setWalletBalance(data.institute.walletBalance);
      }

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
      setAuthCookies(data.user.role);

      return true;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOutFirebase();
    } catch (e) {
      // ignore
    }
    try {
      await fetch("/api/auth/logout", { method: "POST" });
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
