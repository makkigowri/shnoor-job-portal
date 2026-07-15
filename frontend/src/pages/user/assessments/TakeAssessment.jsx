import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import UserDashboardLayout from "../../../layouts/UserDashboardLayout";
import AssessmentTimer from "../../../components/user/AssessmentTimer";
import QuestionNavigator from "../../../components/user/QuestionNavigator";
import QuestionCard from "../../../components/user/QuestionCard";
import ProgressBar from "../../../components/user/ProgressBar";
import {
  getCandidateAssignmentById,
  startCandidateAssessment,
  saveAssessmentAnswers,
  submitCandidateAssessment,
  autoSubmitCandidateAssessment
} from "../../../services/assessmentService";
const AUTO_SAVE_INTERVAL_MS = 20000;
export default function TakeAssessment() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [assignment, setAssignment] = useState(location.state?.assignment || null);
  const [submission, setSubmission] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState(""); 
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const finalizedRef = useRef(false);
  const loadStartedRef = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const buildAnswersPayload = useCallback(
    () => Object.entries(answersRef.current).map(([questionId, answerText]) => ({
      questionId: Number(questionId),
      answerText
    })),
    []
  );
  useEffect(() => {
    if (loadStartedRef.current) return;
    loadStartedRef.current = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        let assignmentInfo = assignment;
        if (!assignmentInfo) {
          assignmentInfo = await getCandidateAssignmentById(assignmentId);
          setAssignment(assignmentInfo);
        }
        const data = await startCandidateAssessment(assignmentId);
        setSubmission(data.submission);
        setQuestions(data.questions || []);

        if (data.submission.status !== "In Progress") {
          navigate(`/user/assessments/result/${data.submission.id}`, { replace: true });
          return;
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to start this assessment right now");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assignmentId]);
  const deadline = useMemo(() => {
    if (!submission?.started_at) return null;
    const durationMinutes = assignment?.duration_minutes;
    if (!durationMinutes) return null;
    const durationDeadline = new Date(submission.started_at).getTime() + durationMinutes * 60 * 1000;
    const scheduledEnd = assignment?.scheduled_end ? new Date(assignment.scheduled_end).getTime() : null;
    const finalTime = scheduledEnd ? Math.min(durationDeadline, scheduledEnd) : durationDeadline;
    return new Date(finalTime);
  }, [submission, assignment]);
  useEffect(() => {
    if (!submission) return;
    const interval = setInterval(async () => {
      if (finalizedRef.current) return;
      const payload = buildAnswersPayload();
      if (payload.length === 0) return;
      setSaveStatus("saving");
      try {
        await saveAssessmentAnswers(submission.id, payload);
        setSaveStatus("saved");
      } catch {
        setSaveStatus("");
      }
    }, AUTO_SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [submission, buildAnswersPayload]);
  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };
  const handleAutoSubmit = useCallback(async () => {
    if (finalizedRef.current || !submission) return;
    finalizedRef.current = true;
    try {
      const data = await autoSubmitCandidateAssessment(submission.id, buildAnswersPayload());
      navigate(`/user/assessments/result/${data.submission.id}`, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Auto-submit failed. Please refresh and try again.");
      finalizedRef.current = false;
    }
  }, [submission, buildAnswersPayload, navigate]);
  const handleManualSubmit = async () => {
    if (finalizedRef.current || !submission) return;
    finalizedRef.current = true;
    setSubmitting(true);
    setError("");
    try {
      const data = await submitCandidateAssessment(submission.id, buildAnswersPayload());
      navigate(`/user/assessments/result/${data.submission.id}`, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to submit this assessment right now");
      setSubmitting(false);
      finalizedRef.current = false;
    }
  };
  if (loading) {
    return (
      <UserDashboardLayout>
        <p className="text-gray-500">Loading your assessment...</p>
      </UserDashboardLayout>
    );
  }
  if (error && !submission) {
    return (
      <UserDashboardLayout>
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>
      </UserDashboardLayout>
    );
  }
  if (!submission || questions.length === 0) {
    return (
      <UserDashboardLayout>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
          This assessment has no questions yet. Please contact the recruiter.
        </div>
      </UserDashboardLayout>
    );
  }
  const answeredCount = Object.values(answers).filter((v) => v !== undefined && v !== "").length;
  const currentQuestion = questions[currentIndex];
  return (
    <UserDashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#3E3A74]">{assignment?.assessment_title || "Assessment"}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "saved" && "All answers saved"}
            {saveStatus === "" && "Answers auto-save periodically"}
          </p>
        </div>
        {deadline && <AssessmentTimer deadline={deadline} onExpire={handleAutoSubmit} />}
      </div>
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>
      )}
      <div className="mt-6">
        <ProgressBar answered={answeredCount} total={questions.length} />
      </div>
      <div className="grid lg:grid-cols-[1fr_280px] gap-6 mt-6">
        <div className="space-y-6">
          <QuestionCard
            question={currentQuestion}
            index={currentIndex}
            total={questions.length}
            value={answers[currentQuestion.id]}
            onChange={(val) => handleAnswerChange(currentQuestion.id, val)}
          />
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="px-6 py-3 rounded-xl border border-gray-300 font-medium hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                className="px-6 py-3 rounded-xl bg-[#7393D3] hover:bg-[#5E84D6] text-white font-medium transition"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={() => setConfirmSubmit(true)}
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Assessment"}
              </button>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <QuestionNavigator
            questions={questions}
            answeredMap={answers}
            currentIndex={currentIndex}
            onNavigate={setCurrentIndex}
          />
          <button
            onClick={() => setConfirmSubmit(true)}
            disabled={submitting}
            className="w-full px-5 py-3 rounded-xl bg-[#3E3A74] hover:bg-[#2f2c5a] text-white font-semibold transition disabled:opacity-60"
          >
            Submit Assessment
          </button>
        </div>
      </div>
      {confirmSubmit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-[#3E3A74]">Submit Assessment?</h3>
            <p className="text-gray-600 mt-2 text-sm">
              You have answered {answeredCount} of {questions.length} questions. Once submitted, you cannot
              change your answers.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmSubmit(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                Keep Working
              </button>
              <button
                onClick={() => {
                  setConfirmSubmit(false);
                  handleManualSubmit();
                }}
                className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </UserDashboardLayout>
  );
}