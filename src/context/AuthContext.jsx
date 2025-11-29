import { createContext, useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetPasswordMode, setResetPasswordMode] = useState(false);

  // Load current session on mount and subscribe to auth state changes.
  useEffect(function () {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();

      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
      }

      setLoading(false);
    }

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      function (event, session) {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === "PASSWORD_RECOVERY") {
          setResetPasswordMode(true);

          window.location.href = "/full_stack-jobtrace/dashboard/settings#password";
        }
      }
    );

    return function () { { listener.subscription.unsubscribe(); } };
  }, []);

  // Email and password login.
  async function login(email, password) {
    const result = await supabase.auth.signInWithPassword({ email, password });

    return result;
  }

  // Account creation.
  async function signup(email, password) {
    const result = await supabase.auth.signUp({ email, password });

    return result;
  }

  // User sign out.
  async function logout() {
    await supabase.auth.signOut();
  }

  // Update current user password.
  async function updatePassword(newPassword) {
    const result = await supabase.auth.updateUser({ password: newPassword });

    return result;
  }

  // Update user profile metadata (firstname, lastname).
  async function updateProfile(first_name, last_name) {
    const metadata = {};

    if (typeof first_name === "string") {
      const trimmedFirst = first_name.trim();

      if (trimmedFirst.length > 0) {
        metadata.first_name = trimmedFirst;
      } else {
        metadata.first_name = null;
      }
    }

    if (typeof last_name === "string") {
      const trimmedLast = last_name.trim();

      if (trimmedLast.length > 0) {
        metadata.last_name = trimmedLast;
      } else {
        metadata.last_name = null;
      }
    }

    const { data, error } = await supabase.auth.updateUser({
      data: metadata
    });

    if (!error && data && data.user) {
      setUser(data.user);
    }

    return { data, error };
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, resetPasswordMode, login, signup, logout, updatePassword, updateProfile, setResetPasswordMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
