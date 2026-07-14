require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

const run = async () => {
  const filePath = path.join(__dirname, "..", "database", "migration_007_drop_legacy_check_constraint.sql");
  const sql = fs.readFileSync(filePath, "utf8");
  try {
    console.log("Running migration_007_drop_legacy_check_constraint.sql ...");
    await pool.query(sql);
    console.log("Migration completed successfully. Legacy check constraint removed (if it existed).");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
};

run();
