import { Router } from "express";
import { pool } from "../db.js";
import { compareSecret, hashSecret } from "../utils/password.js";
import { signAuthToken } from "../utils/jwt.js";
import { requireAuth } from "../middleware/auth.js";
import { asTrimmedString, assertLength, sendValidationError } from "../utils/validation.js";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const username = asTrimmedString(req.body.username).toLowerCase();
    const password = asTrimmedString(req.body.password);

    if (!username || !password) {
      return sendValidationError(res, "Username and password are required.");
    }

    assertLength(username, "username", 3, 64);
    assertLength(password, "password", 6, 128);

    const [existing] = await pool.execute("SELECT id FROM users WHERE username = ? LIMIT 1", [username]);
    if (existing.length) {
      return res.status(409).json({ error: "Username already exists." });
    }

    const passwordHash = await hashSecret(password);
    await pool.execute("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'player')", [
      username,
      passwordHash,
    ]);

    return res.status(201).json({ message: "Player account created." });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const username = asTrimmedString(req.body.username).toLowerCase();
    const password = asTrimmedString(req.body.password);

    if (!username || !password) {
      return sendValidationError(res, "Username and password are required.");
    }

    assertLength(username, "username", 3, 64);
    assertLength(password, "password", 6, 128);

    const [rows] = await pool.execute(
      `SELECT id, username, password_hash, role
       FROM users
       WHERE username = ?
       LIMIT 1`,
      [username]
    );

    if (!rows.length) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const user = rows[0];
    const isValid = await compareSecret(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    await pool.execute("UPDATE users SET last_login_at = NOW() WHERE id = ?", [user.id]);

    const token = signAuthToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return next(error);
  }
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

export default router;
