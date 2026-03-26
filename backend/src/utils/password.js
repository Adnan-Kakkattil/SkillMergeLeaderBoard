import bcrypt from "bcryptjs";
import { config } from "../config.js";

export function hashSecret(value) {
  return bcrypt.hash(value, config.bcryptRounds);
}

export function compareSecret(plain, hash) {
  return bcrypt.compare(plain, hash);
}
