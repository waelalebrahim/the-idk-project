import { json } from "../auth/_lib.js";
import { getUser, isAdmin } from "./_admin.js";

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) return json({ sources: [] });

  const user = await getUser(context);
  const admin = isAdmin(user, env);

  const sql = admin
    ? "SELECT id, title, url, source_date, active, status FROM sources ORDER BY created_at DESC"
    : "SELECT id, title, url, source_date FROM sources WHERE active = 1 AND status = 'approved' ORDER BY created_at DESC";

  const { results } = await env.DB.prepare(sql).all();
  return json({ sources: results || [], isAdmin: admin });
}