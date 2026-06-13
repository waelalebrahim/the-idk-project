// Cloudflare Pages Function — model proxy. Holds the API key, forwards to the
// model, performs NO honesty logic (all enforcement stays client-side).
// Route: POST /api/chat

function json(obj, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", ...extraHeaders },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Optional origin allowlist — blocks other sites from spending your key.
  const allow = env.SITE_ORIGIN;
  const origin = request.headers.get("origin") || "";
  if (allow && origin && origin !== allow) {
    return json({ error: "forbidden_origin" }, 403);
  }

  const key = env.ANTHROPIC_API_KEY;
  if (!key) return json({ error: "missing_api_key" }, 500);

  try {
    const body = await request.json();
    const { system, messages, max_tokens } = body || {};

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: env.MODEL || "claude-sonnet-4-6",
        max_tokens: max_tokens || 1000,
        system,
        messages,
      }),
    });

    const data = await r.json();
    return json(data, r.status);
  } catch (e) {
    return json({ error: "upstream_error" }, 502);
  }
}
