<div align="center">

# The I Don't Know Project

### An open-source AI that only answers from sources you trust — cites every claim, and says *"I don't know"* instead of making things up.

[**Live demo →**](https://i-dont-know-project.pages.dev) · [Report an issue](https://github.com/waelalebrahim/the-idk-project/issues) · [MIT Licensed](#license)

</div>

---

## Why this exists

Most AI tools will confidently invent an answer when they don't actually know one. A made-up citation, a plausible-sounding statistic, a function that doesn't exist — delivered with the same confidence as the truth. For anything that matters, that confidence is the problem.

**The I Don't Know Project takes the opposite stance.** It answers *only* from a specific library of sources you give it. Every answer shows the exact source behind it. And when the answer isn't in those sources, it plainly says **"I don't know"** rather than guessing.

It's not trying to know everything. It's trying to be *trustworthy about what it knows* — and honest about what it doesn't.

## What it actually does

- **Answers only from loaded sources.** No open web, no training-data guesswork. If it's not in the library, it isn't in the answer.
- **Shows its receipts.** Every answer is tied to the source it came from, so you can verify it yourself in one click.
- **Says "I don't know."** When the sources don't cover your question, it says so — and lets you flag the gap so the library can grow where people actually need it.
- **Grades its own confidence.** Answers are marked high / medium / low confidence based on how well the sources support them, so a thin answer never masquerades as a sure one.
- **Resolves conflicts.** When sources disagree, it follows a defined rule rather than picking at random.
- **Built-in honesty guardrails.** The engine is designed to resist prompt-injection and to fail *closed* — when in doubt, it abstains.

It ships with a small demo library so you can see it work immediately. **Point it at your own sources** — documentation, policies, guidelines, a body of texts, anything — and it becomes a trustworthy answer engine for *that* domain.

## Use it for whatever you want

This is open source under the MIT license. Deploy it, fork it, rebrand it, build on it — for your own documentation, your own knowledge base, your own community. That's the point. The honesty engine is the gift; what you point it at is up to you.

## Tech stack

A deliberately simple, modern, low-cost stack — easy to read, fork, and self-host.

- **Frontend:** React + Vite (single-page app)
- **Backend:** Cloudflare Pages Functions (serverless)
- **Database:** Cloudflare D1 (SQLite at the edge)
- **AI:** Anthropic Claude (model is configurable)
- **Hosting:** Cloudflare Pages — runs comfortably on free tiers

## Features built in

Beyond the core honesty engine, the project includes a full, working product around it:

| Area | What's there |
|------|-------------|
| **Answers** | Source-grounded answers, inline citations, confidence grading, conflict resolution |
| **Sources** | Curated source library, public source submissions, admin moderation queue |
| **Accounts** | Secure sign-up / login, saved conversation history per user |
| **Community** | A public "gap board" where people request sources and flag answers, votes included |
| **Sharing** | Share the project or share a single answer as its own public, cited page |
| **Transparency** | A live public changelog driven straight from the project's commit history |

## Running it yourself

> A full setup guide is on the way. In short: it's a standard Cloudflare Pages + D1 project.

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build
```

Deployment uses Cloudflare Pages with a D1 database binding and an `ANTHROPIC_API_KEY`. Detailed steps, schema, and environment variables will be documented in the wiki.

## Roadmap

The project is built and live. Ongoing work is focused on:

- A guided, one-command setup so anyone can deploy their own instance
- A richer community layer (discussion, contributor recognition)
- Optional retrieval scaling for very large source libraries
- Streaming responses, without ever weakening the honesty checks

Contributions are welcome — see an opportunity, open an issue or a pull request.

## License

Released under the **MIT License** — free to use, modify, and distribute, including commercially. The one requirement: keep the original copyright and license notice. See [LICENSE](LICENSE).

**Copyright © 2026 Wael Alebrahim.**

---

<div align="center">

**Created by Wael Alebrahim**

[GitHub](https://github.com/waelalebrahim) · [X](https://x.com/walebrahim_X) · [LinkedIn](https://www.linkedin.com/in/waelalebrahim/)

*An AI you can trust — because it never bluffs, and always shows its sources.*

</div>
