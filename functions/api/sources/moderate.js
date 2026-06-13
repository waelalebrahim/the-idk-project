import { json } from "../auth/_lib.js";
import { getUser, isAdmin } from "./_admin.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: "db_unavailable" }, 500);

  const user = await getUser(context);
  if (!isAdmin(user, env)) return json({ error: "forbidden" }, 403);

  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  const id = (body.id || "").trim();
  const action = (body.action || "").trim();
  if (!id) return json({ error: "missing_id" }, 400);
  if (action !== "approve" && action !== "reject") return json({ error: "invalid_action" }, 400);

  const newStatus = action === "approve" ? "approved" : "rejected";
  await env.DB.prepare("UPDATE sources SET status = ? WHERE id = ?").bind(newStatus, id).run();

  return json({ ok: true, status: newStatus });
}