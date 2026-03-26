import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/challenges", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        c.id,
        c.title,
        c.description,
        c.category,
        c.points,
        c.answer_format AS answerFormat,
        c.hint,
        c.is_active AS isActive,
        c.created_at AS createdAt,
        c.updated_at AS updatedAt,
        CASE WHEN s.id IS NULL THEN 0 ELSE 1 END AS solved,
        (
          SELECT COUNT(*)
          FROM submissions sub
          WHERE sub.challenge_id = c.id
            AND sub.user_id = ?
        ) AS attempts,
        (
          SELECT COUNT(*)
          FROM submissions sub
          WHERE sub.challenge_id = c.id
            AND sub.user_id = ?
            AND sub.is_correct = 0
        ) AS failedAttempts
      FROM challenges c
      LEFT JOIN solves s ON s.challenge_id = c.id AND s.user_id = ?
      WHERE c.is_active = 1
      ORDER BY c.points DESC, c.id ASC`,
      [req.user.id, req.user.id, req.user.id]
    );

    return res.json({
      challenges: rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        points: Number(row.points),
        answerFormat: row.answerFormat,
        hint: row.hint,
        isActive: Boolean(row.isActive),
        solved: Boolean(row.solved),
        attempts: Number(row.attempts),
        failedAttempts: Number(row.failedAttempts),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })),
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
