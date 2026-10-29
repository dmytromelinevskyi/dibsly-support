"""dibslyapp.com's header and footer, one copy for every page. The header (2026-10-29, task 15): the logo, «Можливості ▾»
(how it works, all features, the website and AI), «Допомога ▾» (guides, support, privacy, terms), «Ціна», «Питання», the
UK / EN switch, «Увійти» and «Завантажити»; under 900 px a burger and the same menu as a sheet (styles v3/nav.css, the
behaviour v3/nav.js). The footer: the pages' links. Run: python3 tools/pages.py .   — puts them into the hand-written
pages (support*, help*), the landing (index.html, en.html: header and footer) and split.html (the header in both
languages, the page picks its own); tools/features.py and tools/legal.py take them from here when they build their
pages, so after a change here run those two as well."""
import re, sys

APP = "https://apps.apple.com/app/id6765870838"
CSS = '<link rel="stylesheet" href="v3/nav.css">'
JS = '<script src="v3/nav.js" defer></script>'
TEXT = {
    "uk": dict(home="./", main="Головне меню", signin="Увійти", get="Завантажити", other_label="EN", other_lang="en", other_name="English",
               features="Можливості", how="Як це працює", all="Усі можливості", everywhere="Портал і ШІ",
               help="Допомога", guide="Інструкції", support="Підтримка", privacy="Конфіденційність", terms="Умови", price="Ціна", faq="Питання",
               menu="Меню", open="Відкрити меню", close="Закрити меню",
               pages=dict(all="features-uk.html", guide="help-uk.html", support="support-uk.html", privacy="privacy-uk.html", terms="terms-uk.html"),
               foot=[("features-uk.html", "Можливості"), ("help-uk.html", "Інструкції"), ("support-uk.html", "Підтримка"),
                     ("privacy-uk.html", "Конфіденційність"), ("terms-uk.html", "Умови")]),
    "en": dict(home="en.html", main="Main menu", signin="Sign in", get="Download", other_label="УКР", other_lang="uk", other_name="Українська",
               features="Features", how="How it works", all="All features", everywhere="Website & AI",
               help="Help", guide="Guide", support="Support", privacy="Privacy", terms="Terms", price="Pricing", faq="FAQ",
               menu="Menu", open="Open menu", close="Close menu",
               pages=dict(all="features.html", guide="help.html", support="support.html", privacy="privacy.html", terms="terms.html"),
               foot=[("features.html", "Features"), ("help.html", "Guides"), ("support.html", "Support"), ("privacy.html", "Privacy"), ("terms.html", "Terms")]),
}
# Each page and its other language (the switch's link); split.html has one page for both and no switch.
PAIR = {"support-uk.html": "support.html", "help-uk.html": "help.html", "features-uk.html": "features.html",
        "privacy-uk.html": "privacy.html", "terms-uk.html": "terms.html"}
PAIR.update({other: page for page, other in PAIR.items()})
PAIR.update({"index.html": "en.html", "en.html": "./"})
LANDING = {"index.html": "uk", "en.html": "en"}
HAND = {"support-uk.html": "uk", "support.html": "en", "help-uk.html": "uk", "help.html": "en"}
CHEVRON = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
BURGER = '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5.5h14M2 12.5h14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
CROSS = '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M4 4l10 10M14 4 4 14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'


def newtab(text):
    # The App Store and the website open in a new tab (owner, task 16): every link to them, the header's and the
    # sheet's included, gets target="_blank" rel="noopener" (once).
    def fix(m):
        tag = m.group(0)
        return tag if "target=" in tag else tag[:-1] + ' target="_blank" rel="noopener">'
    return re.sub(r'<a [^>]*href="https://(?:apps\.apple\.com|my\.dibslyapp\.com)[^"]*"[^>]*>', fix, text)


def remember(lang):
    return f"try {{ localStorage.setItem('dibsly.site.lang', '{TEXT[lang]['other_lang']}'); }} catch (error) {{}}"


def menu(lang, page):
    # The menu's groups and links: (label, [(key, href, text)]) or (None, [(key, href, text)]) for the plain links.
    t = TEXT[lang]
    landing = "#" if page in LANDING else t["home"] + "#"  # the landing's blocks: on itself, or ./#… and en.html#…
    p = t["pages"]
    return [
        ("features", t["features"], [("how", landing + "auto", t["how"]), ("all", p["all"], t["all"]), ("everywhere", landing + "everywhere", t["everywhere"])]),
        ("help", t["help"], [("guide", p["guide"], t["guide"]), ("support", p["support"], t["support"]),
                             ("privacy", p["privacy"], t["privacy"]), ("terms", p["terms"], t["terms"])]),
        ("more", None, [("price", landing + "price", t["price"]), ("faq", landing + "faq", t["faq"])]),
    ]


def current(href, page):
    return ' aria-current="page"' if href == page else ""


def nav(lang, page):
    """The header pill and, after it, its sheet (outside the pill: the landing slides the pill away on scroll)."""
    t, other = TEXT[lang], PAIR.get(page)
    ids = f"-{lang}"
    tops = []
    for key, label, links in menu(lang, page):
        if label:
            here = any(href == page for _, href, _ in links)
            cards = "".join(f'\n                        <a href="{href}"{current(href, page)}>{text}</a>' for _, href, text in links)
            tops.append(f'''                <li class="nav-group">
                    <button class="nav-top{" current" if here else ""}" type="button" aria-expanded="false" aria-controls="nav-{key}{ids}"><span>{label}</span>{CHEVRON}</button>
                    <div class="nav-drop" id="nav-{key}{ids}">{cards}
                    </div>
                </li>''')
        else:
            tops += [f'                <li><a class="nav-top" href="{href}">{text}</a></li>' for _, href, text in links]
    switch = (f'\n                <a class="lang" href="{other}" hreflang="{t["other_lang"]}" lang="{t["other_lang"]}" aria-label="{t["other_name"]}" onclick="{remember(lang)}">{t["other_label"]}</a>'
              if other else "")
    brand = "#top" if page in LANDING else t["home"]
    groups = []
    for key, label, links in menu(lang, page):
        rows = "".join(f'\n                <a href="{href}"{current(href, page)}>{text}</a>' for _, href, text in links)
        title = f'\n                <p>{label}</p>' if label else ""
        groups.append(f'            <div class="nav-sheet-group">{title}{rows}\n            </div>')
    sheet_switch = (f'\n            <a class="lang" href="{other}" hreflang="{t["other_lang"]}" lang="{t["other_lang"]}" onclick="{remember(lang)}">{t["other_name"]}</a>'
                    if other else "")
    return f'''    <header class="nav">
        <nav class="nav-pill" aria-label="{t["main"]}">
            <a class="brand" href="{brand}"><img src="img/apple-touch-icon.png" alt="" width="28" height="28">Dibsly</a>
            <ul class="nav-menu">
{chr(10).join(tops)}
            </ul>
            <div class="nav-actions">{switch}
                <a class="pill ghost" href="https://my.dibslyapp.com">{t["signin"]}</a>
                <a class="pill hot" href="{APP}">{t["get"]}</a>
                <button class="nav-burger" type="button" aria-expanded="false" aria-controls="nav-sheet{ids}" aria-label="{t["open"]}">{BURGER}</button>
            </div>
        </nav>
    </header>
    <div class="nav-sheet" id="nav-sheet{ids}" role="dialog" aria-modal="true" aria-label="{t["menu"]}" data-lenis-prevent hidden>
        <div class="nav-sheet-top">
            <a class="brand" href="{brand}"><img src="img/apple-touch-icon.png" alt="" width="28" height="28">Dibsly</a>
            <button class="nav-close" type="button" aria-label="{t["close"]}">{CROSS}</button>
        </div>
        <nav class="nav-sheet-body" aria-label="{t["main"]}">
{chr(10).join(groups)}
        </nav>
        <div class="nav-sheet-foot">{sheet_switch}
            <a class="pill ghost" href="https://my.dibslyapp.com">{t["signin"]}</a>
            <a class="pill hot" href="{APP}">{t["get"]}</a>
        </div>
    </div>'''


def footer(lang, page):
    t, other = TEXT[lang], PAIR[page]
    links = "\n".join(f'            <a href="{h}">{x}</a>' for h, x in t["foot"])
    return f'''    <footer>
        <div class="wrap foot-row">
            <b>Dibsly</b>
{links}
            <a href="https://my.dibslyapp.com">my.dibslyapp.com</a>
            <a href="{other}" hreflang="{t["other_lang"]}" lang="{t["other_lang"]}" onclick="{remember(lang)}">{t["other_name"]}</a>
            <span class="copy-r">© 2026 Dibsly</span>
        </div>
    </footer>'''


def split_nav():
    # split.html is one page for every language (its script sets <html lang>): both headers, the page shows its own.
    return "\n".join(f'    <div class="nav-lang" data-nav-lang="{lang}">\n{nav(lang, "split.html")}\n    </div>' for lang in ("uk", "en"))


def put(text, tag, block):
    # The page's one header (between <!-- nav --> and <!-- /nav -->, or the old <header …>…</header> the first time) or
    # its one <footer>…</footer>, with its indentation, becomes the block.
    if tag == "header":
        found = re.findall(r"^ *<!-- nav -->\n.*?<!-- /nav -->", text, flags=re.S | re.M) or \
            re.findall(r'^ *<header class="(?:nav|top)">.*?</header>', text, flags=re.S | re.M)
        block = f"    <!-- nav -->\n{block}\n    <!-- /nav -->"
    else:
        found = re.findall(r"^ *<footer>.*?</footer>", text, flags=re.S | re.M)
    assert len(found) == 1, (tag, len(found))
    return text.replace(found[0], block)


def assets(text):
    # The header's stylesheet after the page's last one, its script last before </body>.
    if CSS not in text:
        last = list(re.finditer(r'^( *)<link rel="stylesheet"[^\n]*\n', text, flags=re.M))
        if last:
            m = last[-1]
            text = text[:m.end()] + f"{m.group(1)}{CSS}\n" + text[m.end():]
        else:
            text = text.replace("</head>", f"    {CSS}\n</head>", 1)
    if JS not in text:
        text = text.replace("</body>", f"    {JS}\n</body>", 1)
    return text


if __name__ == "__main__":
    ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
    jobs = [(name, lang) for name, lang in list(HAND.items()) + list(LANDING.items())] + [("split.html", None)]
    for name, lang in jobs:
        path = f"{ROOT}/{name}"
        text = open(path).read()
        if lang:
            new = put(put(text, "footer", footer(lang, name)), "header", nav(lang, name))
        else:
            new = put(text, "header", split_nav())
        new = newtab(assets(new))
        if new != text:
            open(path, "w").write(new)
        print(name, "changed" if new != text else "as it was")
