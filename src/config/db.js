import { Pool } from "pg";
import { config } from "dotenv";
config();

const pool = new Pool({
  database: process.env.DB_DB,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  password: process.env.DB_PASS,
  user: process.env.DB_USER,
});
export default pool;
