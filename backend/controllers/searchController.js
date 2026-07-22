const {
  searchAvailableJobsForCandidate,
  searchAppliedJobsForCandidate,
  searchSavedJobsForCandidate,
  searchAssessmentsForCandidate,
  searchProfileForCandidate,
  searchNotificationsForUser,
  searchPostedJobsForRecruiter,
  searchApplicationsForRecruiter,
  searchCandidatesForRecruiter,
  searchAssessmentsForRecruiter,
  searchInterviewsForRecruiter,
  searchTechnicalInterviewsForRecruiter
} = require("../models/searchModel");

const RESULT_LIMIT = 5;

const buildCandidateResults = async (candidateId, pattern) => {
  const [availableJobs, appliedJobs, savedJobs, assessments, notifications, profile] = await Promise.all([
    searchAvailableJobsForCandidate(pattern, RESULT_LIMIT),
    searchAppliedJobsForCandidate(candidateId, pattern, RESULT_LIMIT),
    searchSavedJobsForCandidate(candidateId, pattern, RESULT_LIMIT),
    searchAssessmentsForCandidate(candidateId, pattern, RESULT_LIMIT),
    searchNotificationsForUser(candidateId, pattern, RESULT_LIMIT),
    searchProfileForCandidate(candidateId, pattern)
  ]);
  return [
    {
      category: "Available Jobs",
      items: availableJobs.map((job) => ({
        id: job.id,
        label: job.title,
        sublabel: [job.location, job.employment_type].filter(Boolean).join(" · "),
        path: `/user/jobs?title=${encodeURIComponent(job.title)}`
      }))
    },
    {
      category: "Applied Jobs",
      items: appliedJobs.map((application) => ({
        id: application.id,
        label: application.title,
        sublabel: application.status,
        path: "/user/applied"
      }))
    },
    {
      category: "Saved Jobs",
      items: savedJobs.map((saved) => ({
        id: saved.id,
        label: saved.title,
        sublabel: saved.location,
        path: "/user/saved"
      }))
    },
    {
      category: "Assessments",
      items: assessments.map((assessment) => ({
        id: assessment.assignment_id,
        label: assessment.title,
        sublabel: assessment.status,
        path: `/user/assessments/${assessment.assignment_id}`
      }))
    },
    {
      category: "Notifications",
      items: notifications.map((notification) => ({
        id: notification.id,
        label: notification.title,
        sublabel: notification.message,
        path: "/user/notifications"
      }))
    },
    {
      category: "Profile",
      items: profile.map((item) => ({
        id: item.user_id,
        label: "My Profile",
        sublabel: [item.qualification, item.specialization].filter(Boolean).join(" · "),
        path: "/user/profile"
      }))
    }
  ];
};

const buildRecruiterResults = async (recruiterId, pattern) => {
  const [postedJobs, applications, candidates, assessments, interviews, technicalInterviews, notifications] = await Promise.all([
    searchPostedJobsForRecruiter(recruiterId, pattern, RESULT_LIMIT),
    searchApplicationsForRecruiter(recruiterId, pattern, RESULT_LIMIT),
    searchCandidatesForRecruiter(recruiterId, pattern, RESULT_LIMIT),
    searchAssessmentsForRecruiter(recruiterId, pattern, RESULT_LIMIT),
    searchInterviewsForRecruiter(recruiterId, pattern, RESULT_LIMIT),
    searchTechnicalInterviewsForRecruiter(recruiterId, pattern, RESULT_LIMIT),
    searchNotificationsForUser(recruiterId, pattern, RESULT_LIMIT)
  ]);
  const mergedInterviews = [...interviews, ...technicalInterviews]
    .sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date))
    .slice(0, RESULT_LIMIT);
  return [
    {
      category: "Posted Jobs",
      items: postedJobs.map((job) => ({
        id: job.id,
        label: job.title,
        sublabel: [job.location, job.status].filter(Boolean).join(" · "),
        path: `/recruiter/edit-job/${job.id}`
      }))
    },
    {
      category: "Applications",
      items: applications.map((application) => ({
        id: application.id,
        label: application.candidate_name,
        sublabel: `${application.job_title} · ${application.status}`,
        path: `/recruiter/applicants?search=${encodeURIComponent(application.candidate_name)}`
      }))
    },
    {
      category: "Candidates",
      items: candidates.map((candidate) => ({
        id: candidate.id,
        label: candidate.fullname,
        sublabel: candidate.email,
        path: `/recruiter/applicants?search=${encodeURIComponent(candidate.fullname)}`
      }))
    },
    {
      category: "Assessments",
      items: assessments.map((assessment) => ({
        id: assessment.id,
        label: assessment.title,
        sublabel: assessment.status,
        path: `/recruiter/assessments/${assessment.id}`
      }))
    },
    {
      category: "Interviews",
      items: mergedInterviews.map((interview) => ({
        id: interview.id,
        label: interview.candidate_name,
        sublabel: `${interview.job_title} · ${interview.status}`,
        path: "/recruiter/interviews"
      }))
    },
    {
      category: "Notifications",
      items: notifications.map((notification) => ({
        id: notification.id,
        label: notification.title,
        sublabel: notification.message,
        path: "/recruiter/notifications"
      }))
    }
  ];
};

const globalSearch = async (req, res, next) => {
  try {
    const keyword = (req.query.q || "").trim();
    if (!keyword) {
      return res.status(200).json({ success: true, query: "", results: [] });
    }
    const pattern = `%${keyword}%`;
    const results =
      req.user.role === "recruiter"
        ? await buildRecruiterResults(req.user.id, pattern)
        : await buildCandidateResults(req.user.id, pattern);
    res.status(200).json({ success: true, query: keyword, results });
  } catch (error) {
    next(error);
  }
};

module.exports = { globalSearch };
