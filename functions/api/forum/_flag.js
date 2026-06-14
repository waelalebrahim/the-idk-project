// Community feature flag. Hidden from the public until COMMUNITY_LIVE === "on".
// Admin can always access (to build/test) even while it's off.
import { readSession, getCookie } from "../auth/_lib.js";

export const CATEGORIES = [
  { id: "help",         name: "Help & Questions" },
  { id: "requests",     name: "Source Requests" },
  { id: "ideas",        name: "Ideas & Feedback" },
  { id: "showcase",     name: "Show & Tell" },
  { id: "announce",     name: "Announcements" },
];
export const CATEGORY_IDS = CATEGORIES.map(c => c.id);

export async function getForumUser(context) {
  const { request, env } = context;
  if (!env.SESSION_SECRET || !env.DB) return null;
  try {
    const token = getCookie(request, "idk_session");
    const sess = token ? await readSession(env.SESSION_SECRET, token) : null;
    if (!sess) return null;
    const u = await env.DB.prepare("SELECT id, username FROM users WHERE id = ?").bind(sess.uid).first();
    return u || null;
  } catch { return null; }
}
export function isForumAdmin(user, env) {
  return !!(user && env.ADMIN_USERNAME && user.username === env.ADMIN_USERNAME);
}
export async function communityVisible(context) {
  const { env } = context;
  const live = (env.COMMUNITY_LIVE || "off") === "on";
  if (live) return { visible: true, admin: false, user: await getForumUser(context) };
  const user = await getForumUser(context);
  const admin = isForumAdmin(user, env);
  return { visible: admin, admin, user };
}