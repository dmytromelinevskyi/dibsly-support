// «Що вміє Dibsly» on the shared style (2026-10-29): the phones' sharp screenshots change with a crossfade while on
// screen; where a tap made the change, a touch mark shows on the spot first (from v2/v2.js, without its mascots and
// its theme). With «reduce motion» each phone keeps its first screen.
(function () {
    var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm || !("IntersectionObserver" in window)) return;
    Array.prototype.forEach.call(document.querySelectorAll(".slides"), function (deck) {
        var shots = Array.prototype.slice.call(deck.querySelectorAll("img"));
        if (shots.length < 2) return;
        var mark = deck.querySelector(".tap");
        var hold = +deck.dataset.hold || 1700;
        var at = 0, timer = null, ready = null;
        function show(index) {
            shots[at].classList.remove("on");
            at = index;
            shots[at].classList.add("on");
        }
        function step() {
            var next = (at + 1) % shots.length;
            var tap = shots[next].dataset.tap;
            if (tap && mark) {
                var spot = tap.split(",");
                mark.style.left = spot[0] + "%";
                mark.style.top = spot[1] + "%";
                mark.classList.remove("go");
                void mark.offsetWidth;
                mark.classList.add("go");
                timer = setTimeout(function () { show(next); timer = setTimeout(step, hold); }, 320);
            } else {
                show(next);
                timer = setTimeout(step, hold);
            }
        }
        new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                clearTimeout(timer);
                timer = null;
                if (!entry.isIntersecting) return;
                if (!ready) {
                    shots.forEach(function (shot) { shot.loading = "eager"; });
                    ready = Promise.all(shots.map(function (shot) { return shot.decode ? shot.decode().catch(function () {}) : null; }));
                }
                ready.then(function () { if (!timer) timer = setTimeout(step, hold); });
            });
        }, { threshold: 0.35 }).observe(deck);
    });
})();
