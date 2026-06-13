import { verifyPassword, createSession, sessionCookie, json } from "./_lib.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: "db_unavailable" }, 500);
  const secret = env.SESSION_SECRET;
  if (!secret) return json({ error: "server_misconfigured" }, 500);

  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  const username = (body.username || "").trim();
  const password = body.password || "";
  if (!username || !password) return json({ error: "missing_credentials" }, 400);

  const user = await env.DB.prepare(
    "SELECT id, username, password_hash FROM users WHERE username = ?"
  ).bind(username).first();

  if (!user) return json({ error: "invalid_login" }, 401);
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return json({ error: "invalid_login" }, 401);

  const token = await createSession(secret, user.id);
  return json({ ok: true, user: { id: user.id, username: user.username } },
    200, { "Set-Cookie": sessionCookie(token) });
}