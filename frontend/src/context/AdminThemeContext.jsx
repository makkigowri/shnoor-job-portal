import { createContext, useState, useEffect, useCallback, useMemo } from "react";
const DARK_MODE_STORAGE_KEY = "shnoor_admin_dark_mode";
export const AdminThemeContext = createContext(null);
const AdminThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem(DARK_MODE_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    localStorage.setItem(DARK_MODE_STORAGE_KEY, String(darkMode));
  }, [darkMode]);
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);
  const value = useMemo(() => ({ darkMode, toggleDarkMode }), [darkMode, toggleDarkMode]);
  return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>;
};
export default AdminThemeProvider;
