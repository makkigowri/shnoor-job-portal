const pool = require("../config/db");
const parseSalaryRange = require("../utils/parseSalary");
const JOB_WITH_COMPANY_SELECT = `
  SELECT
    j.*,u.fullname AS recruiter_name,c.company_name,c.logo_path AS company_logo,c.website AS company_website,c.industry AS company_industry,c.headquarters AS company_headquarters,
    c.description AS company_description FROM jobs j JOIN users u ON u.id = j.recruiter_id LEFT JOIN companies c ON c.recruiter_id = j.recruiter_id `;
const createJob = async (recruiterId, job) => {
  const {title,department,employmentType,experience,salary,location,skills,openings,description,responsibilities,requirements
  } = job;
  const { min, max } = parseSalaryRange(salary);
  const query = `
    INSERT INTO jobs
      (recruiter_id, title, department, employment_type, experience, salary, salary_min, salary_max,
       location, skills, openings, description, responsibilities, requirements)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    RETURNING *`;
  const values = [
    recruiterId,
    title,department || null,employmentType || "Full Time",experience || null,salary || null,min,max,location || null,skills || null,openings || 1,description || null,responsibilities || null,
    requirements || null
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};
const updateJob = async (jobId, recruiterId, job) => {
  const {title,department,employmentType,experience,salary,location,skills,openings,description,responsibilities,requirements,status} = job;
  const { min, max } = parseSalaryRange(salary);
  const query = `UPDATE jobs SET
      title = $1,department = $2,employment_type = $3,experience = $4,salary = $5,salary_min = $6,salary_max = $7,location = $8,skills = $9,openings = $10,description = $11,
      responsibilities = $12,requirements = $13,status = COALESCE($14, status)
    WHERE id = $15 AND recruiter_id = $16
    RETURNING * `;
  const values = [
    title,department || null,employmentType || "Full Time",experience || null,salary || null,min,max,location || null,skills || null,openings || 1,description || null,
    responsibilities || null,requirements || null,status || null,jobId,recruiterId];
  const result = await pool.query(query, values);
  return result.rows[0];
};
const deleteJob = async (jobId, recruiterId) => {
  const query = `DELETE FROM jobs WHERE id = $1 AND recruiter_id = $2 RETURNING id`;
  const result = await pool.query(query, [jobId, recruiterId]);
  return result.rows[0];
};
const findJobById = async (jobId, viewerId) => {
  if (viewerId) {
    const query = `
      SELECT
        j.*,u.fullname AS recruiter_name,c.company_name,c.logo_path AS company_logo,c.website AS company_website,c.industry AS company_industry,c.headquarters AS company_headquarters,
        c.description AS company_description,(sj.id IS NOT NULL) AS is_saved,ap.status AS application_status
      FROM jobs j JOIN users u ON u.id = j.recruiter_id LEFT JOIN companies c ON c.recruiter_id = j.recruiter_id LEFT JOIN saved_jobs sj ON sj.job_id = j.id AND sj.user_id = $2
      LEFT JOIN applications ap ON ap.job_id = j.id AND ap.user_id = $2 WHERE j.id = $1  `;
    const result = await pool.query(query, [jobId, viewerId]);
    return result.rows[0];
  }
  const query = `${JOB_WITH_COMPANY_SELECT} WHERE j.id = $1`;
  const result = await pool.query(query, [jobId]);
  return result.rows[0];
};
const findJobsByRecruiter = async (recruiterId) => {
  const query = `
    SELECT j.*, COUNT(a.id)::int AS applications_count FROM jobs j LEFT JOIN applications a ON a.job_id = j.id WHERE j.recruiter_id = $1 GROUP BY j.id
    ORDER BY j.created_at DESC `;
  try {
    const result = await pool.query(query, [recruiterId]);
    return result.rows;
  } catch (error) {
    const fallback = `SELECT * FROM jobs WHERE recruiter_id = $1 ORDER BY created_at DESC`;
    const result = await pool.query(fallback, [recruiterId]);
    return result.rows.map((row) => ({ ...row, applications_count: 0 }));
  }
};
const searchJobs = async (filters, viewerId) => {
  const {
    title,location,experience,employmentType,salaryMin,salaryMax,page = 1,limit = 10} = filters;
  const conditions = [`j.status = 'Active'`];
  const values = [];
  let idx = 1;
  if (title) {
    conditions.push(`j.title ILIKE $${idx}`);
    values.push(`%${title}%`);
    idx += 1;
  }
  if (location) {
    conditions.push(`j.location ILIKE $${idx}`);
    values.push(`%${location}%`);
    idx += 1;
  }
  if (experience) {
    conditions.push(`j.experience ILIKE $${idx}`);
    values.push(`%${experience}%`);
    idx += 1;
  }
  if (employmentType) {
    conditions.push(`j.employment_type = $${idx}`);
    values.push(employmentType);
    idx += 1;
  }
  if (salaryMin) {
    conditions.push(`(j.salary_max IS NULL OR j.salary_max >= $${idx})`);
    values.push(salaryMin);
    idx += 1;
  }
  if (salaryMax) {
    conditions.push(`(j.salary_min IS NULL OR j.salary_min <= $${idx})`);
    values.push(salaryMax);
    idx += 1;
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (Math.max(page, 1) - 1) * limit;
  const countQuery = `SELECT COUNT(*)::int AS total FROM jobs j ${whereClause}`;
  const countResult = await pool.query(countQuery, values);
  const total = countResult.rows[0].total;
  const viewerIdx = idx;
  const limitIdx = idx + 1;
  const offsetIdx = idx + 2;
  const dataQuery = `
    SELECT
      j.*,u.fullname AS recruiter_name,c.company_name,c.logo_path AS company_logo,c.website AS company_website,c.industry AS company_industry,c.headquarters AS company_headquarters,
      c.description AS company_description,(sj.id IS NOT NULL) AS is_saved,ap.status AS application_status
    FROM jobs j JOIN users u ON u.id = j.recruiter_id LEFT JOIN companies c ON c.recruiter_id = j.recruiter_id
    LEFT JOIN saved_jobs sj ON sj.job_id = j.id AND sj.user_id = $${viewerIdx}
    LEFT JOIN applications ap ON ap.job_id = j.id AND ap.user_id = $${viewerIdx}
    ${whereClause}
    ORDER BY j.created_at DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx} `;
  const dataValues = [...values, viewerId || null, limit, offset];
  const dataResult = await pool.query(dataQuery, dataValues);
  return {
    jobs: dataResult.rows,total,page: Number(page),limit: Number(limit),totalPages: Math.max(Math.ceil(total / limit), 1)
  };
};
module.exports = {createJob,updateJob,deleteJob,findJobById,findJobsByRecruiter,searchJobs};