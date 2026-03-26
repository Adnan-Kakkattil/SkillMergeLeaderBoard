import mysql from "mysql2/promise";
import { config } from "./config.js";

export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: config.db.connectionLimit,
  queueLimit: 0,
});

export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function verifyDatabaseConnection() {
  for (let attempt = 1; attempt <= config.db.retries; attempt += 1) {
    try {
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      return;
    } catch (error) {
      if (attempt === config.db.retries) {
        throw error;
      }
      // eslint-disable-next-line no-console
      console.warn(`[db] waiting for mysql (attempt ${attempt}/${config.db.retries}): ${error.message}`);
      await sleep(config.db.retryDelayMs);
    }
  }
}
