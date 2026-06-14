import { json } from "../auth/_lib.js";
import { communityVisible, CATEGORIES, CATEGORY_IDS } from "./_flag.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: "db_unavailable" }, 500);
  const vis = await communityVisible(context);
  if (!vis.visible) return json({ error: "not_available" }, 404);

  const url = new URL(request.url);
  const cat = url.searchParams.get("category");
  let rows;
  if (cat && CATEGORY_IDS.includes(cat)) {
    rows = await env.DB.prepare(
      `SELECT p.id, p.title, p.category, p.votes, p.reply_count, p.views, p.last_activity_at,
              p.created_at, p.pinned, p.locked, u.username AS author
       FROM community_posts p LEFT JOIN users u ON u.id = p.user_id
       WHERE p.hidden = 0 AND p.category = ?
       ORDER BY p.pinned DESC, p.last_activity_at DESC LIMIT 100`
    ).bind(cat).all();
  } else {
    rows = await env.DB.prepare(
      `SELECT p.id, p.title, p.category, p.votes, p.reply_count, p.views, p.last_activity_at,
              p.created_at, p.pinned, p.locked, u.username AS author
       FROM community_posts p LEFT JOIN users u ON u.id = p.user_id
       WHERE p.hidden = 0
       ORDER BY p.pinned DESC, p.last_activity_at DESC LIMIT 100`
    ).all();
  }
  return json({ posts: rows.results || [], categories: CATEGORIES, isAdmin: vis.admin, live: (env.COMMUNITY_LIVE||"off")==="on" });
}