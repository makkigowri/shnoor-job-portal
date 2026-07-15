require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../config/db");
const run = async () => {
  const [, , fullnameArg, emailArg, passwordArg] = process.argv;
  const fullname = fullnameArg || "Super Admin";
  const email = (emailArg || "admin@shnoor.com").toLowerCase();
  const password = passwordArg || "Admin@123";
  try {
    const existing = await pool.query("SELECT id FROM admins WHERE email = $1", [email]);
    if (existing.rows[0]) {
      console.log(`An admin with email "${email}" already exists. Nothing to do.`);
      process.exit(0);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO admins (fullname, email, password) VALUES ($1, $2, $3) RETURNING id, fullname, email, created_at`,
      [fullname, email, hashedPassword]
    );
    console.log("Admin account created successfully:");
    console.log(result.rows[0]);
    console.log(`\nLogin at /admin/login with:\n  email: ${email}\n  password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin:", error.message);
    process.exit(1);
  }
};
run();
