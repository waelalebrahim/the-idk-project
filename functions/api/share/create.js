import { json } from "../auth/_lib.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: "db_unavailable" }, 500);

  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  const question = String(body.question || "").trim().slice(0, 2000);
  const answer = String(body.answer || "").trim().slice(0, 20000);
  const confidence = ["high", "medium", "low"].includes(body.confidence) ? body.confidence : "low";
  let chips = [];
  if (Array.isArray(body.chips)) {
    chips = body.chips.slice(0, 20).map(c => ({
      title: String(c.title || "").slice(0, 300),
      url: String(c.url || "").slice(0, 1000),
      date: String(c.date || "").slice(0, 40),
    }));
  }
  if (!question || !answer) return json({ error: "missing_fields" }, 400);

  const id = crypto.randomUUID().slice(0, 8);
  const payload = JSON.stringify({ question, answer, confidence, chips });
  await env.DB.prepare(
    "INSERT INTO shared_answers (id, payload, created_at) VALUES (?, ?, ?)"
  ).bind(id, payload, Date.now()).run();

  return json({ ok: true, id });
}