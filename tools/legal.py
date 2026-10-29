"""Builds dibslyapp.com's privacy policy and terms (privacy.html, privacy-uk.html, terms.html, terms-uk.html) from the
app's own texts in sources/app-1.0.2 (PRIVACY.md, PRIVACY.uk.md, TERMS.md, TERMS.uk.md), word for word, on the shared
style (v3/pages.css). Run: python3 tools/legal.py .   — edit the .md in the app's repository, copy it here, rebuild."""
import html, os, re, sys

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pages import CSS, JS, footer, nav, newtab  # the header and the footer, one copy for every page (tools/pages.py)

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
SRC = f"{ROOT}/sources/app-1.0.2"
TOC = {"uk": "Розділи", "en": "Sections"}
PAGES = [
    ("privacy.html", "privacy-uk.html", "en", "PRIVACY.md", "Privacy", "How Dibsly handles your data: what stays on your iPhone, what an account, sync, the AI and backups send, and your choices."),
    ("privacy-uk.html", "privacy.html", "uk", "PRIVACY.uk.md", "Конфіденційність", "Як Dibsly поводиться з твоїми даними: що лишається на iPhone, що надсилають акаунт, синхронізація, ШІ й копії, і твій вибір."),
    ("terms.html", "terms-uk.html", "en", "TERMS.md", "Terms", "The terms of using Dibsly: what it is and isn't, the AI, Premium, your data and contact."),
    ("terms-uk.html", "terms.html", "uk", "TERMS.uk.md", "Умови", "Умови використання Dibsly: що це й чим він не є, ШІ, Premium, твої дані й контакти."),
]


def slug(text):
    # As the pages' anchors have always been: lower case, letters and digits kept, the rest a single hyphen.
    # (the old pages dropped a typed apostrophe ' but turned the typographic ’ into a hyphen; kept so old links work)
    text = text.lower().replace("'", "")
    return re.sub(r"[^\w]+", "-", text, flags=re.UNICODE).strip("-").replace("_", "-")


def inline(text):
    out = html.escape(text, quote=False)
    out = re.sub(r"`([^`]+)`", r"<code>\1</code>", out)
    out = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", out)
    out = re.sub(r"\[([^\]]+)\]\((https?://[^)\s]+)\)", r'<a href="\2">\1</a>', out)
    out = re.sub(r'(?<![">])(https?://[^\s<)]+?)([.,;:]?)(?=\s|$|<)', r'<a href="\1">\1</a>\2', out)
    out = re.sub(r"(?<![\w.:/\">])([\w.+-]+@[\w-]+\.[\w.]+[A-Za-z])", r'<a href="mailto:\1">\1</a>', out)
    return out


def read(md, lang):
    lines = open(f"{SRC}/{md}").read().strip().split("\n")
    title = lines[0].lstrip("# ").strip()
    blocks, para = [], []
    for line in lines[1:] + [""]:
        if not line.strip():
            if para:
                blocks.append(("p", " ".join(para)))
                para = []
        elif line.startswith("## "):
            blocks.append(("h2", line[3:].strip()))
        else:
            para.append(line.strip())
    updated = blocks.pop(0)[1] if blocks and re.match(r"(Last updated|Оновлено):", blocks[0][1]) else ""
    if md == "TERMS.md":
        # The English terms open with a note for the app's developers («This file is the English source; keep both in
        # step and raise `TermsOfUse.version` with every change»): the site keeps the sentence for people only.
        blocks = [(k, v.split(" This file is the English source;")[0]) if k == "p" else (k, v) for k, v in blocks]
    return title, updated, blocks


def page(name, other, lang, md, kicker, desc):
    title, updated, blocks = read(md, lang)
    uk, en = (name, other) if lang == "uk" else (other, name)
    sections = [(slug(v), v) for k, v in blocks if k == "h2"]
    body = []
    for k, v in blocks:
        if k == "h2":
            body.append(f'                    <h2 id="{slug(v)}">{html.escape(v, quote=False)}</h2>')
        else:
            body.append(f"                    <p>{inline(v)}</p>")
    toc = "\n".join(f'                <a href="#{i}">{html.escape(x, quote=False)}</a>' for i, x in sections)
    out = f'''<!doctype html>
<html lang="{lang}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <title>{html.escape(title)}</title>
    <meta name="description" content="{html.escape(desc)}">
    <meta name="theme-color" content="#0E0C0B">
    <link rel="canonical" href="https://dibslyapp.com/{name}">
    <link rel="alternate" hreflang="uk" href="https://dibslyapp.com/{uk}">
    <link rel="alternate" hreflang="en" href="https://dibslyapp.com/{en}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Dibsly">
    <meta property="og:title" content="{html.escape(title)}">
    <meta property="og:description" content="{html.escape(desc)}">
    <meta property="og:url" content="https://dibslyapp.com/{name}">
    <link rel="icon" type="image/png" href="img/favicon.png">
    <link rel="apple-touch-icon" href="img/apple-touch-icon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Geologica:wght@500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="v3/pages.css">
    {CSS}
</head>
<body>
{nav(lang, name)}

    <main>
        <section class="page-hero">
            <div class="wrap">
                <p class="kicker"><span class="dot"></span>{kicker}</p>
                <h1>{html.escape(title, quote=False)}</h1>
                <p class="updated">{html.escape(updated, quote=False)}</p>
            </div>
        </section>
        <div class="wrap with-toc">
            <nav class="toc" aria-label="{TOC[lang]}">
{toc}
            </nav>
            <article class="prose">
{chr(10).join(body)}
            </article>
        </div>
    </main>

{footer(lang, name)}
    <script src="v3/pages.js" defer></script>
    {JS}
</body>
</html>
'''
    out = newtab(out)
    open(f"{ROOT}/{name}", "w").write(out)
    print(name, len(out), len(sections), "sections")


for args in PAGES:
    page(*args)
