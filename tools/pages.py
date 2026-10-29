"""dibslyapp.com's header and footer, one copy for every page: the menu (features, guides, support, price), the
UK / EN switch, «Sign in» and «Download», and the footer's links. Run: python3 tools/pages.py .   — puts them into the
hand-written pages (support*, help*) and the landing's footer (the landing's own menu leads to its sections and stays
in index.html / en.html); tools/features.py and tools/legal.py take them from here when they build their pages, so
after a change here run those two as well."""
import re, sys

APP = "https://apps.apple.com/app/id6765870838"
TEXT = {
    "uk": dict(home="./", main="Головне меню", signin="Увійти", get="Завантажити", other_label="EN", other_lang="en", other_name="English",
               nav=[("features-uk.html", "Можливості"), ("help-uk.html", "Інструкції"), ("support-uk.html", "Підтримка"), ("./#price", "Ціна")],
               foot=[("features-uk.html", "Можливості"), ("help-uk.html", "Інструкції"), ("support-uk.html", "Підтримка"),
                     ("privacy-uk.html", "Конфіденційність"), ("terms-uk.html", "Умови")]),
    "en": dict(home="en.html", main="Main menu", signin="Sign in", get="Download", other_label="UK", other_lang="uk", other_name="Українська",
               nav=[("features.html", "Features"), ("help.html", "Guides"), ("support.html", "Support"), ("en.html#price", "Price")],
               foot=[("features.html", "Features"), ("help.html", "Guides"), ("support.html", "Support"), ("privacy.html", "Privacy"), ("terms.html", "Terms")]),
}
# Each page and its other language (the switch's link).
PAIR = {"support-uk.html": "support.html", "help-uk.html": "help.html", "features-uk.html": "features.html",
        "privacy-uk.html": "privacy.html", "terms-uk.html": "terms.html"}
PAIR.update({other: page for page, other in PAIR.items()})
PAIR.update({"index.html": "en.html", "en.html": "./"})
LANDING = {"index.html": "uk", "en.html": "en"}
HAND = {"support-uk.html": "uk", "support.html": "en", "help-uk.html": "uk", "help.html": "en"}


def remember(lang):
    return f"try {{ localStorage.setItem('dibsly.site.lang', '{TEXT[lang]['other_lang']}'); }} catch (error) {{}}"


def nav(lang, page):
    t, other = TEXT[lang], PAIR[page]
    links = "\n".join(f'                <a href="{h}"{" aria-current=" + chr(34) + "page" + chr(34) if h == page else ""}>{x}</a>' for h, x in t["nav"])
    return f'''    <header class="nav">
        <nav class="nav-pill" aria-label="{t["main"]}">
            <a class="brand" href="{t["home"]}"><img src="img/apple-touch-icon.png" alt="" width="28" height="28">Dibsly</a>
            <div class="nav-links">
{links}
            </div>
            <div class="nav-actions">
                <a class="lang" href="{other}" hreflang="{t["other_lang"]}" lang="{t["other_lang"]}" aria-label="{t["other_name"]}" onclick="{remember(lang)}">{t["other_label"]}</a>
                <a class="pill ghost" href="https://my.dibslyapp.com">{t["signin"]}</a>
                <a class="pill hot" href="{APP}">{t["get"]}</a>
            </div>
        </nav>
    </header>'''


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


def put(text, tag, block):
    # The page's one <header class="nav">…</header> or <footer>…</footer>, with its indentation, becomes the block.
    opening = '<header class="nav">' if tag == "header" else "<footer>"
    found = re.findall(rf"^ *{re.escape(opening)}.*?</{tag}>", text, flags=re.S | re.M)
    assert len(found) == 1, (tag, len(found))
    return text.replace(found[0], block)


if __name__ == "__main__":
    ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
    for name, lang in list(HAND.items()) + list(LANDING.items()):
        path = f"{ROOT}/{name}"
        text = open(path).read()
        new = put(text, "footer", footer(lang, name))
        if name in HAND:
            new = put(new, "header", nav(lang, name))
        if new != text:
            open(path, "w").write(new)
        print(name, "changed" if new != text else "as it was")
