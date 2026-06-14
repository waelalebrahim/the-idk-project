import { json } from "../auth/_lib.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: "db_unavailable" }, 500);
  const url = new URL(request.url);
  const id = (url.searchParams.get("id") || "").trim();
  if (!id) return json({ error: "missing_id" }, 400);

  const row = await env.DB.prepare("SELECT payload, created_at FROM shared_answers WHERE id = ?")
    .bind(id).first();
  if (!row) return json({ error: "not_found" }, 404);

  let data;
  try { data = JSON.parse(row.payload); } catch { data = {}; }
  return json({ ok: true, answer: data, created_at: row.created_at });
}