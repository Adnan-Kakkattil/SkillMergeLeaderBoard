import { query } from "../db.js";
import { verifyAuthToken } from "../utils/jwt.js";

const extractBearerToken = (headerValue) => {
  if (!headerValue) {
    return "";
  }

  const [scheme, token] = headerValue.split(" ");
  if (scheme?.toLowerCase() !== "bearer") {
    return "";
  }

  return token || "";
};

export const requireAuth = async (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: "Authentication token missing." });
  }

  try {
    const payload = verifyAuthToken(token);
    const users = await query("SELECT id, username, role FROM users WHERE id = ? LIMIT 1", [payload.sub]);

    if (!users.length) {
      return res.status(401).json({ error: "User no longer exists." });
    }

    req.user = users[0];
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required." });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "You are not allowed to perform this action." });
  }

  return next();
};
