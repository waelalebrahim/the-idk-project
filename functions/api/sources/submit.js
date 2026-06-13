import { json } from "../auth/_lib.js";
import { getUser } from "./_admin.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: "db_unavailable" }, 500);

  const user = await getUser(context);
  if (!user) return json({ error: "login_required" }, 401);

  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  const title = (body.title || "").trim();
  const url = (body.url || "").trim();
  const source_date = (body.source_date || "").trim() || new Date().toISOString().slice(0, 10);

  if (!title || title.length > 300) return json({ error: "invalid_title" }, 400);
  let parsed;
  try { parsed = new URL(url); } catch { return json({ error: "invalid_url" }, 400); }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return json({ error: "invalid_url" }, 400);

  const dup = await env.DB.prepare("SELECT status FROM sources WHERE url = ?").bind(url).first();
  if (dup) {
    const msg = dup.status === "approved"
      ? "That source is already in the library."
      : dup.status === "pending"
        ? "That source has already been submitted and is awaiting review."
        : "That source was already reviewed previously.";
    return json({ error: "duplicate", message: msg }, 409);
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO sources (id, title, url, source_date, added_by, active, status, created_at) VALUES (?, ?, ?, ?, ?, 1, 'pending', ?)"
  ).bind(id, title, url, source_date, user.id, Date.now()).run();

  return json({ ok: true, message: "Thanks! Your source was submitted and is awaiting review." });
}