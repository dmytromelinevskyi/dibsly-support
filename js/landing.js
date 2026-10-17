// dibslyapp.com landing (2026-10-17): sections rise in, Dibsly the hamster comes alive (the app's own Lottie files),
// the analytics phone changes its screen with the text beside it, and the assistant's chat types itself. With
// “reduce motion” everything is shown at once and the hamster stays a picture.
(function () {
    var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    var hasObserver = "IntersectionObserver" in window;

    function watch(items, onEnter, options) {
        if (!hasObserver) { items.forEach(function (each) { onEnter(each); }); return; }
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) { onEnter(entry.target); observer.unobserve(entry.target); }
            });
        }, options || { rootMargin: "0px 0px -8% 0px" });
        items.forEach(function (each) { observer.observe(each); });
    }

    // Sections rise in once as they enter the view.
    var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    watch(reveals, function (each) { each.classList.add("shown"); });

    // The chat: messages appear one after another, the assistant's after a moment of “typing”.
    var chats = Array.prototype.slice.call(document.querySelectorAll(".chat"));
    chats.forEach(function (chat) { if (!calm) chat.classList.add("waiting"); });
    watch(chats, function (chat) {
        if (calm) return;
        var lines = Array.prototype.slice.call(chat.querySelectorAll("p"));
        var delay = 250;
        lines.forEach(function (line) {
            var isBot = line.classList.contains("bot");
            if (isBot) {
                setTimeout(function () { line.classList.add("typing", "said"); }, delay);
                delay += 900;
                setTimeout(function () { line.classList.remove("typing"); }, delay);
            } else {
                setTimeout(function () { line.classList.add("said"); }, delay);
            }
            delay += isBot ? 650 : 700;
        });
    }, { rootMargin: "0px 0px -25% 0px" });

    // Analytics: the sticky phone shows the screen of the panel in the middle of the view.
    var tour = document.querySelector(".tour");
    if (tour && hasObserver) {
        var screens = Array.prototype.slice.call(tour.querySelectorAll(".tour-screen"));
        var panels = Array.prototype.slice.call(tour.querySelectorAll(".tour-panel"));
        var show = function (index) {
            screens.forEach(function (screen, at) { screen.classList.toggle("active", at === index); });
            panels.forEach(function (panel, at) { panel.classList.toggle("active", at === index); });
        };
        var picker = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) show(panels.indexOf(entry.target));
            });
        }, { rootMargin: "-45% 0px -45% 0px" });
        panels.forEach(function (panel) { picker.observe(panel); });
        show(0);
    }

    // Dibsly: each `.mascot[data-play]` plays its animation while it is on screen; `data-then` loops another after it.
    if (calm || !window.lottie || !hasObserver) return;
    var mascots = Array.prototype.slice.call(document.querySelectorAll(".mascot[data-play]"));
    var path = function (name) { return "img/mascot/" + name + "-" + (dark && dark.matches ? "dark" : "light") + ".json"; };

    function start(box) {
        if (box._animation) box._animation.destroy();
        var first = box.getAttribute("data-play");
        var then = box.getAttribute("data-then");
        var animation = window.lottie.loadAnimation({
            container: box.querySelector(".mascot-stage"), renderer: "svg", autoplay: true,
            loop: !then && box.hasAttribute("data-loop"), path: path(first)
        });
        animation.addEventListener("DOMLoaded", function () { box.classList.add("alive"); });
        if (then) {
            animation.addEventListener("complete", function () {
                animation.destroy();
                box._animation = window.lottie.loadAnimation({
                    container: box.querySelector(".mascot-stage"), renderer: "svg", autoplay: true, loop: true,
                    path: path(then)
                });
            });
        }
        box._animation = animation;
    }

    var visible = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            var box = entry.target;
            if (entry.isIntersecting && !box._animation) start(box);
            else if (box._animation) entry.isIntersecting ? box._animation.play() : box._animation.pause();
        });
    }, { rootMargin: "0px 0px -10% 0px" });
    mascots.forEach(function (box) { visible.observe(box); });
    if (dark && dark.addEventListener) {
        dark.addEventListener("change", function () { mascots.forEach(function (box) { if (box._animation) start(box); }); });
    }
})();
