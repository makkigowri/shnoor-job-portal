const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const normalizeToken = (str) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const skillAppearsInText = (skill, text) => {
  const trimmed = skill.trim();
  if (!trimmed) return false;
  const isWordLike = /^[a-zA-Z0-9+.# ]+$/.test(trimmed);
  if (isWordLike) {
    const pattern = new RegExp(`(^|[^a-zA-Z0-9])${escapeRegExp(trimmed.toLowerCase())}([^a-zA-Z0-9]|$)`, "i");
    if (pattern.test(` ${text} `)) return true;
    const normalizedSkill = normalizeToken(trimmed);
    return normalizedSkill.length > 0 && normalizeToken(text).includes(normalizedSkill);
  }
  return text.includes(trimmed.toLowerCase());
};
const EXPERIENCE_PATTERN = /(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)/gi;
const extractExperienceYears = (text) => {
  if (!text) return null;
  const matches = [...text.matchAll(EXPERIENCE_PATTERN)];
  if (matches.length === 0) return null;
  const values = matches.map((m) => parseFloat(m[1]));
  return Math.max(...values);
};
const parseRequiredExperienceYears = (experienceText) => {
  if (!experienceText || typeof experienceText !== "string") return null;
  const numbers = experienceText.match(/\d+(\.\d+)?/g);
  if (!numbers || numbers.length === 0) return null;
  return Math.min(...numbers.map((n) => parseFloat(n)));
};
const scoreExperience = (candidateYears, requiredYears) => {
  if (candidateYears >= requiredYears) return 100;
  if (requiredYears <= 0) return 100;
  return Math.max(0, Math.round((candidateYears / requiredYears) * 100));
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
const scoreResumeAgainstJob = (resumeText, skillsCsv, requiredExperienceText) => {
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
  const skillsScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);
  const requiredExperienceYears = parseRequiredExperienceYears(requiredExperienceText);
  const candidateExperienceYears = extractExperienceYears(normalizedText);
  let score = skillsScore;
  let experienceScore = null;
  if (requiredExperienceYears !== null && candidateExperienceYears !== null) {
    experienceScore = scoreExperience(candidateExperienceYears, requiredExperienceYears);
    score = Math.round(skillsScore * 0.7 + experienceScore * 0.3);
  }
  return {
    score,
    matchedSkills,missingSkills,totalSkills: requiredSkills.length,recommendation: getRecommendation(score),
    skillsScore,experienceScore,candidateExperienceYears,requiredExperienceYears
  };
};
const scoreSkillsOnly = (candidateSkillsCsv, jobSkillsCsv) => {
  const requiredSkills = (jobSkillsCsv || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (requiredSkills.length === 0) {
    return { score: null, matchedSkills: [], missingSkills: [], totalSkills: 0 };
  }
  const candidateSkillSet = new Set(
    (candidateSkillsCsv || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
  const matchedSkills = [];
  const missingSkills = [];
  requiredSkills.forEach((skill) => {
    if (candidateSkillSet.has(skill.toLowerCase())) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });
  const score = Math.round((matchedSkills.length / requiredSkills.length) * 100);
  return { score, matchedSkills, missingSkills, totalSkills: requiredSkills.length };
};
// ATS automation scoring: checks the job's required skills directly against
// the candidate's resume text (same substring/word matching used by the
// manual ATS checker), instead of the candidate's separate profile Skills
// field. This is what "Run ATS Score" on the Applicants page uses.
const scoreSkillsFromResumeText = (resumeText, jobSkillsCsv) => {
  const requiredSkills = (jobSkillsCsv || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (requiredSkills.length === 0) {
    return { score: null, matchedSkills: [], missingSkills: [], totalSkills: 0 };
  }
  const normalizedText = (resumeText || "").toLowerCase();
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
  return { score, matchedSkills, missingSkills, totalSkills: requiredSkills.length };
};
module.exports = { scoreResumeAgainstJob, scoreSkillsOnly, scoreSkillsFromResumeText };
