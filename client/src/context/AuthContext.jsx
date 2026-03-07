import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { supabase } from "../services/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const syncSupabaseToBackend = async (session) => {
    const accessToken = session?.access_token;
    if (!accessToken) return null;
    const res = await authAPI.syncSupabaseSession(accessToken);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (session) {
          await syncSupabaseToBackend(session);
        } else {
          localStorage.removeItem("token");
          if (isMounted) setUser(null);
        }
      } catch {
        localStorage.removeItem("token");
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initialize();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session) {
          await syncSupabaseToBackend(session);
        } else {
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return await syncSupabaseToBackend(data.session);
  };

  const register = async (formData) => {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
          role: formData.role,
          rollNumber: formData.rollNumber,
          department: formData.department,
          year: formData.year,
          phone: formData.phone,
        },
      },
    });

    if (error) throw error;

    if (!data.session) {
      throw new Error("Registration successful. Please verify your email before logging in.");
    }

    return await syncSupabaseToBackend(data.session);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = (updates) => setUser(u => ({ ...u, ...updates }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
