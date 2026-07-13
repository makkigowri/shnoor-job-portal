import { Routes, Route, Navigate } from "react-router-dom";
import AdminAuthProvider from "../context/AdminAuthContext";
import AdminProtectedRoute from "./AdminProtectedRoute";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminUsers from "../pages/admin/Users";
import AdminRecruiters from "../pages/admin/Recruiters";
import AdminJobs from "../pages/admin/Jobs";
import AdminApplications from "../pages/admin/Applications";
import AdminNotifications from "../pages/admin/Notifications";
import AdminSettings from "../pages/admin/Settings";

// Everything under /admin/* is handled here, wrapped in its own
// AdminAuthProvider so it never touches the user-facing AuthContext.
// NOTE: There is no "login" route here on purpose — Admin, Job Seeker, and
// Recruiter all authenticate from the single shared /login page. On
// successful admin login, the shared Login page mirrors the session into
// the localStorage keys this AdminAuthProvider reads, so everything below
// still works exactly as before.
const AdminRoutes = () => {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route
          path="dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <AdminProtectedRoute>
              <AdminUsers />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="recruiters"
          element={
            <AdminProtectedRoute>
              <AdminRecruiters />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="jobs"
          element={
            <AdminProtectedRoute>
              <AdminJobs />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="applications"
          element={
            <AdminProtectedRoute>
              <AdminApplications />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="notifications"
          element={
            <AdminProtectedRoute>
              <AdminNotifications />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <AdminProtectedRoute>
              <AdminSettings />
            </AdminProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AdminAuthProvider>
  );
};

export default AdminRoutes;