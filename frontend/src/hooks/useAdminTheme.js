import { useContext } from "react";
import { AdminThemeContext } from "../context/AdminThemeContext";
const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error("useAdminTheme must be used within an AdminThemeProvider");
  }
  return context;
};
export default useAdminTheme;
