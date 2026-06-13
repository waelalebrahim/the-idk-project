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

  const owned = await env.DB.prepare(
    "SELECT id FROM conversations WHERE id = ? AND user_id = ?"
  ).bind(id, user.id).first();
  if (!owned) return json({ error: "not_found" }, 404);

  await env.DB.prepare("DELETE FROM messages WHERE conversation_id = ?").bind(id).run();
  await env.DB.prepare("DELETE FROM conversations WHERE id = ?").bind(id).run();
  return json({ ok: true });
}