import { json } from "../auth/_lib.js";
import { getUser } from "../sources/_admin.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: "db_unavailable" }, 500);
  const user = await getUser(context);
  if (!user) return json({ error: "login_required" }, 401);

  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  let convId = (body.id || "").trim();
  const title = (body.title || "Untitled").slice(0, 200);
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const now = Date.now();

  if (convId) {
    const owned = await env.DB.prepare(
      "SELECT id FROM conversations WHERE id = ? AND user_id = ?"
    ).bind(convId, user.id).first();
    if (!owned) convId = "";
  }
  if (!convId) {
    convId = crypto.randomUUID();
    await env.DB.prepare(
      "INSERT INTO conversations (id, user_id, title, summary, created_at, updated_at) VALUES (?, ?, ?, '', ?, ?)"
    ).bind(convId, user.id, title, now, now).run();
  } else {
    await env.DB.prepare(
      "UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?"
    ).bind(title, now, convId).run();
  }

  await env.DB.prepare("DELETE FROM messages WHERE conversation_id = ?").bind(convId).run();
  for (const m of messages) {
    const role = m.role === "assistant" ? "assistant" : "user";
    const content = String(m.content || "").slice(0, 20000);
    const citations = m.citations ? JSON.stringify(m.citations).slice(0, 5000) : null;
    await env.DB.prepare(
      "INSERT INTO messages (id, conversation_id, role, content, citations, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(crypto.randomUUID(), convId, role, content, citations, Date.now()).run();
  }

  return json({ ok: true, id: convId });
}