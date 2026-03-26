import dotenv from "dotenv";

dotenv.config();

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: toInt(process.env.PORT, 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  jwtSecret: process.env.JWT_SECRET ?? "dev_only_change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "12h",
  bcryptRounds: toInt(process.env.BCRYPT_ROUNDS, 10),
  db: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: toInt(process.env.DB_PORT, 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "skillmerge",
    connectionLimit: toInt(process.env.DB_CONNECTION_LIMIT, 10),
    retries: toInt(process.env.DB_RETRIES, 20),
    retryDelayMs: toInt(process.env.DB_RETRY_DELAY_MS, 2000),
  },
  bootstrapAdmin: {
    username: process.env.ADMIN_USERNAME ?? "admin",
    password: process.env.ADMIN_PASSWORD ?? "admin12345",
  },
  bootstrapPlayer: {
    username: process.env.PLAYER_USERNAME ?? "",
    password: process.env.PLAYER_PASSWORD ?? "",
  },
};

if (config.jwtSecret === "dev_only_change_me") {
  // eslint-disable-next-line no-console
  console.warn("[warn] JWT_SECRET is using default value. Set a secure secret for production.");
}
