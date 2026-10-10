// dibslyapp.com (Dibsly 1.1.2): the public site — support, privacy, terms and the split page — served from this
// repository as static files, plus short split links. /s/<code> asks Dibsly's server (service binding SYNC, the
// dibsly-sync Worker) for the bill kept under that code and puts it into split.html, naming the shop in the card
// messengers show; an expired or unknown code opens the page with its “expired” message. www goes to the bare domain.

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname.startsWith("www.")) {
      return Response.redirect(`https://${url.hostname.slice(4)}${url.pathname}${url.search}`, 301);
    }
    const short = /^\/s\/([A-Za-z0-9]{4,12})\/?$/.exec(url.pathname);
    if (short && request.method === "GET") return splitPage(short[1], request, env);
    return env.ASSETS.fetch(request);
  },
};
