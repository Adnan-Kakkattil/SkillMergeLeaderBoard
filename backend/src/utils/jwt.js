import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function signAuthToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, config.jwtSecret);
}
