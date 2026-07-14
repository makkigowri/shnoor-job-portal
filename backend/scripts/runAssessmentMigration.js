require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

const run = async () => {
  const filePath = path.join(__dirname, "..", "database", "migration_005_assessment_module.sql");
  const sql = fs.readFileSync(filePath, "utf8");
  try {
    console.log("Running migration_005_assessment_module.sql ...");
    await pool.query(sql);
    console.log("Migration completed successfully. Assessment tables/columns are ready.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
};

run();
