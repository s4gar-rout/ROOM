"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getCurrentUser, logoutUser } from "../services/auth.service";
import type { User } from "@/types/auth.types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      
      // If we don't have an access token but we do have a sessionId, we should try to refresh first
      if (typeof window !== "undefined" && sessionStorage.getItem("roomSessionId")) {
        const { getAccessToken } = await import("@/lib/axios");
        if (!getAccessToken()) {
          const api = (await import("@/lib/axios")).default;
          try {
            const refreshResponse = await api.post("/auth/refresh");
            const { setAccessToken } = await import("@/lib/axios");
            if (refreshResponse.data.accessToken) {
              setAccessToken(refreshResponse.data.accessToken);
            }
          } catch (e) {
            // Silently fail, let getCurrentUser handle the failure
          }
        }
      }

      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        logout,
        refreshUser: fetchUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}