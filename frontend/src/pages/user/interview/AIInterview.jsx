import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import UserDashboardLayout from "../../../layouts/UserDashboardLayout";
import { getAiInterview, startAiInterview, submitAiInterviewAnswer } from "../../../services/aiInterviewService";

const SpeechRecognitionAPI =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

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

const formatTimer = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default function AIInterview() {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [transcript, setTranscript] = useState([]); // [{ speaker: 'ai'|'candidate', text }]
  const [phase, setPhase] = useState("loading"); // loading | intro | speaking | listening | thinking | complete | error
  const [error, setError] = useState("");
  const [liveCaption, setLiveCaption] = useState("");
  const [micSupported, setMicSupported] = useState(true);
  const [result, setResult] = useState(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const currentQuestionRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    setMicSupported(Boolean(SpeechRecognitionAPI));
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, liveCaption]);

  // Interview timer - runs while the interview is actively in progress.
  useEffect(() => {
    const active = ["speaking", "listening", "thinking"].includes(phase);
    if (active) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

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
          // ignore
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
        silenceTimer = setTimeout(stopAndResolve, 3000);
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
      silenceTimer = setTimeout(stopAndResolve, 15000);
    });
  }, []);

  const runQuestionCycle = useCallback(
    async (question) => {
      currentQuestionRef.current = question;
      setTranscript((prev) => [...prev, { speaker: "ai", text: question.question_text }]);
      setPhase("speaking");
      await speak(question.question_text);

      setPhase("listening");
      setLiveCaption("");
      const answerText = await listen();
      setLiveCaption("");
      setPhase("thinking");

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
          clearInterval(timerRef.current);
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
    [interviewId]
  );

  const handleStart = async () => {
    setError("");
    setPhase("thinking");
    try {
      const data = await startAiInterview(interviewId);
      setInterview(data.interview);
      await speak(
        `Hello! I'm your AI interviewer for the ${data.interview.job_role || "role"} position. Let's get started.`
      );
      await runQuestionCycle(data.question);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to start the AI interview");
      setPhase("error");
    }
  };

  const totalQuestions = interview?.total_questions || 0;
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

  return (
    <UserDashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#3E3A74]">AI Interview</h1>
          {interview && <p className="mt-2 text-gray-600">{interview.job_title || interview.job_role}</p>}
        </div>
        {inSession && (
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Timer</p>
              <p className="text-xl font-bold text-[#3E3A74] tabular-nums">{formatTimer(elapsedSeconds)}</p>
            </div>
            <div className="w-40">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>
                  {questionsAnswered}/{totalQuestions}
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-[#7393D3] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}
        <Link to="/user/assessments" className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 transition">
          Back to Assessments
        </Link>
      </div>

      {!micSupported && phase !== "complete" && (
        <div className="mt-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3">
          Your browser does not support voice recognition (try Google Chrome). You can still listen to the AI
          interviewer, but your spoken answers may not be captured.
        </div>
      )}

      {phase === "intro" && (
        <div className="mt-8 bg-white rounded-3xl p-10 shadow-md border border-gray-200 text-center">
          <h2 className="text-2xl font-bold text-[#3E3A74]">Ready for your AI Interview?</h2>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            The AI interviewer will speak each question out loud. Please allow microphone access and answer
            naturally after each question - your response will be transcribed live.
          </p>
          <button
            onClick={handleStart}
            className="mt-8 px-8 py-3 rounded-xl bg-[#7393D3] text-white font-semibold hover:bg-[#5E84D6] transition"
          >
            Start AI Interview
          </button>
        </div>
      )}

      {inSession && (
        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white rounded-3xl p-8 shadow-md border border-gray-200 text-center h-fit">
            <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
              {phase === "speaking" && (
                <span className="absolute inset-0 rounded-full bg-[#3E3A74]/30 animate-ping" />
              )}
              {phase === "listening" && (
                <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
              )}
              <div
                className={`relative w-28 h-28 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg transition-colors duration-300 ${
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
                  phase === "speaking" ? "bg-[#3E3A74] animate-pulse" : "bg-gray-300"
                }`}
              />
              <p className="font-semibold text-[#3E3A74]">
                {phase === "speaking" && "AI is speaking..."}
                {phase === "listening" && "Listening to your answer..."}
                {phase === "thinking" && "Evaluating and preparing next question..."}
              </p>
            </div>

            <div
              className={`mt-5 flex items-center justify-center gap-2 rounded-xl px-4 py-2 border ${
                phase === "listening" ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-gray-50"
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  phase === "listening" ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
                }`}
              />
              <span className={`text-sm font-medium ${phase === "listening" ? "text-emerald-700" : "text-gray-500"}`}>
                Microphone {phase === "listening" ? "active" : "idle"}
              </span>
            </div>

            {currentQuestionRef.current && (
              <div className="mt-6 text-left">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Current Question</p>
                <p className="mt-2 text-[#3E3A74] font-medium">{currentQuestionRef.current.question_text}</p>
              </div>
            )}

            {phase === "listening" && liveCaption && (
              <p className="mt-3 text-sm text-gray-500 italic">"{liveCaption}"</p>
            )}
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-md border border-gray-200 flex flex-col h-[520px]">
            <h3 className="text-xl font-bold text-[#3E3A74] mb-4">Conversation Transcript</h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {transcript.map((entry, idx) => (
                <div key={idx} className={`flex ${entry.speaker === "ai" ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      entry.speaker === "ai" ? "bg-[#EEF2FF] text-[#3E3A74]" : "bg-[#7393D3] text-white"
                    }`}
                  >
                    <p className="text-xs font-semibold mb-1 opacity-70">
                      {entry.speaker === "ai" ? "AI" : "Candidate"}
                    </p>
                    <p>{entry.text}</p>
                  </div>
                </div>
              ))}
              {phase === "listening" && liveCaption && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-[#7393D3]/60 text-white">
                    <p className="text-xs font-semibold mb-1 opacity-70">Candidate (speaking...)</p>
                    <p>{liveCaption}</p>
                  </div>
                </div>
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        </div>
      )}

      {phase === "complete" && result && (() => {
        const copy = RESULT_COPY[result.decision] || RESULT_COPY.Rejected;
        const isPass = result.result === "Pass";
        return (
          <div className="mt-8 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-[#3E3A74]">
                  {isPass ? copy.heading : "Thank you for attending."}
                </h2>
                <span
                  className={`px-4 py-2 rounded-full font-semibold ${
                    isPass ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {isPass ? "PASS" : "FAIL"}
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-6 mt-6">
                <div>
                  <p className="text-sm text-gray-500">Overall Score</p>
                  <p className="text-3xl font-bold text-[#3E3A74] mt-1">
                    {result.overall_score != null ? `${result.overall_score}%` : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Status</p>
                  <p className="text-xl font-semibold text-[#3E3A74] mt-1">{copy.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Next Step</p>
                  <p className="text-sm text-gray-700 mt-1">{copy.nextStep}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/user/assessments")}
              className="px-6 py-3 rounded-xl bg-[#7393D3] text-white font-semibold hover:bg-[#5E84D6] transition"
            >
              Back to Assessments
            </button>
          </div>
        );
      })()}
    </UserDashboardLayout>
  );
}

