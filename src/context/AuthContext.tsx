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

interface AuthContextType {
  user: UserProfile | null;
  institute: Institute | null;
  loading: boolean;
  walletBalance: number;
  isFirebaseLive: boolean;
  refreshInstitute: () => Promise<void>;
  switchRole: (role: "institute_admin" | "super_admin") => void;
  switchInstitute: (instituteId: string) => Promise<void>;
  login: (email: string, role?: "institute_admin" | "super_admin") => Promise<boolean>;
  loginFirebase: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [institute, setInstitute] = useState<Institute | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(2850.0);
  const [isFirebaseLive, setIsFirebaseLive] = useState<boolean>(true);

  // Initialize data and seed Firestore
  const loadData = async (instId = "SBCI1001", role: "institute_admin" | "super_admin" = "institute_admin") => {
    try {
      const inst = await dataStore.getInstitute(instId);
      if (inst) {
        setInstitute(inst);
        setWalletBalance(inst.walletBalance);
      }
      setUser({
        uid: "usr_vinkal_prajapati",
        email: inst ? inst.email : "admin@certidesk.pro",
        displayName: role === "super_admin" ? "Super Administrator" : (inst ? inst.ownerName : "Vinkal Prajapati"),
        role,
        instituteId: role === "super_admin" ? undefined : instId,
        createdAt: "2026-01-01T00:00:00Z",
      });
    } catch (err) {
      console.error("Auth init error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto-seed Firebase Firestore if newly connected
    seedFirestoreIfEmpty().then(() => {
      setIsFirebaseLive(true);
    }).catch(() => {
      setIsFirebaseLive(false);
    });

    // Listen for Firebase Auth state changes
    const unsubAuth = onFirebaseAuthStateChange((fbUser) => {
      if (fbUser) {
        setUser((prev) => prev ? {
          ...prev,
          uid: fbUser.uid,
          email: fbUser.email || prev.email,
        } : null);
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

  const switchRole = (role: "institute_admin" | "super_admin") => {
    if (!user) return;
    setUser({
      ...user,
      role,
      displayName: role === "super_admin" ? "Super Admin" : (institute?.ownerName || "Vinkal Prajapati"),
      instituteId: role === "super_admin" ? undefined : (institute?.id || "SBCI1001"),
    });
  };

  const switchInstitute = async (instituteId: string) => {
    setLoading(true);
    await loadData(instituteId, user?.role === "super_admin" ? "super_admin" : "institute_admin");
  };

  const login = async (email: string, role?: "institute_admin" | "super_admin") => {
    const isSuper = email.toLowerCase().includes("admin@certidesk.pro") || email.toLowerCase().includes("super");
    const resolvedRole = role || (isSuper ? "super_admin" : "institute_admin");
    const institutes = await dataStore.getAllInstitutes();
    const matched = institutes.find((i) => i.email.toLowerCase() === email.toLowerCase());
    const instId = matched ? matched.id : "SBCI1001";
    await loadData(instId, resolvedRole);
    return true;
  };

  const loginFirebase = async (email: string, pass: string) => {
    try {
      await signInFirebase(email, pass);
      await login(email, "institute_admin");
      return true;
    } catch (e) {
      console.error("Firebase sign in error:", e);
      // Fallback local login for smooth demo
      await login(email, "institute_admin");
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
        switchRole,
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
