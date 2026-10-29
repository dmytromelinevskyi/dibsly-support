// dibslyapp.com's other pages (2026-10-29): things rise softly as they come in, and a page's sections' list marks the
// section on screen. With «reduce motion» or without IntersectionObserver, the page is simply there.
(function () {
    var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!calm && "IntersectionObserver" in window && items.length) {
        document.documentElement.classList.add("rise-on");
        var rise = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("in");
                rise.unobserve(entry.target);
            });
        }, { rootMargin: "0px 0px -8% 0px" });
        items.forEach(function (item) { rise.observe(item); });
    }

    var links = Array.prototype.slice.call(document.querySelectorAll(".toc a[href^='#']"));
    if (!links.length || !("IntersectionObserver" in window)) return;
    var byId = {};
    links.forEach(function (link) { byId[link.getAttribute("href").slice(1)] = link; });
    var mark = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            links.forEach(function (link) { link.classList.remove("on"); });
            var on = byId[entry.target.id];
            if (!on) return;
            on.classList.add("on");
            var row = on.parentNode;
            if (row.scrollWidth > row.clientWidth) row.scrollTo({ left: on.offsetLeft - 20, behavior: calm ? "auto" : "smooth" });
        });
    }, { rootMargin: "-30% 0px -60% 0px" });
    Object.keys(byId).forEach(function (id) { var section = document.getElementById(id); if (section) mark.observe(section); });
})();
