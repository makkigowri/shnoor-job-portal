const {
  listUsersAdmin,
  listRecruitersAdmin,
  listJobsAdmin,
  listApplicationsAdmin,
  listAssessmentsAdmin
} = require("../models/adminStatsModel");
const { searchAiInterviewsAdmin, searchTechnicalInterviewsAdmin } = require("../models/searchModel");

const RESULT_LIMIT = 5;

const globalSearchAdmin = async (req, res, next) => {
  try {
    const keyword = (req.query.q || "").trim();
    if (!keyword) {
      return res.status(200).json({ success: true, query: "", results: [] });
    }
    const pattern = `%${keyword}%`;
    const [users, recruiters, jobs, applications, assessments, aiInterviews, technicalInterviews] = await Promise.all([
      listUsersAdmin({ search: keyword, page: 1, limit: RESULT_LIMIT }),
      listRecruitersAdmin({ search: keyword, page: 1, limit: RESULT_LIMIT }),
      listJobsAdmin({ search: keyword, page: 1, limit: RESULT_LIMIT }),
      listApplicationsAdmin({ search: keyword, page: 1, limit: RESULT_LIMIT }),
      listAssessmentsAdmin({ search: keyword, page: 1, limit: RESULT_LIMIT }),
      searchAiInterviewsAdmin(pattern, RESULT_LIMIT),
      searchTechnicalInterviewsAdmin(pattern, RESULT_LIMIT)
    ]);
    const results = [
      {
        category: "Users",
        items: users.users.map((user) => ({
          id: user.id,
          label: user.fullname,
          sublabel: user.email,
          path: "/admin/users"
        }))
      },
      {
        category: "Recruiters",
        items: recruiters.recruiters.map((recruiter) => ({
          id: recruiter.id,
          label: recruiter.fullname,
          sublabel: recruiter.company_name || recruiter.email,
          path: "/admin/recruiters"
        }))
      },
      {
        category: "Jobs",
        items: jobs.jobs.map((job) => ({
          id: job.id,
          label: job.title,
          sublabel: [job.location, job.status].filter(Boolean).join(" · "),
          path: "/admin/jobs"
        }))
      },
      {
        category: "Applications",
        items: applications.applications.map((application) => ({
          id: application.id,
          label: application.candidate_name,
          sublabel: `${application.job_title} · ${application.status}`,
          path: "/admin/applications"
        }))
      },
      {
        category: "Assessments",
        items: assessments.assessments.map((assessment) => ({
          id: assessment.id,
          label: assessment.title,
          sublabel: assessment.status,
          path: "/admin/assessments"
        }))
      },
      {
        category: "AI Interviews",
        items: aiInterviews.map((interview) => ({
          id: interview.id,
          label: interview.candidate_name,
          sublabel: `${interview.job_title} · ${interview.status}`,
          path: "/admin/applications"
        }))
      },
      {
        category: "Technical Interviews",
        items: technicalInterviews.map((interview) => ({
          id: interview.id,
          label: interview.candidate_name,
          sublabel: `${interview.job_title} · ${interview.status}`,
          path: "/admin/applications"
        }))
      }
    ];
    res.status(200).json({ success: true, query: keyword, results });
  } catch (error) {
    next(error);
  }
};

module.exports = { globalSearchAdmin };
