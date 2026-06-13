// Helper: resolve the logged-in user from the session cookie, and check admin.
import { readSession, getCookie } from "../auth/_lib.js";

export async function getUser(context) {
  const { request, env } = context;
  const secret = env.SESSION_SECRET;
  if (!secret || !env.DB) return null;
  const token = getCookie(request, "idk_session");
  const session = await readSession(secret, token);
  if (!session) return null;
  const user = await env.DB.prepare("SELECT id, username FROM users WHERE id = ?")
    .bind(session.uid).first();
  return user || null;
}

export function isAdmin(user, env) {
  if (!user) return false;
  const adminName = env.ADMIN_USERNAME || "";
  return adminName && user.username === adminName;
}