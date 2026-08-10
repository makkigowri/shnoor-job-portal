require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");
const run = async () => {
  const filePath = path.join(__dirname, "..", "database", "migration_014_contact_requests.sql");
  const sql = fs.readFileSync(filePath, "utf8");
  try {
    console.log("Running migration_014_contact_requests.sql ...");
    await pool.query(sql);
    console.log("Migration completed successfully. Contact requests table is ready.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
};
run();
