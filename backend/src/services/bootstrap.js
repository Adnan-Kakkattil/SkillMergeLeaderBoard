import { query } from "../db.js";
import { config } from "../config.js";
import { hashSecret } from "../utils/password.js";

async function ensureUser(usernameInput, password, role) {
  const username = usernameInput.trim().toLowerCase();

  if (!username || !password) {
    return;
  }

  const existing = await query("SELECT id FROM users WHERE username = ? LIMIT 1", [username]);
  if (existing.length) {
    return;
  }

  const passwordHash = await hashSecret(password);
  await query("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", [
    username,
    passwordHash,
    role,
  ]);

  // eslint-disable-next-line no-console
  console.info(`[bootstrap] Created ${role} user: ${username}`);
}

export async function ensureBootstrapUsers() {
  await ensureUser(config.bootstrapAdmin.username, config.bootstrapAdmin.password, "admin");

  if (config.bootstrapPlayer.username && config.bootstrapPlayer.password) {
    await ensureUser(config.bootstrapPlayer.username, config.bootstrapPlayer.password, "player");
  }
}
