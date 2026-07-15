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
import AdminAssessmentManagement from "../pages/admin/AssessmentManagement";
import AdminAssessmentAnalytics from "../pages/admin/AssessmentAnalytics";
import AdminAssessmentReports from "../pages/admin/AssessmentReports";
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
          path="assessments"
          element={
            <AdminProtectedRoute>
              <AdminAssessmentManagement />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="assessments/analytics"
          element={
            <AdminProtectedRoute>
              <AdminAssessmentAnalytics />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="assessments/reports"
          element={
            <AdminProtectedRoute>
              <AdminAssessmentReports />
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