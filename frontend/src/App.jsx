import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoutes from "./routes/AdminRoutes";
import ChatbotWidget from "./components/chatbot/ChatbotWidget";
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/user/Dashboard"));
const Profile = lazy(() => import("./pages/user/Profile"));
const Resume = lazy(() => import("./pages/user/Resume"));
const SearchJobs = lazy(() => import("./pages/user/SearchJobs"));
const SavedJobs = lazy(() => import("./pages/user/SavedJobs"));
const AppliedJobs = lazy(() => import("./pages/user/AppliedJobs"));
const Notifications = lazy(() => import("./pages/user/Notifications"));
const Settings = lazy(() => import("./pages/user/Settings"));
const MyAssessments = lazy(() => import("./pages/user/assessments/MyAssessments"));
const CandidateAssessmentDetails = lazy(() => import("./pages/user/assessments/AssessmentDetails"));
const TakeAssessment = lazy(() => import("./pages/user/assessments/TakeAssessment"));
const AssessmentResult = lazy(() => import("./pages/user/assessments/AssessmentResult"));
const AIInterview = lazy(() => import("./pages/user/interview/AIInterview"));
const MeetingRoom = lazy(() => import("./pages/common/MeetingRoom"));
const RecruiterDashboard = lazy(() => import("./pages/recruiter/Dashboard"));
const CompanyProfile = lazy(() => import("./pages/recruiter/CompanyProfile"));
const PostJob = lazy(() => import("./pages/recruiter/PostJob"));
const EditJob = lazy(() => import("./pages/recruiter/EditJob"));
const MyJobs = lazy(() => import("./pages/recruiter/MyJobs"));
const Applicants = lazy(() => import("./pages/recruiter/Applicants"));
const ATSChecker = lazy(() => import("./pages/recruiter/ATSChecker"));
const Interviews = lazy(() => import("./pages/recruiter/Interviews"));
const Analytics = lazy(() => import("./pages/recruiter/Analytics"));
const RecruiterNotifications = lazy(() => import("./pages/recruiter/Notifications"));
const RecruiterSettings = lazy(() => import("./pages/recruiter/Settings"));
const AssessmentDashboard = lazy(() => import("./pages/recruiter/assessments/AssessmentDashboard"));
const CreateAssessment = lazy(() => import("./pages/recruiter/assessments/CreateAssessment"));
const EditAssessment = lazy(() => import("./pages/recruiter/assessments/EditAssessment"));
const AssessmentDetails = lazy(() => import("./pages/recruiter/assessments/AssessmentDetails"));
const AssessmentResults = lazy(() => import("./pages/recruiter/assessments/AssessmentResults"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./pages/legal/TermsAndConditions"));
const CookiesPolicy = lazy(() => import("./pages/legal/CookiesPolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-indigo-600 animate-spin" />
  </div>
);
const App = () => {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
      <ChatbotWidget />
    </>
  );
};
export default App;