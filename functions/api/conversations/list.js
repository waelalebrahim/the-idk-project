import { json } from "../auth/_lib.js";
import { getUser } from "../sources/_admin.js";

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) return json({ conversations: [] });
  const user = await getUser(context);
  if (!user) return json({ conversations: [] });

  const { results } = await env.DB.prepare(
    "SELECT id, title, updated_at FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100"
  ).bind(user.id).all();
  return json({ conversations: results || [] });
}