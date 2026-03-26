import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { hashSecret } from "../utils/password.js";
import {
  asTrimmedString,
  assertLength,
  normalizeOptionalString,
  requirePositiveInt,
  sendValidationError,
} from "../utils/validation.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/users", async (_req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, username, role, created_at AS createdAt, last_login_at AS lastLoginAt
       FROM users
       ORDER BY created_at DESC`
    );

    return res.json({ users: rows });
  } catch (error) {
    return next(error);
  }
});

router.post("/users", async (req, res, next) => {
  try {
    const username = asTrimmedString(req.body.username).toLowerCase();
    const password = asTrimmedString(req.body.password);
    const role = req.body.role === "admin" ? "admin" : "player";

    if (!username || !password) {
      return sendValidationError(res, "username and password are required.");
    }

    assertLength(username, "username", 3, 64);
    assertLength(password, "password", 6, 128);

    const [existing] = await pool.execute("SELECT id FROM users WHERE username = ? LIMIT 1", [username]);
    if (existing.length) {
      return res.status(409).json({ error: "Username already exists." });
    }

    const passwordHash = await hashSecret(password);
    const [result] = await pool.execute(
      `INSERT INTO users (username, password_hash, role)
       VALUES (?, ?, ?)`,
      [username, passwordHash, role]
    );

    return res.status(201).json({
      user: {
        id: result.insertId,
        username,
        role,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return next(error);
  }
});

router.get("/challenges", async (_req, res, next) => {
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
        c.created_by AS createdBy,
        (
          SELECT COUNT(*)
          FROM solves s
          WHERE s.challenge_id = c.id
        ) AS solveCount,
        (
          SELECT COUNT(*)
          FROM submissions sub
          WHERE sub.challenge_id = c.id
            AND sub.is_correct = 0
        ) AS failedAttempts
      FROM challenges c
      ORDER BY c.created_at DESC`
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
        createdBy: row.createdBy,
        solveCount: Number(row.solveCount),
        failedAttempts: Number(row.failedAttempts),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })),
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/challenges", async (req, res, next) => {
  try {
    const title = asTrimmedString(req.body.title);
    const description = asTrimmedString(req.body.description);
    const category = asTrimmedString(req.body.category);
    const answer = asTrimmedString(req.body.answer);

    if (!title || !description || !category || !answer) {
      return sendValidationError(res, "title, description, category, and answer are required.");
    }

    assertLength(title, "title", 3, 160);
    assertLength(description, "description", 8, 4000);
    assertLength(category, "category", 2, 80);
    assertLength(answer, "answer", 2, 255);

    const points = requirePositiveInt(req.body.points, "points");
    const answerFormat = normalizeOptionalString(req.body.answerFormat);
    const hint = normalizeOptionalString(req.body.hint);

    if (answerFormat) {
      assertLength(answerFormat, "answerFormat", 2, 160);
    }

    if (hint) {
      assertLength(hint, "hint", 2, 1000);
    }

    const answerHash = await hashSecret(answer);

    const [result] = await pool.execute(
      `INSERT INTO challenges
      (title, description, category, points, answer_hash, answer_format, hint, is_active, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        category,
        points,
        answerHash,
        answerFormat,
        hint,
        req.body.isActive === false ? 0 : 1,
        req.user.id,
      ]
    );

    return res.status(201).json({
      challenge: {
        id: result.insertId,
        title,
        description,
        category,
        points,
        answerFormat,
        hint,
        isActive: req.body.isActive === false ? false : true,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return next(error);
  }
});

router.patch("/challenges/:id", async (req, res, next) => {
  try {
    const challengeId = requirePositiveInt(req.params.id, "challengeId");
    const updates = [];
    const values = [];

    const maybeSet = (field, value) => {
      updates.push(`${field} = ?`);
      values.push(value);
    };

    if (req.body.title !== undefined) {
      const title = asTrimmedString(req.body.title);
      assertLength(title, "title", 3, 160);
      maybeSet("title", title);
    }

    if (req.body.description !== undefined) {
      const description = asTrimmedString(req.body.description);
      assertLength(description, "description", 8, 4000);
      maybeSet("description", description);
    }

    if (req.body.category !== undefined) {
      const category = asTrimmedString(req.body.category);
      assertLength(category, "category", 2, 80);
      maybeSet("category", category);
    }

    if (req.body.points !== undefined) {
      maybeSet("points", requirePositiveInt(req.body.points, "points"));
    }

    if (req.body.answer !== undefined) {
      const answer = asTrimmedString(req.body.answer);
      assertLength(answer, "answer", 2, 255);
      maybeSet("answer_hash", await hashSecret(answer));
    }

    if (req.body.answerFormat !== undefined) {
      const answerFormat = normalizeOptionalString(req.body.answerFormat);
      if (answerFormat) {
        assertLength(answerFormat, "answerFormat", 2, 160);
      }
      maybeSet("answer_format", answerFormat);
    }

    if (req.body.hint !== undefined) {
      const hint = normalizeOptionalString(req.body.hint);
      if (hint) {
        assertLength(hint, "hint", 2, 1000);
      }
      maybeSet("hint", hint);
    }

    if (req.body.isActive !== undefined) {
      maybeSet("is_active", req.body.isActive ? 1 : 0);
    }

    if (!updates.length) {
      return sendValidationError(res, "No valid fields to update.");
    }

    values.push(challengeId);

    const [result] = await pool.execute(
      `UPDATE challenges
       SET ${updates.join(", ")}, updated_at = NOW()
       WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Challenge not found." });
    }

    return res.json({ success: true });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return next(error);
  }
});

router.get("/submissions", async (req, res, next) => {
  try {
    const limit = Math.min(requirePositiveInt(req.query.limit ?? 50, "limit"), 200);

    const [rows] = await pool.execute(
      `SELECT
        sub.id,
        sub.challenge_id AS challengeId,
        sub.is_correct AS isCorrect,
        sub.created_at AS createdAt,
        u.username,
        c.title AS challengeTitle
      FROM submissions sub
      INNER JOIN users u ON u.id = sub.user_id
      INNER JOIN challenges c ON c.id = sub.challenge_id
      ORDER BY sub.created_at DESC
      LIMIT ?`,
      [limit]
    );

    return res.json({
      submissions: rows.map((row) => ({
        id: row.id,
        challengeId: row.challengeId,
        challengeTitle: row.challengeTitle,
        isCorrect: Boolean(row.isCorrect),
        createdAt: row.createdAt,
        username: row.username,
      })),
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return next(error);
  }
});

export default router;
