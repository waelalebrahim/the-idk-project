import { json } from "../auth/_lib.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: "db_unavailable" }, 500);
  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  const id = String(body.id || "").trim();
  if (!id) return json({ error: "missing_id" }, 400);
  await env.DB.prepare("UPDATE gap_board SET votes = votes + 1 WHERE id = ?").bind(id).run();
  const row = await env.DB.prepare("SELECT votes FROM gap_board WHERE id = ?").bind(id).first();
  return json({ ok: true, votes: row ? row.votes : null });
}