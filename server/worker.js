// dibslyapp.com (Dibsly 1.1.2): the public site — support, privacy, terms and the split page — served from this
// repository as static files, plus short split links and «Що далі»'s votes and form (/api/…, below). /s/<code> asks
// Dibsly's server (service binding SYNC, the dibsly-sync Worker) for the bill kept under that code and puts it into
// split.html, naming the shop in the card messengers show; an expired or unknown code opens the page with its “expired” message. www goes to the bare domain.

const escape = (text) => text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

async function splitPage(code, request, env) {
  const page = await (await env.ASSETS.fetch(new URL("/split", request.url))).text();
  let script = "window.DIBSLY_SPLIT_EXPIRED=true;";
  let title = null;
  const answer = await env.SYNC.fetch(`https://dibsly-sync/v1/splits/${code}`);
  if (answer.ok) {
    const split = await answer.json();
    script = `window.DIBSLY_SPLIT=${JSON.stringify(split.payload)};window.DIBSLY_SPLIT_CODE=${JSON.stringify(code)};`;
    if (split.merchant) title = `Рахунок із ${split.merchant} · Dibsly`;
  }
  let html = page.replace("<head>", `<head>\n    <base href="/">\n    <script>${script}</script>`);
  if (title) {
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`)
      .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escape(title)}$2`);
  }
  return new Response(html, { status: answer.ok ? 200 : 404, headers: {
    "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex",
    "Referrer-Policy": "no-referrer", "X-Frame-Options": "DENY" } });
}

// «Що далі» (2026-10-21): «Хочу це» and «Чого тобі не вистачає?» go to Dibsly's server; the visitor's address goes
// along for its per-hour limit. Only these three paths, only these methods.
const SITE_API = { "GET /api/roadmap": "/v1/site/roadmap", "POST /api/roadmap/vote": "/v1/site/roadmap/vote",
  "POST /api/feedback": "/v1/site/feedback" };

async function siteAPI(path, request, env) {
  const address = request.headers.get("CF-Connecting-IP") ?? "";
  const headers = { "Content-Type": "application/json", "CF-Connecting-IP": address, "X-Dibsly-Visitor": address };
  const body = request.method === "POST" ? await request.text() : undefined;
  if (body && body.length > 8000) return new Response('{"error":{"code":"bad_request"}}', { status: 400 });
  const answer = await env.SYNC.fetch(`https://dibsly-sync${path}`, { method: request.method, headers, body });
  return new Response(answer.body, { status: answer.status, headers: {
    "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}

// The statement videos (1.0.3): iOS's player asks for byte ranges and will not play an mp4 answered in full, and the
// static files answer only in full — so a video is sliced here (each is under 1 MB).
async function video(request, env) {
  const asset = await env.ASSETS.fetch(new URL(new URL(request.url).pathname, request.url));
  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("Range") ?? "");
  const headers = new Headers(asset.headers);
  headers.set("Accept-Ranges", "bytes");
  if (!asset.ok || !range || (range[1] === "" && range[2] === "")) {
    return new Response(asset.body, { status: asset.status, headers });
  }
  const bytes = new Uint8Array(await asset.arrayBuffer());
  const size = bytes.length;
  let start = range[1] === "" ? Math.max(0, size - Number(range[2])) : Number(range[1]);
  let end = range[1] === "" || range[2] === "" ? size - 1 : Math.min(Number(range[2]), size - 1);
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}`, "Accept-Ranges": "bytes" } });
  }
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(end - start + 1));
  return new Response(bytes.slice(start, end + 1), { status: 206, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname.startsWith("www.")) {
      return Response.redirect(`https://${url.hostname.slice(4)}${url.pathname}${url.search}`, 301);
    }
    const short = /^\/s\/([A-Za-z0-9]{4,12})\/?$/.exec(url.pathname);
    if (short && request.method === "GET") return splitPage(short[1], request, env);
    const api = SITE_API[`${request.method} ${url.pathname}`];
    if (api) return siteAPI(api, request, env);
    if (request.method === "GET" && url.pathname.endsWith(".mp4")) return video(request, env);
    return env.ASSETS.fetch(request);
  },
};
