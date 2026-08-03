import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { loginUser, registerUser } from "../services/authService";
export const AuthContext = createContext(null);
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const storedUser = localStorage.getItem("shnoor_user");
    const storedToken = localStorage.getItem("shnoor_token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);
  const login = useCallback(async (credentials) => {
    const data = await loginUser(credentials);
    localStorage.setItem("shnoor_token", data.token);
    localStorage.setItem("shnoor_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);
  const register = useCallback(async (payload) => {
    const data = await registerUser(payload);
    localStorage.setItem("shnoor_token", data.token);
    localStorage.setItem("shnoor_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);
  const logout = useCallback(() => {
    localStorage.removeItem("shnoor_token");
    localStorage.removeItem("shnoor_user");
    setUser(null);
  }, []);
  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;
