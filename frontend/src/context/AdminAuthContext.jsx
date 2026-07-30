import { createContext, useState, useEffect } from "react";
import { loginAdmin } from "../services/adminAuthService";
import socket from "../socket";

export const AdminAuthContext = createContext(null);

const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("shnoor_admin_user");
    const storedToken = localStorage.getItem("shnoor_admin_token");

    if (storedAdmin && storedToken) {
      const adminData = JSON.parse(storedAdmin);

      setAdmin(adminData);

      socket.emit("register", {
        userId: adminData.id,
        role: "admin",
      });
    }

    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await loginAdmin(credentials);

    localStorage.setItem("shnoor_admin_token", data.token);
    localStorage.setItem("shnoor_admin_user", JSON.stringify(data.admin));

    setAdmin(data.admin);

    socket.emit("register", {
      userId: data.admin.id,
      role: "admin",
    });

    return data.admin;
  };

  const logout = () => {
    localStorage.removeItem("shnoor_admin_token");
    localStorage.removeItem("shnoor_admin_user");

    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthProvider;