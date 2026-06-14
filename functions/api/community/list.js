import { json } from "../auth/_lib.js";

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) return json({ board: [] });
  const { results } = await env.DB.prepare(
    "SELECT id, type, text, answer, votes, created_at FROM gap_board WHERE hidden = 0 ORDER BY created_at DESC LIMIT 500"
  ).all();
  const board = (results || []).map(r => ({
    id: r.id, type: r.type, text: r.text, answer: r.answer || "",
    votes: r.votes, createdAt: r.created_at,
  }));
  return json({ board });
}