import { createContext, useEffect, useState } from "react";

import { getCurrentUser, loginUser, registerUser } from "../api/auth.api";

const AuthContext = createContext(null);

const TOKEN_STORAGE_KEY = "jobtrace_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(function () {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    async function loadCurrentUser() {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (!storedToken) {
        setUser(null);
        setLoading(false);

        return;
      }

      try {
        const response = await getCurrentUser(storedToken);

        setToken(storedToken);
        setUser(response.data.user);
      } catch {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  async function refreshCurrentUser() {
    if (!token) {
      setUser(null);

      return;
    }

    const response = await getCurrentUser(token);
    setUser(response.data.user);
  }

  async function register(payload) {
    const response = await registerUser(payload);

    return response;
  }

  async function login(payload) {
    const response = await loginUser(payload);
    const receivedToken = response.data.token;
    const receivedUser = response.data.user;

    localStorage.setItem(TOKEN_STORAGE_KEY, receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);

    return response;
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  const value = {
    token,
    user,
    loading,
    isAuthenticated: Boolean(token && user),
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
