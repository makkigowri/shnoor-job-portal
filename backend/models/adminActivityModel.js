const pool = require("../config/db");
const EVENT_LIMIT_PER_SOURCE = 40;
const FEED_LIMIT = 120;
const fetchJobseekerRegistrations = async () => {
  const query = `
    SELECT id, fullname, created_at
    FROM users
    WHERE role = 'jobseeker'
    ORDER BY created_at DESC
    LIMIT $1`;
  const { rows } = await pool.query(query, [EVENT_LIMIT_PER_SOURCE]);
  return rows.map((row) => ({
    key: `user_registered:${row.id}`,
    category: "profile",
    title: "New Job Seeker Registered",
    description: `${row.fullname} created a job seeker account.`,
    relatedName: row.fullname,
    occurredAt: row.created_at
  }));
};
const fetchRecruiterRegistrations = async () => {
  const query = `
    SELECT id, fullname, created_at
    FROM users
    WHERE role = 'recruiter'
    ORDER BY created_at DESC
    LIMIT $1`;
  const { rows } = await pool.query(query, [EVENT_LIMIT_PER_SOURCE]);
  return rows.map((row) => ({
    key: `recruiter_registered:${row.id}`,
    category: "recruiters",
    title: "New Recruiter Registered",
    description: `${row.fullname} created a recruiter account.`,
    relatedName: row.fullname,
    occurredAt: row.created_at
  }));
};
const fetchCompanyProfilesCreated = async () => {
  const query = `
    SELECT c.id, c.company_name, c.created_at, u.fullname AS recruiter_name
    FROM companies c
    JOIN users u ON u.id = c.recruiter_id
    ORDER BY c.created_at DESC
    LIMIT $1`;
  const { rows } = await pool.query(query, [EVENT_LIMIT_PER_SOURCE]);
  return rows.map((row) => ({
    key: `company_created:${row.id}`,
    category: "recruiters",
    title: "Company Profile Created",
    description: `${row.recruiter_name} added company profile for ${row.company_name}.`,
    relatedName: row.company_name,
    occurredAt: row.created_at
  }));
};
const fetchCompanyProfilesUpdated = async () => {
  const query = `
    SELECT c.id, c.company_name, c.updated_at, u.fullname AS recruiter_name
    FROM companies c
    JOIN users u ON u.id = c.recruiter_id
    WHERE c.updated_at > c.created_at + INTERVAL '5 seconds'
    ORDER BY c.updated_at DESC
    LIMIT $1`;
  const { rows } = await pool.query(query, [EVENT_LIMIT_PER_SOURCE]);
  return rows.map((row) => ({
    key: `company_updated:${row.id}:${new Date(row.updated_at).getTime()}`,
    category: "recruiters",
    title: "Company Profile Updated",
    description: `${row.recruiter_name} updated the ${row.company_name} company profile.`,
    relatedName: row.company_name,
    occurredAt: row.updated_at
  }));
};
const fetchJobSeekerProfileUpdates = async () => {
  const query = `
    SELECT p.id, p.updated_at, u.fullname AS user_name
    FROM job_seeker_profiles p
    JOIN users u ON u.id = p.user_id
    WHERE p.updated_at > p.created_at + INTERVAL '5 seconds'
    ORDER BY p.updated_at DESC
    LIMIT $1`;
  const { rows } = await pool.query(query, [EVENT_LIMIT_PER_SOURCE]);
  return rows.map((row) => ({
    key: `profile_updated:${row.id}:${new Date(row.updated_at).getTime()}`,
    category: "profile",
    title: "Profile Updated",
    description: `${row.user_name} updated their job seeker profile.`,
    relatedName: row.user_name,
    occurredAt: row.updated_at
  }));
};
const fetchJobsPosted = async () => {
  const query = `
    SELECT j.id, j.title, j.created_at, u.fullname AS recruiter_name
    FROM jobs j
    JOIN users u ON u.id = j.recruiter_id
    ORDER BY j.created_at DESC
    LIMIT $1`;
  const { rows } = await pool.query(query, [EVENT_LIMIT_PER_SOURCE]);
  return rows.map((row) => ({
    key: `job_posted:${row.id}`,
    category: "jobs",
    title: "New Job Posted",
    description: `${row.recruiter_name} posted a new job: ${row.title}.`,
    relatedName: row.recruiter_name,
    occurredAt: row.created_at
  }));
};
const fetchApplicationsSubmitted = async () => {
  const query = `
    SELECT a.id, a.applied_at, u.fullname AS candidate_name, j.title AS job_title
    FROM applications a
    JOIN users u ON u.id = a.user_id
    JOIN jobs j ON j.id = a.job_id
    WHERE a.status != 'Withdrawn'
    ORDER BY a.applied_at DESC
    LIMIT $1`;
  const { rows } = await pool.query(query, [EVENT_LIMIT_PER_SOURCE]);
  return rows.map((row) => ({
    key: `application_submitted:${row.id}`,
    category: "applications",
    title: "New Application Submitted",
    description: `${row.candidate_name} applied for ${row.job_title}.`,
    relatedName: row.candidate_name,
    occurredAt: row.applied_at
  }));
};
const fetchApplicationsShortlisted = async () => {
  const query = `
    SELECT a.id, a.updated_at, u.fullname AS candidate_name, j.title AS job_title
    FROM applications a
    JOIN users u ON u.id = a.user_id
    JOIN jobs j ON j.id = a.job_id
    WHERE a.status = 'Shortlisted'
    ORDER BY a.updated_at DESC
    LIMIT $1`;
  const { rows } = await pool.query(query, [EVENT_LIMIT_PER_SOURCE]);
  return rows.map((row) => ({
    key: `application_shortlisted:${row.id}:${new Date(row.updated_at).getTime()}`,
    category: "applications",
    title: "Candidate Shortlisted",
    description: `${row.candidate_name} was shortlisted for ${row.job_title}.`,
    relatedName: row.candidate_name,
    occurredAt: row.updated_at
  }));
};
const fetchApplicationsRejected = async () => {
  const query = `
    SELECT a.id, a.updated_at, u.fullname AS candidate_name, j.title AS job_title
    FROM applications a
    JOIN users u ON u.id = a.user_id
    JOIN jobs j ON j.id = a.job_id
    WHERE a.status = 'Rejected'
    ORDER BY a.updated_at DESC
    LIMIT $1`;
  const { rows } = await pool.query(query, [EVENT_LIMIT_PER_SOURCE]);
  return rows.map((row) => ({
    key: `application_rejected:${row.id}:${new Date(row.updated_at).getTime()}`,
    category: "applications",
    title: "Candidate Rejected",
    description: `${row.candidate_name}'s application for ${row.job_title} was rejected.`,
    relatedName: row.candidate_name,
    occurredAt: row.updated_at
  }));
};
const fetchInterviewsScheduled = async () => {
  const query = `
    SELECT i.id, i.created_at, u.fullname AS candidate_name, j.title AS job_title
    FROM interviews i
    JOIN users u ON u.id = i.candidate_id
    JOIN jobs j ON j.id = i.job_id
    ORDER BY i.created_at DESC
    LIMIT $1`;
  const { rows } = await pool.query(query, [EVENT_LIMIT_PER_SOURCE]);
  return rows.map((row) => ({
    key: `interview_scheduled:${row.id}`,
    category: "applications",
    title: "Interview Scheduled",
    description: `Interview scheduled with ${row.candidate_name} for ${row.job_title}.`,
    relatedName: row.candidate_name,
    occurredAt: row.created_at
  }));
};
const fetchAssessmentsAssigned = async () => {
  const query = `
    SELECT aa.id, aa.assigned_at, u.fullname AS candidate_name, a.title AS assessment_title
    FROM assessment_assignments aa
    JOIN users u ON u.id = aa.candidate_id
    JOIN assessments a ON a.id = aa.assessment_id
    ORDER BY aa.assigned_at DESC
    LIMIT $1`;
  const { rows } = await pool.query(query, [EVENT_LIMIT_PER_SOURCE]);
  return rows.map((row) => ({
    key: `assessment_assigned:${row.id}`,
    category: "assessments",
    title: "Assessment Assigned",
    description: `${row.candidate_name} was assigned the ${row.assessment_title} assessment.`,
    relatedName: row.candidate_name,
    occurredAt: row.assigned_at
  }));
};
const fetchAssessmentsCompleted = async () => {
  const query = `
    SELECT s.id, s.submitted_at, u.fullname AS candidate_name, a.title AS assessment_title, s.result
    FROM assessment_submissions s
    JOIN users u ON u.id = s.candidate_id
    JOIN assessments a ON a.id = s.assessment_id
    WHERE s.status IN ('Submitted', 'Auto Submitted') AND s.submitted_at IS NOT NULL
    ORDER BY s.submitted_at DESC
    LIMIT $1`;
  const { rows } = await pool.query(query, [EVENT_LIMIT_PER_SOURCE]);
  return rows.map((row) => ({
    key: `assessment_completed:${row.id}`,
    category: "assessments",
    title: "Assessment Completed",
    description: `${row.candidate_name} completed the ${row.assessment_title} assessment${
      row.result ? ` (${row.result})` : ""
    }.`,
    relatedName: row.candidate_name,
    occurredAt: row.submitted_at
  }));
};
const fetchAnnouncementsSent = async () => {
  const query = `
    SELECT an.id, an.title, an.audience, an.created_at, ad.fullname AS admin_name
    FROM admin_notifications an
    JOIN admins ad ON ad.id = an.admin_id
    ORDER BY an.created_at DESC
    LIMIT $1`;
  const { rows } = await pool.query(query, [EVENT_LIMIT_PER_SOURCE]);
  const audienceLabel = {
    all: "users & recruiters",
    jobseeker: "users",
    recruiter: "recruiters"
  };
  return rows.map((row) => ({
    key: `announcement_sent:${row.id}`,
    category: "announcement",
    title: "Announcement Sent",
    description: `${row.admin_name} sent an announcement to ${
      audienceLabel[row.audience] || row.audience
    }: "${row.title}"`,
    relatedName: row.admin_name,
    occurredAt: row.created_at
  }));
};
const getRecentAdminActivity = async (limit = FEED_LIMIT) => {
  const results = await Promise.all([
    fetchJobseekerRegistrations(),
    fetchRecruiterRegistrations(),
    fetchCompanyProfilesCreated(),
    fetchCompanyProfilesUpdated(),
    fetchJobSeekerProfileUpdates(),
    fetchJobsPosted(),
    fetchApplicationsSubmitted(),
    fetchApplicationsShortlisted(),
    fetchApplicationsRejected(),
    fetchInterviewsScheduled(),
    fetchAssessmentsAssigned(),
    fetchAssessmentsCompleted(),
    fetchAnnouncementsSent()
  ]);
  const merged = results.flat().filter((item) => item.occurredAt);
  merged.sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));
  return merged.slice(0, limit);
};
const getReadActivityKeys = async (adminId) => {
  const query = `SELECT activity_key FROM admin_notification_reads WHERE admin_id = $1`;
  const { rows } = await pool.query(query, [adminId]);
  return new Set(rows.map((row) => row.activity_key));
};
const markActivityKeyRead = async (adminId, activityKey) => {
  const query = `
    INSERT INTO admin_notification_reads (admin_id, activity_key)
    VALUES ($1, $2)
    ON CONFLICT (admin_id, activity_key) DO NOTHING
    RETURNING id`;
  const result = await pool.query(query, [adminId, activityKey]);
  return result.rows[0] || null;
};
const markActivityKeysRead = async (adminId, activityKeys = []) => {
  if (!activityKeys.length) return 0;
  const values = [];
  const placeholders = activityKeys
    .map((key, index) => {
      const base = index * 2;
      values.push(adminId, key);
      return `($${base + 1}, $${base + 2})`;
    })
    .join(", ");
  const query = `
    INSERT INTO admin_notification_reads (admin_id, activity_key)
    VALUES ${placeholders}
    ON CONFLICT (admin_id, activity_key) DO NOTHING`;
  await pool.query(query, values);
  return activityKeys.length;
};
module.exports = {
  getRecentAdminActivity,
  getReadActivityKeys,
  markActivityKeyRead,
  markActivityKeysRead
};
