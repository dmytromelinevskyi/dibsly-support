// dibslyapp.com's header on every page (2026-10-29, task 15; markup from tools/pages.py, styles v3/nav.css).
// «Можливості» and «Допомога» open their cards on hover, on a click and from the keyboard (↓ ↑ inside, ← → between the
// menu's items, Esc), and close on Esc, a click elsewhere or leaving them. Under 900 px the burger opens the whole menu
// as a sheet: focus stays in it, the page under it does not scroll, Esc, the cross or a chosen item close it.
// The landing hears «dibsly:nav» to pause its smooth scroll while the sheet is open.
(function () {
    var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var hover = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    function all(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }

    // ---------------------------------------------------------------- the groups' cards
    var groups = all(".nav-group");
    function setOpen(group, open) {
        var button = group.querySelector(".nav-top");
        group.classList.toggle("open", open);
        button.setAttribute("aria-expanded", open ? "true" : "false");
    }
    function closeAll(except) { groups.forEach(function (group) { if (group !== except) setOpen(group, false); }); }
    function items(group) { return all(".nav-drop a", group); }
    groups.forEach(function (group) {
        var button = group.querySelector(".nav-top"), timer = null;
        // A click toggles; a card the pointer has just opened stays (the click pins it rather than closing it).
        button.addEventListener("click", function () {
            var open = !group.classList.contains("open") || group.getAttribute("data-by") === "hover";
            group.setAttribute("data-by", "click");
            closeAll(group);
            setOpen(group, open);
        });
        button.addEventListener("keydown", function (event) {
            if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
            event.preventDefault();
            closeAll(group);
            setOpen(group, true);
            var list = items(group);
            list[event.key === "ArrowDown" ? 0 : list.length - 1].focus();
        });
        group.addEventListener("keydown", function (event) {
            var list = items(group), at = list.indexOf(document.activeElement);
            if (event.key === "Escape" && group.classList.contains("open")) {
                event.preventDefault();
                event.stopPropagation();
                setOpen(group, false);
                button.focus();
            } else if (at >= 0 && (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End")) {
                event.preventDefault();
                var next = event.key === "Home" ? 0 : event.key === "End" ? list.length - 1 : (at + (event.key === "ArrowDown" ? 1 : -1) + list.length) % list.length;
                list[next].focus();
            }
        });
        group.addEventListener("focusout", function (event) {
            if (!group.contains(event.relatedTarget)) setOpen(group, false);
        });
        if (hover) {
            group.addEventListener("mouseenter", function () {
                clearTimeout(timer);
                if (!group.classList.contains("open")) group.setAttribute("data-by", "hover");
                closeAll(group);
                setOpen(group, true);
            });
            group.addEventListener("mouseleave", function () {
                clearTimeout(timer);
                timer = setTimeout(function () { if (!group.contains(document.activeElement)) setOpen(group, false); }, 160);
            });
        }
        items(group).forEach(function (link) { link.addEventListener("click", function () { setOpen(group, false); }); });
    });
    document.addEventListener("click", function (event) {
        groups.forEach(function (group) { if (!group.contains(event.target)) setOpen(group, false); });
    });
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") closeAll();
    });
    // ← → between the menu's own items (the two groups' buttons and the two links).
    all(".nav-menu").forEach(function (menu) {
        menu.addEventListener("keydown", function (event) {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            var tops = all(".nav-top", menu), at = tops.indexOf(document.activeElement);
            if (at < 0) return;
            event.preventDefault();
            closeAll();
            tops[(at + (event.key === "ArrowRight" ? 1 : -1) + tops.length) % tops.length].focus();
        });
    });
    // A card left open does not ride along when the page scrolls away under it.
    var openedAt = null;
    window.addEventListener("scroll", function () {
        var open = groups.some(function (group) { return group.classList.contains("open"); });
        if (!open) { openedAt = null; return; }
        if (openedAt === null) openedAt = window.scrollY;
        if (Math.abs(window.scrollY - openedAt) > 60) { closeAll(); openedAt = null; }
    }, { passive: true });

    // ---------------------------------------------------------------- the sheet (under 900 px)
    all(".nav-burger").forEach(function (burger) {
        var sheet = document.getElementById(burger.getAttribute("aria-controls"));
        if (!sheet) return;
        var close = sheet.querySelector(".nav-close"), wide = window.matchMedia("(min-width: 900px)");
        function focusable() { return all("a[href], button", sheet).filter(function (el) { return el.offsetParent !== null || el === close; }); }
        function tell(open) {
            var event;
            try { event = new CustomEvent("dibsly:nav", { detail: { open: open } }); } catch (error) { return; }
            document.dispatchEvent(event);
        }
        function open() {
            closeAll();
            sheet.hidden = false;
            document.documentElement.classList.add("nav-locked");
            burger.setAttribute("aria-expanded", "true");
            tell(true);
            if (calm) sheet.classList.add("open");
            else requestAnimationFrame(function () { requestAnimationFrame(function () { sheet.classList.add("open"); }); });
            close.focus({ preventScroll: true });
        }
        function shut(back) {
            if (sheet.hidden) return;
            sheet.classList.remove("open");
            document.documentElement.classList.remove("nav-locked");
            burger.setAttribute("aria-expanded", "false");
            tell(false);
            if (calm) sheet.hidden = true;
            else setTimeout(function () { if (!sheet.classList.contains("open")) sheet.hidden = true; }, 400);
            if (back) burger.focus({ preventScroll: true });
        }
        burger.addEventListener("click", open);
        close.addEventListener("click", function () { shut(true); });
        sheet.addEventListener("keydown", function (event) {
            if (event.key === "Escape") { event.preventDefault(); shut(true); return; }
            if (event.key !== "Tab") return;
            var list = focusable(), first = list[0], last = list[list.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        });
        // A chosen item closes the sheet before the page goes there (capture: ahead of the landing's smooth scroll).
        document.addEventListener("click", function (event) {
            var link = event.target.closest && event.target.closest("a[href]");
            if (link && sheet.contains(link)) shut(false);
        }, true);
        var onWide = function () { if (wide.matches) shut(false); };
        if (wide.addEventListener) wide.addEventListener("change", onWide); else if (wide.addListener) wide.addListener(onWide);
    });
})();
