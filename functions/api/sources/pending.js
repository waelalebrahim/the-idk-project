import { json } from "../auth/_lib.js";
import { getUser, isAdmin } from "./_admin.js";

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) return json({ pending: [] });

  const user = await getUser(context);
  if (!isAdmin(user, env)) return json({ error: "forbidden" }, 403);

  const { results } = await env.DB.prepare(
    `SELECT s.id, s.title, s.url, s.source_date, s.created_at, u.username AS submitted_by
     FROM sources s LEFT JOIN users u ON u.id = s.added_by
     WHERE s.status = 'pending' ORDER BY s.created_at ASC`
  ).all();
  return json({ pending: results || [] });
}