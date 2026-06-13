# Taking The I Don't Know Project live

A plain-English recipe. You don't need to code — but a few steps need careful
following. Steps are marked 🟢 easy · 🟡 follow carefully · 🔴 done for you.

## What's in this folder
- `src/App.jsx` — the app + the honesty engine (all enforcement is here).
- `api/chat.js` — the "safe" that holds your AI key and talks to the model.
- `api/fetch.js` — fetches a link live and returns its text (5-min cache).
- `index.html` — the page, with your social/SEO meta tags built in.
- `package.json`, `vite.config.js` — setup files. 🔴 You don't touch these.

## Before you start
You need: a GitHub account (free), a Vercel account (free), an AI API key,
and your domain (theidkproject.ai).

## Steps

1. 🟢 **Get your AI key.** Sign up with your AI provider, create an API key,
   and set a spending limit on it. Keep it private — it is the one secret.

2. 🟡 **Put this folder on GitHub.** Create a new repository on github.com,
   then use the "Add file → Upload files" button to upload everything in this
   folder. (Do NOT upload a `.env` file with your real key.)

3. 🟢 **Connect Vercel.** On vercel.com, "Add New → Project", import your repo,
   and click Deploy. Vercel detects Vite automatically.

4. 🟡 **Add your secrets to Vercel.** In the project's
   Settings → Environment Variables, add:
   - `ANTHROPIC_API_KEY` = your key
   - `MODEL` = the model your key supports (e.g. claude-sonnet-4-6)
   - `SITE_ORIGIN` = https://theidkproject.ai  (add after step 6; blank for now)
   Then redeploy (Deployments → ⋯ → Redeploy) so the keys take effect.

5. 🟢 **Open the live link** Vercel gives you (a .vercel.app address) and test.

6. 🟡 **Point your domain.** In Vercel: Settings → Domains → add
   `theidkproject.ai`. Vercel shows two DNS records — paste them into your
   domain registrar. Live within a few hours. Then set SITE_ORIGIN (step 4).

7. 🟢 **Load your sources & test.** Open "Sources", add links you own or are
   allowed to use, then run the checks below.

## Test checklist (do this every time before sharing)
- Ask something covered by a source → answers WITH a citation chip.
- Ask something not covered → says "I don't know" (grey), no made-up answer.
- Paste a tricky/jailbreak prompt → declines, never goes off-topic.

## Honest to-dos before heavy public traffic
- **Rate limiting** on /api/chat and /api/fetch (a public endpoint can be
  abused to spend your key or fetch many pages). Add per-IP limits.
- **SSRF**: /api/fetch already blocks private addresses; keep it tightened.
- **Community persistence**: the Gap Board is per-session in this build.
  To make it shared + permanent, add a small storage endpoint and point the
  four board helpers in App.jsx at it.
- **Source rights**: only load links you own, are openly licensed, or are
  permitted to use. This is the project's whole reputation.
