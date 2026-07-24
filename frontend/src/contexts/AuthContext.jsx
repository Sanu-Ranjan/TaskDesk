import { createContext, useContext, useEffect, useState } from "react";

import { API_ENDPOINTS } from "../constants/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function request(url, options = {}) {
    const res = await fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(body?.message || "Request failed");
    }
    return body;
  }

  async function checkAuth() {
    try {
      const body = await request(API_ENDPOINTS.AUTH.ME);
      setUser(body.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  async function signup({ name, email, password }) {
    await request(API_ENDPOINTS.AUTH.SIGNUP, {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  }

  async function login({ email, password }) {
    await request(API_ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await checkAuth();
  }

  async function logout() {
    try {
      await request(API_ENDPOINTS.AUTH.LOGOUT, { method: "POST" });
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signup, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
