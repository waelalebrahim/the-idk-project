import { json } from "../auth/_lib.js";
import { getUser } from "../sources/_admin.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: "db_unavailable" }, 500);
  const user = await getUser(context);
  if (!user) return json({ error: "login_required" }, 401);

  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  const id = (body.id || "").trim();
  if (!id) return json({ error: "missing_id" }, 400);

  const conv = await env.DB.prepare(
    "SELECT id, title FROM conversations WHERE id = ? AND user_id = ?"
  ).bind(id, user.id).first();
  if (!conv) return json({ error: "not_found" }, 404);

  const { results } = await env.DB.prepare(
    "SELECT role, content, citations, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC"
  ).bind(id).all();

  return json({ conversation: conv, messages: results || [] });
}