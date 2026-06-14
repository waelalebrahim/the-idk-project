import { json } from "../auth/_lib.js";
import { communityVisible } from "./_flag.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: "db_unavailable" }, 500);
  const vis = await communityVisible(context);
  if (!vis.visible) return json({ error: "not_available" }, 404);

  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  const id = (body.id || "").trim();
  if (!id) return json({ error: "missing_id" }, 400);

  const post = await env.DB.prepare(
    `SELECT p.id, p.title, p.body, p.category, p.votes, p.reply_count, p.views, p.created_at,
            p.pinned, p.locked, u.username AS author
     FROM community_posts p LEFT JOIN users u ON u.id = p.user_id
     WHERE p.id = ? AND p.hidden = 0`
  ).bind(id).first();
  if (!post) return json({ error: "not_found" }, 404);

  const replies = await env.DB.prepare(
    `SELECT r.id, r.body, r.created_at, u.username AS author
     FROM community_replies r LEFT JOIN users u ON u.id = r.user_id
     WHERE r.post_id = ? AND r.hidden = 0
     ORDER BY r.created_at ASC LIMIT 500`
  ).bind(id).all();

  return json({ post, replies: replies.results || [], isAdmin: vis.admin });
}