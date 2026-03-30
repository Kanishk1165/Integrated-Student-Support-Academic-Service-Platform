import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await authAPI.getMe();
        if (isMounted) setUser(res.data.user);
      } catch {
        localStorage.removeItem("token");
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    
    // If faculty registration is pending, don't set token or user
    if (res.data.isPending) {
      return { isPending: true, user: res.data.user };
    }
    
    // Student registration - set token and user
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
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
