require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");
const run = async () => {
  const filePath = path.join(__dirname, "..", "database", "migration_016_user_resumes_resume_text.sql");
  const sql = fs.readFileSync(filePath, "utf8");
  try {
    console.log("Running migration_016_user_resumes_resume_text.sql ...");
    await pool.query(sql);
    console.log("Migration completed successfully. user_resumes.resume_text is ready.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
};
run();