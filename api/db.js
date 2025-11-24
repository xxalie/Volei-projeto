const mysql = require("mysql2/promise");
require("dotenv").config();

const isAiven =
  process.env.DB_HOST && !process.env.DB_HOST.includes("localhost");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "volei_db",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // Aiven exige SSL, mas local não
  ssl: isAiven
    ? {
        rejectUnauthorized: false, // Aiven aceita esse "modo seguro"
      }
    : undefined,
});

module.exports = pool;
