const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || "http://localhost:11434").replace(/\/$/, "");
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";
const extractJson = (rawText) => {
  if (!rawText || typeof rawText !== "string") return null;
  const cleaned = rawText.replace(/```json/gi, "```").split("```").join("");
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) return null;
  const candidate = cleaned.slice(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(candidate);
  } catch (error) {
    return null;
  }
};
const callOllama = async (prompt, { temperature = 0.6 } = {}) => {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      format: "json",
      options: { temperature }
    })
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Ollama request failed (${response.status}): ${text || response.statusText}`);
  }
  const data = await response.json();
  return data.response;
};
const generateInterviewQuestion = async ({
  jobRole,
  skills,
  experience,
  assessmentPercentage,
  questionNumber,
  totalQuestions,
  previousExchanges
}) => {
  const history = (previousExchanges || [])
    .map(
      (ex, idx) =>
        `Q${idx + 1}: ${ex.question}\nCandidate's Answer: ${ex.answer || "(no answer captured)"}`
    )
    .join("\n\n");
  const prompt = `You are an experienced, friendly AI technical interviewer conducting a live voice interview.
Candidate profile:
- Job Role: ${jobRole || "General"}
- Skills: ${skills || "Not specified"}
- Experience: ${experience || "Not specified"}
- Assessment Score: ${assessmentPercentage != null ? `${assessmentPercentage}%` : "Not available"}
This is question ${questionNumber} of ${totalQuestions}.
${history ? `Conversation so far:\n${history}\n` : "This is the first question of the interview."}
Rules:
- Ask exactly ONE clear, spoken-style interview question appropriate for question ${questionNumber} of ${totalQuestions}.
- Question 1 must be a warm opening question such as "Tell me about yourself".
- Middle questions should probe technical knowledge relevant to the job role and skills, and may follow up on a weak previous answer.
- Do NOT repeat a question already asked.
- Keep the question concise (1-3 sentences) and natural to say out loud.
Respond ONLY with strict JSON in this exact shape, no extra text:
{"question": "the interview question text"}`;

  try {
    const raw = await callOllama(prompt, { temperature: 0.7 });
    const parsed = extractJson(raw);
    if (parsed && typeof parsed.question === "string" && parsed.question.trim()) {
      return parsed.question.trim();
    }
  } catch (error) {
    console.error("Ollama question generation failed:", error.message);
  }
  return fallbackQuestion(questionNumber, jobRole);
};
const fallbackQuestion = (questionNumber, jobRole) => {
  const fallbacks = [
    "Tell me about yourself and your journey so far.",
    `What interests you most about the ${jobRole || "role"} you applied for?`,
    "Walk me through a recent project you are proud of and your role in it.",
    "How do you approach debugging a difficult technical problem?",
    "Tell me about a time you had to learn a new technology quickly.",
    "Where do you see yourself professionally in the next two years?"
  ];
  return fallbacks[(questionNumber - 1) % fallbacks.length];
};
const evaluateInterviewTranscript = async ({ jobRole, skills, experience, assessmentPercentage, exchanges }) => {
  const transcript = (exchanges || [])
    .map(
      (ex, idx) =>
        `Q${idx + 1}: ${ex.question}\nCandidate's Answer: ${ex.answer || "(no answer given)"}`
    )
    .join("\n\n");
  const prompt = `You are an expert technical interview evaluator. Evaluate the candidate's full AI interview transcript below.
Candidate profile:
- Job Role: ${jobRole || "General"}
- Skills: ${skills || "Not specified"}
- Experience: ${experience || "Not specified"}
- Assessment Score: ${assessmentPercentage != null ? `${assessmentPercentage}%` : "Not available"}
Transcript:
${transcript || "No answers were recorded."}
Score the candidate from 0 to 100 on each of these dimensions:
- technicalKnowledge
- communication
- confidence
- problemSolving
Then compute an overallScore (0-100) as your holistic judgement (not necessarily a simple average).
Write concise feedback: 2-4 sentences of overall AI feedback, a short list of strengths, a short list of weaknesses, and a short list of suggestions for improvement.
Respond ONLY with strict JSON in this exact shape, no extra text:
{
  "technicalKnowledge": 0,
  "communication": 0,
  "confidence": 0,
  "problemSolving": 0,
  "overallScore": 0,
  "feedback": "string",
  "strengths": "string",
  "weaknesses": "string",
  "suggestions": "string"
}`;
  try {
    const raw = await callOllama(prompt, { temperature: 0.3 });
    const parsed = extractJson(raw);
    if (parsed && typeof parsed.overallScore !== "undefined") {
      return normalizeEvaluation(parsed);
    }
  } catch (error) {
    console.error("Ollama interview evaluation failed:", error.message);
  }
  return normalizeEvaluation(fallbackEvaluation(exchanges));
};
const clampScore = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num * 100) / 100));
};
const normalizeEvaluation = (raw) => ({
  technicalKnowledge: clampScore(raw.technicalKnowledge),
  communication: clampScore(raw.communication),
  confidence: clampScore(raw.confidence),
  problemSolving: clampScore(raw.problemSolving),
  overallScore: clampScore(raw.overallScore),
  feedback: (raw.feedback || "The candidate completed the AI interview.").toString(),
  strengths: (raw.strengths || "Not enough detail captured to determine strengths.").toString(),
  weaknesses: (raw.weaknesses || "Not enough detail captured to determine weaknesses.").toString(),
  suggestions: (raw.suggestions || "Continue practicing structured, detailed answers.").toString()
});
const fallbackEvaluation = (exchanges) => {
  const answered = (exchanges || []).filter((ex) => ex.answer && ex.answer.trim().length > 0).length;
  const total = (exchanges || []).length || 1;
  const ratio = answered / total;
  const base = Math.round(ratio * 60);
  return {
    technicalKnowledge: base,
    communication: base,
    confidence: base,
    problemSolving: base,
    overallScore: base,
    feedback:
      "Automated evaluation service was unavailable, so a conservative score was generated based on response completeness. A recruiter should manually review this transcript.",
    strengths: "Candidate participated in the interview.",
    weaknesses: "Could not be determined automatically; manual review recommended.",
    suggestions: "Ensure clear, complete answers to every question."
  };
};
module.exports = {
  generateInterviewQuestion,
  evaluateInterviewTranscript
};
