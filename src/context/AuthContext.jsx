import { createContext, useContext, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);
const tokenKey = "realestate_token";
const userKey = "realestate_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem(userKey) || "null"));

  const save = (response) => {
    localStorage.setItem(tokenKey, response.accessToken);
    localStorage.setItem(userKey, JSON.stringify(response.user));
    setToken(response.accessToken);
    setUser(response.user);
    return response.user;
  };

  const value = useMemo(() => ({
    token, user,
    login: async (values) => save((await api.post("/auth/login", values)).data),
    register: async (values) => save((await api.post("/auth/register", values)).data),
    logout: () => {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
      setToken(null);
      setUser(null);
    },
    refreshUser: async () => {
      const response = await api.get("/users/me");
      localStorage.setItem(userKey, JSON.stringify(response.data));
      setUser(response.data);
    }
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

