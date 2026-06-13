// Public changelog — pulls commit history from the project's public GitHub repo,
// caches it server-side (so we don't hit GitHub's rate limit), and returns a
// clean list. No API key needed for a public repo.

const REPO = "waelalebrahim/the-idk-project";
const CACHE_SECONDS = 600; // 10 minutes

export async function onRequestGet(context) {
  const { env } = context;
  const url = `https://api.github.com/repos/${REPO}/commits?per_page=100`;

  try {
    const res = await fetch(url, {
      headers: {
        "Accept": "application/vnd.github+json",
        "User-Agent": "the-idk-project-changelog",
      },
      cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ entries: [], error: "github_unavailable" }), {
        status: 200, headers: { "content-type": "application/json" },
      });
    }

    const commits = await res.json();
    const entries = (Array.isArray(commits) ? commits : []).map(c => {
      const msg = (c.commit && c.commit.message) || "";
      const firstLine = msg.split("\n")[0];
      const body = msg.split("\n").slice(1).join("\n").trim();
      return {
        title: firstLine,
        body,
        date: c.commit && c.commit.author ? c.commit.author.date : null,
        author: c.commit && c.commit.author ? c.commit.author.name : "",
        sha: (c.sha || "").slice(0, 7),
      };
    });

    return new Response(JSON.stringify({ entries }), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": `public, max-age=${CACHE_SECONDS}`,
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ entries: [], error: "fetch_failed" }), {
      status: 200, headers: { "content-type": "application/json" },
    });
  }
}