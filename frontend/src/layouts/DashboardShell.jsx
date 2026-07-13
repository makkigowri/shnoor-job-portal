import Logo from "../components/common/Logo";
import Button from "../components/common/Button";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
const DashboardShell = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="text-sm text-body hidden sm:inline">
              {user?.fullname} · <span className="capitalize">{user?.role}</span>
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10">{children}</main>
    </div>
  );
};
export default DashboardShell;
