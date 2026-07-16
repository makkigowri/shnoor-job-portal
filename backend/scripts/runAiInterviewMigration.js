require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");
const run = async () => {
  const filePath = path.join(__dirname, "..", "database", "migration_009_ai_interview_module.sql");
  const sql = fs.readFileSync(filePath, "utf8");
  try {
    console.log("Running migration_009_ai_interview_module.sql ...");
    await pool.query(sql);
    console.log("Migration completed successfully. AI Interview tables are ready.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
};
run();
