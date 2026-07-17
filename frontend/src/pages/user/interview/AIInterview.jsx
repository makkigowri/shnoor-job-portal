import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import UserDashboardLayout from "../../../layouts/UserDashboardLayout";
import {
  getAiInterview,
  startAiInterview,
  submitAiInterviewAnswer,
  reportAiInterviewViolation,
  beaconAutoSubmitAiInterview
} from "../../../services/aiInterviewService";

const SpeechRecognitionAPI =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

const QUESTION_TIME_LIMIT_SECONDS = 120;
const DEFAULT_TOTAL_QUESTIONS = 5;
const DEFAULT_TOTAL_MARKS = 100;
const MARKS_PER_QUESTION = 20;

const RESULT_COPY = {
  Selected: {
    heading: "Congratulations!",
    status: "Selected",
    nextStep: "A job offer has been sent to your registered email."
  },
  "Technical Interview": {
    heading: "Congratulations!",
    status: "Shortlisted for Technical Interview",
    nextStep: "Our recruitment team will contact you shortly to schedule your Technical Interview."
  },
  Rejected: {
    heading: "Thank you for attending.",
    status: "Not Selected",
    nextStep: "Keep an eye on your dashboard for other matching opportunities."
  }
};

const INSTRUCTIONS = [
  "Camera access is compulsory.",
  "Microphone access is compulsory.",
  "Stay in full screen throughout the interview.",
  "Do not refresh the page.",
  "Do not switch tabs.",
  "Stable internet connection is recommended.",
  "Every question has a 2 minute limit.",
  `There are only ${DEFAULT_TOTAL_QUESTIONS} questions.`,
  `Total Marks: ${DEFAULT_TOTAL_MARKS}.`,
  `Each Question carries ${MARKS_PER_QUESTION} marks.`,
  "AI evaluates your technical knowledge, communication and pronunciation.",
  "Interview cannot be paused.",
  "Your interview will be automatically submitted if rules are violated."
];

const formatTimer = (totalSeconds) => {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default function AIInterview() {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [phase, setPhase] = useState("loading");
  const [error, setError] = useState("");
  const [liveCaption, setLiveCaption] = useState("");
  const [micSupported, setMicSupported] = useState(true);
  const [result, setResult] = useState(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(QUESTION_TIME_LIMIT_SECONDS);
  const [cameraError, setCameraError] = useState("");
  const [requestingPermissions, setRequestingPermissions] = useState(false);
  const [violationWarning, setViolationWarning] = useState("");
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [cameraReady, setCameraReady] = useState(false);

  const currentQuestionRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const timerRef = useRef(null);
  const questionTimerRef = useRef(null);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const inSessionRef = useRef(false);
  const forceAdvanceRef = useRef(null);
  const interviewIdRef = useRef(interviewId);

  useEffect(() => {
    interviewIdRef.current = interviewId;
  }, [interviewId]);

  useEffect(() => {
    setMicSupported(Boolean(SpeechRecognitionAPI));
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, liveCaption]);

  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && cameraStreamRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current;
      setCameraReady(true);
    }
  }, [phase]);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    const active = ["speaking", "listening", "thinking"].includes(phase);
    inSessionRef.current = active;
    if (active) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase === "listening") {
      setQuestionTimeLeft(QUESTION_TIME_LIMIT_SECONDS);
      questionTimerRef.current = setInterval(() => {
        setQuestionTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(questionTimerRef.current);
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch (e) {
                if (forceAdvanceRef.current) forceAdvanceRef.current();
              }
            } else if (forceAdvanceRef.current) {
              forceAdvanceRef.current();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(questionTimerRef.current);
  }, [phase]);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const finishSessionMedia = useCallback(() => {
    clearInterval(timerRef.current);
    clearInterval(questionTimerRef.current);
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    setCameraReady(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
      }
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    exitFullscreen();
  }, [exitFullscreen]);

  useEffect(() => {
    const onFullscreenChange = async () => {
      if (!inSessionRef.current) return;
      if (!document.fullscreenElement) {
        try {
          const data = await reportAiInterviewViolation(interviewIdRef.current, "fullscreen");
          if (data.autoSubmitted) {
            inSessionRef.current = false;
            finishSessionMedia();
            setInterview(data.interview);
            setResult(data.interview);
            setPhase("complete");
          } else {
            setViolationWarning(
              "Warning: you exited full screen. Leaving full screen again will auto-submit your interview."
            );
            document.documentElement.requestFullscreen().catch(() => {});
          }
        } catch (err) {
        }
      }
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [finishSessionMedia]);

  useEffect(() => {
    const onVisibilityChange = async () => {
      if (!inSessionRef.current) return;
      if (document.hidden) {
        try {
          const data = await reportAiInterviewViolation(interviewIdRef.current, "tab");
          if (data.autoSubmitted) {
            inSessionRef.current = false;
            finishSessionMedia();
            setInterview(data.interview);
            setResult(data.interview);
            setPhase("complete");
          } else {
            setViolationWarning(
              "Warning: you switched tabs. Switching tabs again will auto-submit your interview."
            );
          }
        } catch (err) {
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [finishSessionMedia]);

  useEffect(() => {
    const onBeforeUnload = () => {
      if (inSessionRef.current) {
        beaconAutoSubmitAiInterview(interviewIdRef.current, "page_exit");
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAiInterview(interviewId);
        setInterview(data.interview);
        if (data.interview.status === "Completed") {
          setResult(data.interview);
          setTranscript(
            (data.questions || []).flatMap((q) => [
              { speaker: "ai", text: q.question_text },
              ...(q.candidate_answer ? [{ speaker: "candidate", text: q.candidate_answer }] : [])
            ])
          );
          setQuestionsAnswered(data.interview.total_questions || 0);
          setPhase("complete");
        } else {
          setPhase("intro");
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load this AI interview");
        setPhase("error");
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  const speak = useCallback((text) => {
    return new Promise((resolve) => {
      if (!("speechSynthesis" in window)) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = resolve;
      utterance.onerror = resolve;
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const listen = useCallback(() => {
    return new Promise((resolve) => {
      if (!SpeechRecognitionAPI) {
        resolve("");
        return;
      }
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;

      let finalTranscript = "";
      let silenceTimer = null;

      const stopAndResolve = () => {
        clearTimeout(silenceTimer);
        try {
          recognition.stop();
        } catch (e) {
        }
      };

      recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += `${text} `;
          } else {
            interim += text;
          }
        }
        setLiveCaption(finalTranscript + interim);
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(stopAndResolve, 4000);
      };

      recognition.onerror = () => {
        clearTimeout(silenceTimer);
        resolve(finalTranscript.trim());
      };

      recognition.onend = () => {
        clearTimeout(silenceTimer);
        resolve(finalTranscript.trim());
      };

      recognition.start();
      silenceTimer = setTimeout(stopAndResolve, QUESTION_TIME_LIMIT_SECONDS * 1000);
    });
  }, []);

  const runQuestionCycle = useCallback(
    async (question) => {
      currentQuestionRef.current = question;
      setTranscript((prev) => [...prev, { speaker: "ai", text: question.question_text }]);
      setPhase("speaking");
      await speak(question.question_text);
      if (!inSessionRef.current) return;

      setPhase("listening");
      setLiveCaption("");
      const answerText = await listen();
      setLiveCaption("");
      setPhase("thinking");

      if (!inSessionRef.current) return;

      setTranscript((prev) => [
        ...prev,
        { speaker: "candidate", text: answerText || "(No answer captured - please try speaking again next time)" }
      ]);

      try {
        const data = await submitAiInterviewAnswer(interviewId, question.id, answerText);
        setQuestionsAnswered((prev) => prev + 1);
        if (data.isComplete) {
          setInterview(data.interview);
          setResult(data.interview);
          setPhase("complete");
          finishSessionMedia();
          await speak("Thank you. That completes your AI interview. Your results are ready.");
        } else {
          await runQuestionCycle(data.question);
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Something went wrong while processing your answer");
        setPhase("error");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [interviewId, finishSessionMedia]
  );

  useEffect(() => {
    forceAdvanceRef.current = () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
        }
      }
    };
  }, []);

  const handleStart = async () => {
    setError("");
    setCameraError("");
    setRequestingPermissions(true);
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err) {
      setRequestingPermissions(false);
      setCameraError("Camera and microphone access are required to continue.");
      return;
    }
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      stream.getTracks().forEach((track) => track.stop());
      setRequestingPermissions(false);
      setCameraError("Full screen access is required to continue. Please allow full screen and try again.");
      return;
    }
    setRequestingPermissions(false);
    cameraStreamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      setCameraReady(true);
    }
    setViolationWarning("");
    setPhase("thinking");
    inSessionRef.current = true;
    try {
      const data = await startAiInterview(interviewId);
      setInterview(data.interview);
      await speak(
        `Hello! I'm your AI interviewer for the ${data.interview.job_role || "role"} position. Let's get started.`
      );
      await runQuestionCycle(data.question);
    } catch (err) {
      inSessionRef.current = false;
      setError(err?.response?.data?.message || "Unable to start the AI interview");
      setPhase("error");
      finishSessionMedia();
    }
  };

  const totalQuestions = interview?.total_questions || DEFAULT_TOTAL_QUESTIONS;
  const totalMarks = interview?.total_marks || DEFAULT_TOTAL_MARKS;
  const estimatedMinutes = totalQuestions * (QUESTION_TIME_LIMIT_SECONDS / 60);
  const progressPercent =
    totalQuestions > 0 ? Math.min(100, Math.round((questionsAnswered / totalQuestions) * 100)) : 0;

  if (phase === "loading") {
    return (
      <UserDashboardLayout>
        <p className="text-gray-500">Loading AI interview...</p>
      </UserDashboardLayout>
    );
  }

  if (phase === "error") {
    return (
      <UserDashboardLayout>
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">
          {error || "Something went wrong."}
        </div>
        <Link to="/user/assessments" className="mt-4 inline-block text-[#7393D3] font-semibold">
          ← Back to Assessments
        </Link>
      </UserDashboardLayout>
    );
  }

  const inSession = ["speaking", "listening", "thinking"].includes(phase);
  const currentQuestionNumber = Math.min(questionsAnswered + 1, totalQuestions);
  const jobRoleLabel = interview?.job_title || interview?.job_role || "Interview";

  const evaluationStatusLabel =
    phase === "speaking"
      ? "Question in progress"
      : phase === "listening"
      ? "Awaiting your answer"
      : phase === "thinking"
      ? "Evaluating your response..."
      : "Standing by";

  if (inSession) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-gray-200 bg-white shadow-sm shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#3E3A74] text-white flex items-center justify-center font-bold shrink-0">
              AI
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#3E3A74] truncate">{jobRoleLabel}</p>
              <p className="text-xs text-gray-500">
                Question {currentQuestionNumber} of {totalQuestions}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 w-52">
            <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-[#7393D3] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 tabular-nums">{progressPercent}%</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Question</p>
              <p
                className={`text-base sm:text-lg font-bold tabular-nums ${
                  questionTimeLeft <= 20 ? "text-red-600" : "text-[#3E3A74]"
                }`}
              >
                {formatTimer(questionTimeLeft)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Overall</p>
              <p className="text-base sm:text-lg font-bold text-[#3E3A74] tabular-nums">
                {formatTimer(elapsedSeconds)}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-red-500 animate-pulse"}`}
              />
              <span className="hidden sm:inline text-xs font-medium text-gray-500">
                {isOnline ? "Connected" : "Reconnecting..."}
              </span>
            </div>
          </div>
        </header>

        {violationWarning && (
          <div className="bg-red-50 border-b border-red-200 text-red-700 text-sm font-medium text-center py-2 px-4 shrink-0">
            {violationWarning}
          </div>
        )}

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-6 overflow-hidden min-h-0">
          <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Your Camera</p>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                {!cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                    Starting camera...
                  </div>
                )}
                <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  You
                </span>
                <span className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  REC
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div
                  className={`flex items-center justify-between rounded-xl px-3 py-2 border ${
                    cameraReady ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <span className="text-sm text-gray-600">Camera</span>
                  <span
                    className={`text-xs font-semibold ${cameraReady ? "text-emerald-700" : "text-gray-400"}`}
                  >
                    {cameraReady ? "Active" : "Connecting"}
                  </span>
                </div>
                <div
                  className={`flex items-center justify-between rounded-xl px-3 py-2 border ${
                    phase === "listening" ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <span className="text-sm text-gray-600">Microphone</span>
                  <span
                    className={`text-xs font-semibold ${
                      phase === "listening" ? "text-emerald-700" : "text-gray-400"
                    }`}
                  >
                    {phase === "listening" ? "Listening" : "Idle"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-4 min-h-0">
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-0">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
                {phase === "speaking" && (
                  <span className="absolute inset-0 rounded-full bg-[#3E3A74]/25 animate-ping" />
                )}
                {phase === "listening" && (
                  <span className="absolute inset-0 rounded-full bg-emerald-400/25 animate-ping" />
                )}
                {phase === "thinking" && (
                  <span className="absolute inset-0 rounded-full border-4 border-dashed border-gray-300 animate-spin" />
                )}
                <div
                  className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg transition-colors duration-300 ${
                    phase === "speaking"
                      ? "bg-[#3E3A74]"
                      : phase === "listening"
                      ? "bg-emerald-500"
                      : "bg-gray-400"
                  }`}
                >
                  AI
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    phase === "speaking"
                      ? "bg-[#3E3A74] animate-pulse"
                      : phase === "listening"
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-gray-300 animate-pulse"
                  }`}
                />
                <p className="font-semibold text-[#3E3A74]">
                  {phase === "speaking" && "AI is speaking..."}
                  {phase === "listening" && "Listening to your answer..."}
                  {phase === "thinking" && "Evaluating and preparing next question..."}
                </p>
              </div>

              {currentQuestionRef.current && (
                <div className="mt-6 max-w-xl bg-[#EEF2FF] rounded-2xl px-6 py-5 text-left">
                  <p className="text-xs font-semibold text-[#7393D3] uppercase tracking-wide">
                    Current Question
                  </p>
                  <p className="mt-2 text-[#3E3A74] font-medium">
                    {currentQuestionRef.current.question_text}
                  </p>
                </div>
              )}

              {phase === "listening" && liveCaption && (
                <p className="mt-4 max-w-xl text-sm text-gray-500 italic">"{liveCaption}"</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Live Transcript
                </p>
                <span className="text-[11px] font-semibold text-[#7393D3] bg-[#EEF2FF] px-2 py-1 rounded-full">
                  {evaluationStatusLabel}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
                {transcript.map((entry, idx) => (
                  <div key={idx} className={`flex ${entry.speaker === "ai" ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                        entry.speaker === "ai" ? "bg-[#EEF2FF] text-[#3E3A74]" : "bg-[#7393D3] text-white"
                      }`}
                    >
                      <p className="text-[10px] font-semibold mb-1 opacity-70">
                        {entry.speaker === "ai" ? "AI Question" : "Your Answer"}
                      </p>
                      <p>{entry.text}</p>
                    </div>
                  </div>
                ))}
                {phase === "listening" && liveCaption && (
                  <div className="flex justify-end">
                    <div className="max-w-[90%] rounded-xl px-3 py-2 text-sm bg-[#7393D3]/60 text-white">
                      <p className="text-[10px] font-semibold mb-1 opacity-70">Your Answer (live)</p>
                      <p>{liveCaption}</p>
                    </div>
                  </div>
                )}
                <div ref={transcriptEndRef} />
              </div>
            </div>
          </div>
        </div>

        <footer className="h-16 flex items-center justify-between px-4 sm:px-6 border-t border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  phase === "listening" ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
                }`}
              />
              <span className="text-xs sm:text-sm font-medium text-gray-500">
                Mic {phase === "listening" ? "active" : "idle"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-gray-500">Recording</span>
            </div>
          </div>

          <button
            type="button"
            disabled
            title="You cannot leave while the AI interview is in progress"
            className="px-5 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-400 font-medium cursor-not-allowed"
          >
            Leave Interview
          </button>
        </footer>
      </div>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#3E3A74]">AI Interview</h1>
          {interview && <p className="mt-2 text-gray-600">{interview.job_title || interview.job_role}</p>}
        </div>
        {phase === "intro" && (
          <Link to="/user/assessments" className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 transition">
            Back to Assessments
          </Link>
        )}
      </div>

      {!micSupported && phase !== "complete" && (
        <div className="mt-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3">
          Your browser does not support voice recognition (try Google Chrome). You can still listen to the AI
          interviewer, but your spoken answers may not be captured.
        </div>
      )}

      {phase === "intro" && (
        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-[#3E3A74]">AI Interview Instructions</h2>
            <p className="mt-2 text-gray-600">
              Please read the instructions carefully before you begin. This interview is conducted entirely by an
              AI interviewer using your camera and microphone.
            </p>

            <ul className="mt-6 space-y-3">
              {INSTRUCTIONS.map((line, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#7393D3] flex-shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            {cameraError && (
              <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">
                {cameraError}
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={requestingPermissions}
              className="mt-8 w-full sm:w-auto px-8 py-3 rounded-xl bg-[#7393D3] text-white font-semibold hover:bg-[#5E84D6] transition disabled:opacity-60"
            >
              {requestingPermissions ? "Requesting Camera, Microphone & Full Screen..." : "Start AI Interview"}
            </button>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-200 h-fit">
            <h3 className="text-lg font-bold text-[#3E3A74]">Interview Overview</h3>
            <dl className="mt-6 space-y-5">
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wide">Job Role</dt>
                <dd className="mt-1 text-lg font-semibold text-[#3E3A74]">
                  {interview?.job_title || interview?.job_role || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wide">Estimated Duration</dt>
                <dd className="mt-1 text-lg font-semibold text-[#3E3A74]">{estimatedMinutes} minutes</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wide">Total Questions</dt>
                <dd className="mt-1 text-lg font-semibold text-[#3E3A74]">{totalQuestions}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wide">Marks</dt>
                <dd className="mt-1 text-lg font-semibold text-[#3E3A74]">
                  {totalMarks} ({MARKS_PER_QUESTION} per question)
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {phase === "complete" && result && (() => {
        const copy = RESULT_COPY[result.decision] || RESULT_COPY.Rejected;
        const isPass = result.result === "Pass";
        return (
          <div className="mt-8 max-w-2xl mx-auto space-y-8">
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-md border border-gray-200 text-center">
              <div
                className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold ${
                  isPass ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                }`}
              >
                {isPass ? "✓" : "!"}
              </div>
              <h2 className="mt-5 text-2xl font-bold text-[#3E3A74]">
                {isPass ? copy.heading : "Thank you for attending."}
              </h2>
              <p className="mt-1 text-gray-500 text-sm uppercase tracking-wide">AI Interview Completed</p>

              <div className="mt-8">
                <p className="text-sm text-gray-500">AI Interview Score</p>
                <p className="mt-1 text-5xl font-bold text-[#3E3A74]">
                  {result.overall_score != null ? `${result.overall_score} / ${totalMarks}` : "-"}
                </p>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EEF2FF] text-[#3E3A74] font-semibold">
                {copy.status}
              </div>

              <p className="mt-6 text-sm text-gray-600">{copy.nextStep}</p>
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate("/user/assessments")}
                className="px-6 py-3 rounded-xl bg-[#7393D3] text-white font-semibold hover:bg-[#5E84D6] transition"
              >
                Back to Assessments
              </button>
            </div>
          </div>
        );
      })()}
    </UserDashboardLayout>
  );
}