import { hashPassword, createSession, sessionCookie, json,
         validUsername, validPassword, validEmail } from "./_lib.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: "db_unavailable" }, 500);
  const secret = env.SESSION_SECRET;
  if (!secret) return json({ error: "server_misconfigured" }, 500);

  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  const username = (body.username || "").trim();
  const password = body.password || "";
  const email = (body.email || "").trim();

  if (!validUsername(username)) return json({ error: "invalid_username" }, 400);
  if (!validPassword(password)) return json({ error: "invalid_password" }, 400);
  if (!validEmail(email)) return json({ error: "invalid_email" }, 400);

  const existing = await env.DB.prepare("SELECT id FROM users WHERE username = ?")
    .bind(username).first();
  if (existing) return json({ error: "username_taken" }, 409);

  const id = crypto.randomUUID();
  const password_hash = await hashPassword(password);
  const created_at = Date.now();

  await env.DB.prepare(
    "INSERT INTO users (id, username, password_hash, email, created_at) VALUES (?, ?, ?, ?, ?)"
  ).bind(id, username, password_hash, email || null, created_at).run();

  const token = await createSession(secret, id);
  return json({ ok: true, user: { id, username } }, 200, { "Set-Cookie": sessionCookie(token) });
}