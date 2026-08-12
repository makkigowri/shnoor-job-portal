// One-time, optional backfill: copies any resume files that still exist on
// the currently-running Render instance's local /uploads folder into the
// persistent resume_files table in Postgres, matching them up against the
// resume_path values already stored in job_seeker_profiles, user_resumes,
// and applications.
//
// Run this ONCE, on a live instance, BEFORE it next sleeps/restarts:
//   npm run backfill:resume-files
//
// Files that are no longer on disk (already lost to a previous restart)
// cannot be recovered by this script - those users will need to re-upload
// their resume once, after which it will be persisted going forward.
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");
const { saveResumeFile } = require("../models/resumeFileModel");
const { uploadDir } = require("../middleware/upload");

const guessMimetype = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (ext === ".doc") return "application/msword";
  return "application/octet-stream";
};

const run = async () => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT resume_path FROM (
        SELECT resume_path FROM job_seeker_profiles WHERE resume_path IS NOT NULL
        UNION
        SELECT resume_path FROM user_resumes WHERE resume_path IS NOT NULL
        UNION
        SELECT resume_path FROM applications WHERE resume_path IS NOT NULL
      ) AS all_paths
    `);

    let backfilled = 0;
    let missing = 0;

    for (const row of result.rows) {
      const filename = path.basename(row.resume_path);
      const fullPath = path.join(uploadDir, filename);
      if (!fs.existsSync(fullPath)) {
        missing += 1;
        continue;
      }
      const buffer = fs.readFileSync(fullPath);
      await saveResumeFile(filename, buffer, guessMimetype(filename));
      backfilled += 1;
      console.log(`Backfilled: ${filename}`);
    }

    console.log(`Done. Backfilled ${backfilled} file(s). ${missing} file(s) were already gone from disk and could not be recovered.`);
    process.exit(0);
  } catch (error) {
    console.error("Backfill failed:", error.message);
    process.exit(1);
  }
};

run();
