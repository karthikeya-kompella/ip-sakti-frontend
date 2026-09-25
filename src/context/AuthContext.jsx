import { createContext, useContext, useEffect, useState } from "react";
import * as api from "../services/api";
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [token, setToken] = useState(api.getToken());
  useEffect(() => { const f = () => setToken(null); addEventListener("auth:expired", f); return () => removeEventListener("auth:expired", f); }, []);
  const login = async (e, p) => setToken(await api.login(e, p));
  const logout = () => { api.logout(); setToken(null); };
  return <Ctx.Provider value={{ token, email: localStorage.getItem("ipsakti_email"), isAuthenticated: !!token, loading: false, login, logout }}>{children}</Ctx.Provider>;
}
