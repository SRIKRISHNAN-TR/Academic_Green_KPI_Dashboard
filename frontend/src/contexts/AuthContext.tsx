import React, { createContext, useContext, useState, ReactNode } from "react";
import { authApi, type AuthResponse } from "@/services/api";

export type UserRole = "admin" | "data-entry" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map backend role to frontend role
const mapRole = (backendRole: string): UserRole => {
  if (backendRole === "admin") return "admin";
  if (backendRole === "data-entry") return "data-entry";
  return "viewer";
};

const buildUser = (res: AuthResponse): User => ({
  id: res.user.id,
  name: res.user.username,
  email: res.user.email,
  role: mapRole(res.user.role),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("greenKpiUser");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem("greenKpiToken", res.token);
      const u = buildUser(res);
      setUser(u);
      localStorage.setItem("greenKpiUser", JSON.stringify(u));
      return true;
    } catch {
      throw new Error("Invalid credentials");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("greenKpiUser");
    localStorage.removeItem("greenKpiToken");
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout }}
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