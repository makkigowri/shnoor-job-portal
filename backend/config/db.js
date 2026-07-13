const { Pool } = require("pg");
require("dotenv").config();
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
pool.on("connect", () => {
  console.log("PostgreSQL connected");
});
pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error", err);
  process.exit(1);
});
module.exports = pool;
