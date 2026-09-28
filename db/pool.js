import { Pool } from "pg";
import { loadEnvFile } from "node:process";
try {
  loadEnvFile();
} catch (e) {} // oxlint-disable-line

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
