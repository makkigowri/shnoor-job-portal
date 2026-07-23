import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/user/Dashboard";
import Profile from "./pages/user/Profile";
import Resume from "./pages/user/Resume";
import SearchJobs from "./pages/user/SearchJobs";
import SavedJobs from "./pages/user/SavedJobs";
import AppliedJobs from "./pages/user/AppliedJobs";
import Notifications from "./pages/user/Notifications";
import Settings from "./pages/user/Settings";
import MyAssessments from "./pages/user/assessments/MyAssessments";
import CandidateAssessmentDetails from "./pages/user/assessments/AssessmentDetails";
import TakeAssessment from "./pages/user/assessments/TakeAssessment";
import AssessmentResult from "./pages/user/assessments/AssessmentResult";
import AIInterview from "./pages/user/interview/AIInterview";
import MeetingRoom from './pages/common/MeetingRoom';
import RecruiterDashboard from "./pages/recruiter/Dashboard";
import CompanyProfile from "./pages/recruiter/CompanyProfile";
import PostJob from "./pages/recruiter/PostJob";
import EditJob from "./pages/recruiter/EditJob";
import MyJobs from "./pages/recruiter/MyJobs";
import Applicants from "./pages/recruiter/Applicants";
import ATSChecker from "./pages/recruiter/ATSChecker";
import Interviews from "./pages/recruiter/Interviews";
import Analytics from "./pages/recruiter/Analytics";
import RecruiterNotifications from "./pages/recruiter/Notifications";
import RecruiterSettings from "./pages/recruiter/Settings";
import AssessmentDashboard from "./pages/recruiter/assessments/AssessmentDashboard";
import CreateAssessment from "./pages/recruiter/assessments/CreateAssessment";
import EditAssessment from "./pages/recruiter/assessments/EditAssessment";
import AssessmentDetails from "./pages/recruiter/assessments/AssessmentDetails";
import AssessmentResults from "./pages/recruiter/assessments/AssessmentResults";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsAndConditions from "./pages/legal/TermsAndConditions";
import CookiesPolicy from "./pages/legal/CookiesPolicy";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoutes from "./routes/AdminRoutes";
import ChatbotWidget from "./components/chatbot/ChatbotWidget";
const App = () => {
  return (
    <>
      <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/cookies-policy" element={<CookiesPolicy />} />
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRoles={["jobseeker"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/profile"
        element={
          <ProtectedRoute allowedRoles={["jobseeker"]}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/resume"
        element={
          <ProtectedRoute allowedRoles={["jobseeker"]}>
            <Resume />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/jobs"
        element={
          <ProtectedRoute allowedRoles={["jobseeker"]}>
            <SearchJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/saved"
        element={
          <ProtectedRoute allowedRoles={["jobseeker"]}>
            <SavedJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/applied"
        element={
          <ProtectedRoute allowedRoles={["jobseeker"]}>
            <AppliedJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/notifications"
        element={
          <ProtectedRoute allowedRoles={["jobseeker"]}>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/settings"
        element={
          <ProtectedRoute allowedRoles={["jobseeker"]}>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/assessments"
        element={
          <ProtectedRoute allowedRoles={["jobseeker"]}>
            <MyAssessments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/assessments/:assignmentId"
        element={
          <ProtectedRoute allowedRoles={["jobseeker"]}>
            <CandidateAssessmentDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/assessments/:assignmentId/take"
        element={
          <ProtectedRoute allowedRoles={["jobseeker"]}>
            <TakeAssessment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/assessments/result/:submissionId"
        element={
          <ProtectedRoute allowedRoles={["jobseeker"]}>
            <AssessmentResult />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/ai-interview/:interviewId"
        element={
          <ProtectedRoute allowedRoles={["jobseeker"]}>
            <AIInterview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meeting/:roomName"
        element={
          <ProtectedRoute allowedRoles={["jobseeker", "recruiter"]}>
            <MeetingRoom />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/dashboard"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <RecruiterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/company-profile"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <CompanyProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/post-job"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <PostJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/my-jobs"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <MyJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/edit-job/:id"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <EditJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/applicants"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <Applicants />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/ats-checker"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <ATSChecker />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/interviews"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <Interviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/analytics"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/notifications"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <RecruiterNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/settings"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <RecruiterSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/assessments"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <AssessmentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/assessments/create"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <CreateAssessment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/assessments/:id"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <AssessmentDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/assessments/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <EditAssessment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/assessments/:id/results"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <AssessmentResults />
          </ProtectedRoute>
        }
      />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="*" element={<NotFound />} />
      </Routes>
      <ChatbotWidget />
    </>
  );
};
export default App;