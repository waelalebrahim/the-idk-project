import { readSession, getCookie, json } from "./_lib.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const secret = env.SESSION_SECRET;
  if (!secret || !env.DB) return json({ user: null });

  const token = getCookie(request, "idk_session");
  const session = await readSession(secret, token);
  if (!session) return json({ user: null });

  const user = await env.DB.prepare("SELECT id, username FROM users WHERE id = ?")
    .bind(session.uid).first();
  return json({ user: user || null });
}