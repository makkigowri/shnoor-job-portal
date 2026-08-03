require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");
const run = async () => {
  const filePath = path.join(__dirname, "..", "database", "migration_013_application_resume_id.sql");
  const sql = fs.readFileSync(filePath, "utf8");
  try {
    console.log("Running migration_013_application_resume_id.sql ...");
    await pool.query(sql);
    console.log("Migration completed successfully. applications.resume_id is ready.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
};
run();
