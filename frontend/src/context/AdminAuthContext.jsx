import { createContext, useState, useEffect } from "react";
import { loginAdmin } from "../services/adminAuthService";
export const AdminAuthContext = createContext(null);
const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const storedAdmin = localStorage.getItem("shnoor_admin_user");
    const storedToken = localStorage.getItem("shnoor_admin_token");
    if (storedAdmin && storedToken) {
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);
  const login = async (credentials) => {
    const data = await loginAdmin(credentials);
    localStorage.setItem("shnoor_admin_token", data.token);
    localStorage.setItem("shnoor_admin_user", JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data.admin;
  };
  const logout = () => {
    localStorage.removeItem("shnoor_admin_token");
    localStorage.removeItem("shnoor_admin_user");
    setAdmin(null);
  };
  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
export default AdminAuthProvider;
