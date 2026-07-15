import { createContext, useEffect, useState } from "react";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    async function loadCurrentUser() {
      try {
        const response = await getCurrentUser();

        setUser(response.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  async function refreshCurrentUser() {
    try {
      const response = await getCurrentUser();

      setUser(response.data.user);

      return response;
    } catch (error) {
      setUser(null);

      throw error;
    }
  }

  async function register(payload) {
    const response = await registerUser(payload);

    return response;
  }

  async function login(payload) {
    const response = await loginUser(payload);

    setUser(response.data.user);

    return response;
  }

  async function logout() {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    register,
    login,
    logout,
    refreshCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
