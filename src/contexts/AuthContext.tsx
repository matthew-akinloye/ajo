/**
 * àjó Auth Context
 * Manages user authentication state and session
 */

import { apiService } from "@/services/api.service";
import {
  LoginRequest,
  SignupRequest,
  UserOut,
  UserUpdateRequest,
} from "@/services/api.types";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: UserOut | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: UserUpdateRequest) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        await (apiService as any).restoreSession?.();
        const storedUser = await (apiService as any).getMe?.().catch(() => null);
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await apiService.login(data);
    setUser(response.user);
  };

  const signup = async (data: SignupRequest) => {
    const response = await apiService.signup(data);
    setUser(response.user);
  };

  const logout = async () => {
    await (apiService as any).clearSession?.();
    setUser(null);
  };

  const updateUser = async (data: UserUpdateRequest) => {
    if (!user) return;
    const updatedUser = await apiService.updateMe(data);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateUser,
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
