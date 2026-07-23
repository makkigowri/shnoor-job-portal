const KNOWLEDGE_BASE = require("./chatbotKnowledgeBase");
const {
  getActiveJobsCount,
  getActiveJobsSummary,
  getPublishedAssessmentsCount,
  getPublishedAssessmentsSummary
} = require("../models/chatbotModel");
const FALLBACK_MESSAGE = "Sorry, I can only assist with SHNOOR Job Portal related queries. Please contact the administrator for further assistance.";
const INTENT_PATTERNS = [
  { intent: "job_count", pattern: /how many (job|opening|position|vacanc)|number of (job|opening|position)|job count/i },
  { intent: "job_openings", pattern: /job opening|current opening|available job|open position|vacanc|list of job|show.*job|openings/i },
  { intent: "assessment_count", pattern: /how many assessment|assessment count|number of assessment/i },
  { intent: "after_assessment", pattern: /after (passing|clearing).*assessment|assessment.*(pass|clear).*(next|after)|what happens after.*assessment/i },
  { intent: "assessment_process", pattern: /how (do|to) i attend|attend.*assessment|take.*assessment/i },
  { intent: "assessment_list", pattern: /assessment/i },
  { intent: "after_ai_interview", pattern: /after.*ai interview|what happens after.*ai interview/i },
  { intent: "ai_interview", pattern: /ai interview|voice interview/i },
  { intent: "after_technical_interview", pattern: /after.*technical interview|what happens after.*technical interview/i },
  { intent: "technical_interview", pattern: /technical interview/i },
  { intent: "ats", pattern: /\bats\b|applicant tracking system|match score/i },
  { intent: "forgot_password", pattern: /forgot.*password|reset.*password|password.*reset/i },
  { intent: "login", pattern: /log ?in|sign ?in/i },
  { intent: "after_registration", pattern: /after regist(er|ration)|what can i do after registering/i },
  { intent: "registration", pattern: /regist(er|ration)|sign ?up|create.*account/i },
  { intent: "update_profile", pattern: /update.*profile|edit.*profile/i },
  { intent: "resume_upload", pattern: /resume|cv upload|upload.*cv/i },
  { intent: "application_tracking", pattern: /track.*application|application status|application tracking/i },
  { intent: "shortlisting", pattern: /shortlist/i },
  { intent: "multiple_jobs", pattern: /apply for multiple|multiple jobs|more than one job/i },
  { intent: "job_application_process", pattern: /how (do|to) i apply|apply for a job|application process|how to apply/i },
  { intent: "find_jobs", pattern: /find jobs|how do i find|search.*job/i },
  { intent: "recruitment_process", pattern: /recruitment process|hiring process|selection process/i },
  { intent: "recruiter_post_jobs", pattern: /how.*recruiter.*post|post.*job.*recruiter|recruiter.*post.*job/i },
  { intent: "recruiter", pattern: /recruiter/i },
  { intent: "candidate", pattern: /candidate|job ?seeker/i },
  { intent: "admin", pattern: /\badmin\b|administrator/i },
  { intent: "contact", pattern: /contact|support|help ?desk|reach.*you|email.*support|phone number/i },
  { intent: "benefits", pattern: /benefit/i },
  { intent: "why_use", pattern: /why (should i use|use shnoor)/i },
  { intent: "chatbot_help", pattern: /how does the chatbot work|what can you do|chatbot work/i },
  { intent: "services", pattern: /what services|services.*shnoor/i },
  { intent: "about", pattern: /about shnoor|what is shnoor|tell me about shnoor|who are you/i },
  { intent: "faq", pattern: /faq|frequently asked/i },
  { intent: "greeting", pattern: /^\s*(hi|hello|hey)\b/i }
];
const detectIntent = (message) => {
  const normalized = (message || "").trim();
  if (!normalized) return null;
  for (const entry of INTENT_PATTERNS) {
    if (entry.pattern.test(normalized)) {
      return entry.intent;
    }
  }
  return null;
};
const formatJobsSummary = (jobs) => {
  if (!jobs.length) {
    return "There are no active job openings at the moment. Please check back soon.";
  }
  const lines = jobs.map((job, index) => {
    const parts = [
      `${index + 1}. ${job.title}`,
      job.department ? `Department: ${job.department}` : null,
      job.location ? `Location: ${job.location}` : null,
      `Employment Type: ${job.employment_type}`,
      job.experience ? `Experience: ${job.experience}` : null,
      `Apply Status: ${job.status === "Active" ? "Open" : "Closed"}`
    ].filter(Boolean);
    return parts.join(" | ");
  });
  return `Here are the current job openings:\n${lines.join("\n")}`;
};
const formatAssessmentsSummary = (assessments) => {
  if (!assessments.length) {
    return "There are no published assessments available right now.";
  }
  const lines = assessments.map((assessment, index) => {
    const parts = [
      `${index + 1}. ${assessment.title}`,
      assessment.job_title ? `Job: ${assessment.job_title}` : null,
      `Duration: ${assessment.duration_minutes} mins`,
      `Total Marks: ${assessment.total_marks}`,
      `Passing Marks: ${assessment.passing_marks}`
    ].filter(Boolean);
    return parts.join(" | ");
  });
  return `Here are the available assessments:\n${lines.join("\n")}`;
};
const buildReply = async (intent) => {
  switch (intent) {
    case "job_count": {
      const count = await getActiveJobsCount();
      return `There are currently ${count} active job opening${count === 1 ? "" : "s"} on SHNOOR Job Portal.`;
    }
    case "job_openings": {
      const jobs = await getActiveJobsSummary();
      return formatJobsSummary(jobs);
    }
    case "assessment_count": {
      const count = await getPublishedAssessmentsCount();
      return `There ${count === 1 ? "is" : "are"} currently ${count} published assessment${count === 1 ? "" : "s"} on SHNOOR Job Portal.`;
    }
    case "assessment_list": {
      const assessments = await getPublishedAssessmentsSummary();
      return formatAssessmentsSummary(assessments);
    }
    case "assessment_process":
      return KNOWLEDGE_BASE.assessmentProcess;
    case "after_assessment":
      return KNOWLEDGE_BASE.afterAssessment;
    case "ai_interview":
      return KNOWLEDGE_BASE.aiInterview;
    case "after_ai_interview":
      return KNOWLEDGE_BASE.afterAiInterview;
    case "technical_interview":
      return KNOWLEDGE_BASE.technicalInterview;
    case "after_technical_interview":
      return KNOWLEDGE_BASE.afterTechnicalInterview;
    case "ats":
      return KNOWLEDGE_BASE.ats;
    case "forgot_password":
      return KNOWLEDGE_BASE.forgotPassword;
    case "login":
      return KNOWLEDGE_BASE.login;
    case "registration":
      return KNOWLEDGE_BASE.registration;
    case "after_registration":
      return KNOWLEDGE_BASE.afterRegistration;
    case "update_profile":
      return KNOWLEDGE_BASE.updateProfile;
    case "resume_upload":
      return KNOWLEDGE_BASE.resumeUpload;
    case "application_tracking":
      return KNOWLEDGE_BASE.applicationTracking;
    case "shortlisting":
      return KNOWLEDGE_BASE.shortlisting;
    case "multiple_jobs":
      return KNOWLEDGE_BASE.multipleJobs;
    case "job_application_process":
      return KNOWLEDGE_BASE.jobApplicationProcess;
    case "find_jobs":
      return KNOWLEDGE_BASE.findJobs;
    case "recruitment_process":
      return KNOWLEDGE_BASE.recruitmentProcess;
    case "recruiter_post_jobs":
      return KNOWLEDGE_BASE.recruiterPostJobs;
    case "recruiter":
      return KNOWLEDGE_BASE.recruiter;
    case "candidate":
      return KNOWLEDGE_BASE.candidate;
    case "admin":
      return KNOWLEDGE_BASE.admin;
    case "contact":
      return KNOWLEDGE_BASE.contact;
    case "benefits":
      return KNOWLEDGE_BASE.benefits;
    case "why_use":
      return KNOWLEDGE_BASE.whyUse;
    case "chatbot_help":
      return KNOWLEDGE_BASE.chatbotHelp;
    case "services":
      return KNOWLEDGE_BASE.services;
    case "about":
      return KNOWLEDGE_BASE.about;
    case "faq":
      return KNOWLEDGE_BASE.faq;
    case "greeting":
      return "Hello! I am the SHNOOR Job Portal AI Assistant. Ask me about job openings, registration, applications, assessments, interviews or the ATS process.";
    default:
      return FALLBACK_MESSAGE;
  }
};
const getChatbotResponse = async (message) => {
  const intent = detectIntent(message);
  if (!intent) {
    return { intent: "fallback", reply: FALLBACK_MESSAGE };
  }
  const reply = await buildReply(intent);
  return { intent, reply };
};
module.exports = { getChatbotResponse };
