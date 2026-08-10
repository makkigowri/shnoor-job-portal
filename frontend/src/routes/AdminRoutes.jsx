import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminAuthProvider from "../context/AdminAuthContext";
import AdminThemeProvider from "../context/AdminThemeContext";
import AdminProtectedRoute from "./AdminProtectedRoute";
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("../pages/admin/Users"));
const AdminRecruiters = lazy(() => import("../pages/admin/Recruiters"));
const AdminJobs = lazy(() => import("../pages/admin/Jobs"));
const AdminApplications = lazy(() => import("../pages/admin/Applications"));
const AdminNotifications = lazy(() => import("../pages/admin/Notifications"));
const AdminSettings = lazy(() => import("../pages/admin/Settings"));
const AdminAssessmentManagement = lazy(() => import("../pages/admin/AssessmentManagement"));
const AdminAssessmentAnalytics = lazy(() => import("../pages/admin/AssessmentAnalytics"));
const AdminAssessmentReports = lazy(() => import("../pages/admin/AssessmentReports"));
const AdminPageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-indigo-600 animate-spin" />
  </div>
);
const AdminRoutes = () => {
  return (
    <AdminAuthProvider>
    <AdminThemeProvider>
      <Suspense fallback={<AdminPageLoader />}>
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
      </Suspense>
    </AdminThemeProvider>
    </AdminAuthProvider>
  );
};
export default AdminRoutes;