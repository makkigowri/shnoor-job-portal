const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const skillAppearsInText = (skill, text) => {
  const trimmed = skill.trim();
  if (!trimmed) return false;
  const isWordLike = /^[a-zA-Z0-9+.# ]+$/.test(trimmed);
  if (isWordLike) {
    const pattern = new RegExp(`(^|[^a-zA-Z0-9])${escapeRegExp(trimmed.toLowerCase())}([^a-zA-Z0-9]|$)`, "i");
    return pattern.test(` ${text} `);
  }
  return text.includes(trimmed.toLowerCase());
};
const getRecommendation = (score) => {
  if (score >= 75) {
    return { label: "Strong Match — Recommended for Shortlist", tone: "success" };
  }
  if (score >= 50) {
    return { label: "Moderate Match — Consider for Interview", tone: "warning" };
  }
  return { label: "Weak Match — Likely Not a Fit", tone: "error" };
};
const scoreResumeAgainstJob = (resumeText, skillsCsv) => {
  const normalizedText = (resumeText || "").toLowerCase();
  const requiredSkills = (skillsCsv || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (requiredSkills.length === 0) {
    return {
      score: null,
      matchedSkills: [], missingSkills: [], totalSkills: 0, recommendation: {
        label: "This job has no listed skills to compare against",
        tone: "info"
      }
    };
  }
  const matchedSkills = [];
  const missingSkills = [];
  requiredSkills.forEach((skill) => {
    if (skillAppearsInText(skill, normalizedText)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });
  const score = Math.round((matchedSkills.length / requiredSkills.length) * 100);
  return {
    score,
    matchedSkills,missingSkills,totalSkills: requiredSkills.length,recommendation: getRecommendation(score)
  };
};
module.exports = { scoreResumeAgainstJob };
