// Cloudflare Pages Function — live link fetcher. Fetches a URL server-side,
// returns readable text. Basic SSRF guard + 5-minute edge cache.
// Route: POST /api/fetch

function json(obj, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", ...extraHeaders },
  });
}

function isPrivateHost(host) {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".local") || h === "0.0.0.0") return true;
  if (/^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h)) return true;
  if (h === "::1" || h.startsWith("fc") || h.startsWith("fd")) return true;
  return false;
}

function validateUrl(raw) {
  try {
    const u = new URL(String(raw));
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (isPrivateHost(u.hostname)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function extractText(html) {
  let title = "";
  const tm = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (tm) title = tm[1].replace(/\s+/g, " ").trim();

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();

  return { title, text };
}

export async function onRequestPost(context) {
  const { request } = context;
  try {
    const body = await request.json();
    const safe = validateUrl(body && body.url);
    if (!safe) return json({ error: "invalid_or_blocked_url" }, 400);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    let r;
    try {
      r = await fetch(safe, {
        headers: { "user-agent": "IDKProjectBot/1.0 (+https://theidkproject.ai)" },
        redirect: "follow",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!r.ok) return json({ error: "fetch_failed", status: r.status }, 502);

    const html = await r.text();
    const { title, text } = extractText(html);

    return json(
      { title, text: text.slice(0, 12000), fetchedDate: new Date().toISOString().slice(0, 10) },
      200,
      { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" }
    );
  } catch (e) {
    return json({ error: "fetch_error" }, 502);
  }
}
