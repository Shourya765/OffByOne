import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getToken } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user: u } = await api.me();
      setUser(u);
    } catch {
      localStorage.removeItem("ef_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem("ef_token", data.token);
    setUser(data.user);
    return data;
  };

  const register = async (email, password, name, options = {}) => {
    const data = await api.register({
      email,
      password,
      name,
      ...(options.asOrganizer ? { asOrganizer: true } : {}),
    });
    localStorage.setItem("ef_token", data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("ef_token");
    setUser(null);
  };

  const setInterests = async (interests) => {
    const { user: u } = await api.updateInterests(interests);
    setUser(u);
    return u;
  };

  const registerOrganizer = (email, password, name) => register(email, password, name, { asOrganizer: true });

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, registerOrganizer, logout, setInterests, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
