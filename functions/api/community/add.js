import { json, readSession, getCookie } from "../auth/_lib.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: "db_unavailable" }, 500);

  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  const type = body.type === "flag" ? "flag" : "gap";
  const text = String(body.text || "").trim().slice(0, 500);
  const answer = String(body.answer || "").trim().slice(0, 2000);
  if (!text) return json({ error: "missing_text" }, 400);

  let uid = null;
  try {
    const token = getCookie(request, "idk_session");
    const sess = token ? await readSession(env.SESSION_SECRET, token) : null;
    if (sess) uid = sess.uid;
  } catch {}

  if (type === "gap") {
    const norm = text.toLowerCase();
    const existing = await env.DB.prepare(
      "SELECT id, votes FROM gap_board WHERE type='gap' AND lower(text) = ? AND hidden=0"
    ).bind(norm).first();
    if (existing) {
      await env.DB.prepare("UPDATE gap_board SET votes = votes + 1 WHERE id = ?").bind(existing.id).run();
      return json({ ok: true, id: existing.id, deduped: true });
    }
  }

  const id = (type === "gap" ? "g_" : "f_") + crypto.randomUUID().slice(0, 10);
  await env.DB.prepare(
    "INSERT INTO gap_board (id, type, text, answer, votes, created_by, created_at, hidden) VALUES (?, ?, ?, ?, 1, ?, ?, 0)"
  ).bind(id, type, text, answer, uid, Date.now()).run();
  return json({ ok: true, id });
}