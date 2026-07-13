import { createContext, useState, useEffect } from "react";
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
  const login = async (credentials) => {
    const data = await loginUser(credentials);
    localStorage.setItem("shnoor_token", data.token);
    localStorage.setItem("shnoor_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };
  const register = async (payload) => {
    const data = await registerUser(payload);
    localStorage.setItem("shnoor_token", data.token);
    localStorage.setItem("shnoor_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };
  const logout = () => {
    localStorage.removeItem("shnoor_token");
    localStorage.removeItem("shnoor_user");
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;
