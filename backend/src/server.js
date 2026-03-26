import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config.js";
import { verifyDatabaseConnection } from "./db.js";
import { ensureBootstrapUsers } from "./services/bootstrap.js";
import authRoutes from "./routes/authRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errors.js";

const app = express();

const corsOrigin = config.corsOrigin === "*" ? true : config.corsOrigin.split(",").map((item) => item.trim());

app.use(
  cors({
    origin: corsOrigin,
    credentials: false,
  })
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api", leaderboardRoutes);
app.use("/api", challengeRoutes);
app.use("/api", submissionRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    await verifyDatabaseConnection();
    await ensureBootstrapUsers();

    app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.info(`[api] Listening on port ${config.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[api] Failed to start server:", error);
    process.exit(1);
  }
}

start();
