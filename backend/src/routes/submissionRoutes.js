import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { compareSecret } from "../utils/password.js";
import { asTrimmedString, requirePositiveInt, sendValidationError } from "../utils/validation.js";

const router = Router();

const matchesAnswerFormat = (answer, answerFormat) => {
  if (!answerFormat) {
    return true;
  }

  try {
    const regex = new RegExp(answerFormat);
    return regex.test(answer);
  } catch {
    return answer.startsWith(answerFormat);
  }
};

router.post("/submissions", requireAuth, requireRole("player"), async (req, res, next) => {
  const answer = asTrimmedString(req.body.answer);

  if (!answer) {
    return sendValidationError(res, "answer is required.");
  }

  let challengeId;
  try {
    challengeId = requirePositiveInt(req.body.challengeId, "challengeId");
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [challengeRows] = await connection.execute(
      `SELECT id, answer_hash, answer_format, points, is_active
       FROM challenges
       WHERE id = ?
       LIMIT 1`,
      [challengeId]
    );

    if (!challengeRows.length || !challengeRows[0].is_active) {
      await connection.rollback();
      return res.status(404).json({ error: "Challenge not found or inactive." });
    }

    const challenge = challengeRows[0];
    const formatMatched = matchesAnswerFormat(answer, challenge.answer_format);

    const [solveRows] = await connection.execute(
      `SELECT id
       FROM solves
       WHERE user_id = ? AND challenge_id = ?
       LIMIT 1`,
      [req.user.id, challengeId]
    );

    if (solveRows.length) {
      await connection.rollback();
      return res.status(409).json({ error: "Challenge already solved by this player." });
    }

    const isCorrect = formatMatched && (await compareSecret(answer, challenge.answer_hash));

    const [submissionResult] = await connection.execute(
      `INSERT INTO submissions (user_id, challenge_id, submitted_answer, is_correct)
       VALUES (?, ?, ?, ?)`,
      [req.user.id, challengeId, answer, isCorrect ? 1 : 0]
    );

    let pointsAwarded = 0;

    if (isCorrect) {
      pointsAwarded = Number(challenge.points);
      await connection.execute(
        `INSERT INTO solves (user_id, challenge_id, submission_id, points_awarded)
         VALUES (?, ?, ?, ?)`,
        [req.user.id, challengeId, submissionResult.insertId, pointsAwarded]
      );
    }

    const [[failedAttemptRow]] = await connection.execute(
      `SELECT COUNT(*) AS failedAttempts
       FROM submissions
       WHERE user_id = ? AND challenge_id = ? AND is_correct = 0`,
      [req.user.id, challengeId]
    );

    await connection.commit();

    const message = isCorrect
      ? "Correct flag submitted."
      : formatMatched
        ? "Incorrect answer, try again."
        : "Submitted answer does not match required format.";

    return res.status(201).json({
      correct: isCorrect,
      pointsAwarded,
      failedAttempts: Number(failedAttemptRow.failedAttempts || 0),
      formatMatched,
      message,
      submission: {
        id: submissionResult.insertId,
        challengeId,
        isCorrect,
      },
    });
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
});

export default router;
