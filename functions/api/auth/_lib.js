// Shared auth helpers for Cloudflare Pages Functions.
// Uses the Web Crypto API (built into the Workers runtime) — no dependencies.
// Passwords are hashed with PBKDF2-SHA256 + per-user random salt.
// Sessions are HMAC-signed tokens stored in an httpOnly cookie.

const PBKDF2_ITERATIONS = 100000;

function toHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function fromHex(hex) {
  const a = new Uint8Array(hex.length / 2);
  for (let i = 0; i < a.length; i++) a[i] = parseInt(hex.substr(i * 2, 2), 16);
  return a;
}

// ---- Password hashing -------------------------------------------------------
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial, 256
  );
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt)}$${toHex(bits)}`;
}

export async function verifyPassword(password, stored) {
  try {
    const [scheme, iterStr, saltHex, hashHex] = String(stored).split("$");
    if (scheme !== "pbkdf2") return false;
    const iterations = parseInt(iterStr, 10);
    const salt = fromHex(saltHex);
    const keyMaterial = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      keyMaterial, 256
    );
    const a = toHex(bits);
    if (a.length !== hashHex.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ hashHex.charCodeAt(i);
    return diff === 0;
  } catch {
    return false;
  }
}

// ---- Session tokens (HMAC-signed) ------------------------------------------
async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" },
    false, ["sign", "verify"]
  );
}
function b64urlEncode(str) {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(str)));
}

export async function createSession(secret, userId, days = 30) {
  const payload = JSON.stringify({ uid: userId, exp: Date.now() + days * 86400000 });
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${b64urlEncode(payload)}.${toHex(sig)}`;
}

export async function readSession(secret, token) {
  try {
    if (!token) return null;
    const [p, sigHex] = token.split(".");
    const payload = b64urlDecode(p);
    const key = await hmacKey(secret);
    const ok = await crypto.subtle.verify(
      "HMAC", key, fromHex(sigHex), new TextEncoder().encode(payload)
    );
    if (!ok) return null;
    const data = JSON.parse(payload);
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

// ---- Cookie helpers ---------------------------------------------------------
export function sessionCookie(token, days = 30) {
  const maxAge = days * 86400;
  return `idk_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}
export function clearCookie() {
  return `idk_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
export function getCookie(request, name) {
  const header = request.headers.get("cookie") || "";
  const m = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? m[1] : null;
}

// ---- JSON response helper ---------------------------------------------------
export function json(obj, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", ...extraHeaders },
  });
}

// ---- Validation -------------------------------------------------------------
export function validUsername(u) {
  return typeof u === "string" && /^[a-zA-Z0-9_]{3,30}$/.test(u);
}
export function validPassword(p) {
  return typeof p === "string" && p.length >= 8 && p.length <= 200;
}
export function validEmail(e) {
  if (e === undefined || e === null || e === "") return true;
  return typeof e === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) && e.length <= 200;
}