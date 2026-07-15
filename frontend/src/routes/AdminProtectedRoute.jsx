import { Navigate } from "react-router-dom";
import useAdminAuth from "../hooks/useAdminAuth";
const AdminProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }
  if (!admin) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
export default AdminProtectedRoute;