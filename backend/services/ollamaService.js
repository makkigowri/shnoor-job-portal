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
const clampScore = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num * 100) / 100));
};
const normalizeAnswerEvaluation = (raw) => ({
  technical: clampScore(raw.technical),
  communication: clampScore(raw.communication),
  pronunciation: clampScore(raw.pronunciation),
  feedback: (raw.feedback || "Answer recorded.").toString()
});
const fallbackAnswerEvaluation = (answerText) => {
  const trimmed = (answerText || "").trim();
  if (!trimmed) {
    return {
      technical: 0,
      communication: 0,
      pronunciation: 0,
      feedback: "No answer was captured for this question."
    };
  }
  const wordCount = trimmed.split(/\s+/).length;
  const base = wordCount >= 15 ? 65 : wordCount >= 5 ? 55 : 40;
  return {
    technical: base,
    communication: base,
    pronunciation: base,
    feedback:
      "Automated evaluation service was unavailable, so a conservative score was generated based on response length. A recruiter should manually review this answer."
  };
};
const evaluateInterviewAnswer = async ({
  jobRole,
  skills,
  experience,
  questionText,
  answerText,
  questionNumber,
  totalQuestions
}) => {
  const trimmedAnswer = (answerText || "").trim();
  if (!trimmedAnswer) {
    return normalizeAnswerEvaluation(fallbackAnswerEvaluation(answerText));
  }
  const prompt = `You are a fair, encouraging interview evaluator for question ${questionNumber} of ${totalQuestions} in a live voice interview.
Candidate profile:
- Job Role: ${jobRole || "General"}
- Skills: ${skills || "Not specified"}
- Experience: ${experience || "Not specified"}
Question asked: ${questionText}
Candidate's spoken answer (captured via speech-to-text, so minor transcription errors are expected and should not be penalized): ${trimmedAnswer}
Score the candidate's answer from 0 to 100 on each of these dimensions:
- technical: correctness and relevance of the technical/job-related content
- communication: clarity, structure and completeness of the explanation
- pronunciation: how clear and understandable the speech transcription reads, assuming normal transcription noise
Be balanced and not overly strict. A technically correct answer with decent communication should score well, even if not perfectly phrased. Give partial credit for reasonable, relevant attempts.
Write one short encouraging feedback sentence.
Respond ONLY with strict JSON in this exact shape, no extra text:
{"technical": 0, "communication": 0, "pronunciation": 0, "feedback": "string"}`;
  try {
    const raw = await callOllama(prompt, { temperature: 0.3 });
    const parsed = extractJson(raw);
    if (parsed && typeof parsed.technical !== "undefined") {
      return normalizeAnswerEvaluation(parsed);
    }
  } catch (error) {
    console.error("Ollama answer evaluation failed:", error.message);
  }
  return normalizeAnswerEvaluation(fallbackAnswerEvaluation(answerText));
};
module.exports = {
  generateInterviewQuestion,
  evaluateInterviewAnswer
};
