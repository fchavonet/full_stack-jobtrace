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

          window.location.href = "/full_stack-jobtrace/dashboard";
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

  // Google OAuth login.
  async function googleLogin() {
    const result = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + "/full_stack-jobtrace/dashboard" } });

    return result;
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, resetPasswordMode, login, signup, logout, updatePassword, googleLogin, setResetPasswordMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
