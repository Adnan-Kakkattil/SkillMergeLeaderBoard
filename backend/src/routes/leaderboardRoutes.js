import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/leaderboard", async (_req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        u.id,
        u.username,
        COALESCE(SUM(s.points_awarded), 0) AS score,
        COUNT(DISTINCT s.challenge_id) AS solvedCount,
        COALESCE(SUM(CASE WHEN sub.is_correct = 0 THEN 1 ELSE 0 END), 0) AS failedAttempts,
        MAX(s.solved_at) AS lastSolveAt
      FROM users u
      LEFT JOIN solves s ON s.user_id = u.id
      LEFT JOIN submissions sub ON sub.user_id = u.id
      WHERE u.role = 'player'
      GROUP BY u.id, u.username
      ORDER BY score DESC, solvedCount DESC, lastSolveAt ASC, u.username ASC`
    );

    const leaderboard = rows.map((row, index) => ({
      rank: index + 1,
      userId: row.id,
      username: row.username,
      score: Number(row.score),
      solvedCount: Number(row.solvedCount),
      failedAttempts: Number(row.failedAttempts),
      lastSolveAt: row.lastSolveAt,
    }));

    return res.json({ leaderboard });
  } catch (error) {
    return next(error);
  }
});

export default router;
