// dibslyapp.com landing 2.0 (preview, 2026-10-20): the hero's conversation with Dibsly plays from a script on the
// demo figures (no AI is asked), the phones play loops recorded in the app only while on screen, the analytics labels
// light up in step with their video, and Dibsly himself (the app's Lottie files) changes his mood with the answer.
// With “reduce motion” the answers appear at once, the videos stay on their first frame and Dibsly is a picture.
(function () {
    var root = document.documentElement;
    var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var hasObserver = "IntersectionObserver" in window;
    var isDark = function () { return root.dataset.theme === "dark"; };

    function watch(items, onChange, options) {
        if (!hasObserver) { items.forEach(function (each) { onChange(each, true); }); return; }
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) { onChange(entry.target, entry.isIntersecting); });
        }, options || { rootMargin: "0px 0px -8% 0px" });
        items.forEach(function (each) { observer.observe(each); });
    }

    // Sections rise in once.
    watch(Array.prototype.slice.call(document.querySelectorAll(".reveal")), function (each, inView) {
        if (inView) each.classList.add("shown");
    });

    // Dibsly: the files of the landing (hello, idle, invest, savings, celebrate) or the ones copied for 2.0.
    var own = { expense: 1, next: 1, wait: 1, annoyed: 1 };
    function animationPath(name) {
        return (own[name] ? "mascot/" : "../img/mascot/") + name + "-" + (isDark() ? "dark" : "light") + ".json";
    }
    function play(box, name, then, loop) {
        if (calm || !window.lottie) return;
        if (box._animation) box._animation.destroy();
        var stage = box.querySelector(".mascot-stage");
        var animation = window.lottie.loadAnimation({ container: stage, renderer: "svg", autoplay: true,
            loop: !then && loop, path: animationPath(name) });
        animation.addEventListener("DOMLoaded", function () { box.classList.add("alive"); });
        if (then) {
            animation.addEventListener("complete", function () { play(box, then, null, true); });
        }
        box._animation = animation;
        box._current = [name, then, loop];
    }
    var mascots = Array.prototype.slice.call(document.querySelectorAll(".mascot[data-play]"));
    function startMascots() {
        watch(mascots, function (box, inView) {
            if (inView && !box._animation) {
                play(box, box.getAttribute("data-play"), box.getAttribute("data-then"), box.hasAttribute("data-loop"));
            } else if (box._animation) {
                inView ? box._animation.play() : box._animation.pause();
            }
        }, { rootMargin: "0px 0px -10% 0px" });
    }
    if (document.readyState === "complete") startMascots(); else window.addEventListener("load", startMascots);

    // The theme: light unless the visitor picks dark (kept in the browser).
    var toggle = document.querySelector(".theme");
    if (toggle) toggle.addEventListener("click", function () {
        if (isDark()) delete root.dataset.theme; else root.dataset.theme = "dark";
        try { localStorage.setItem("dibsly.site.theme", isDark() ? "dark" : "light"); } catch (error) {}
        mascots.forEach(function (box) { if (box._current) play(box, box._current[0], box._current[1], box._current[2]); });
    });

    // Phones: a loop plays while it is on screen.
    var videos = Array.prototype.slice.call(document.querySelectorAll(".phone video"));
    if (!calm) watch(videos, function (video, inView) {
        if (inView) { var started = video.play(); if (started && started.catch) started.catch(function () {}); }
        else video.pause();
    }, { threshold: 0.35 });

    // Analytics: the label of the tab the video shows is lit.
    var stage = document.querySelector(".tabs-stage");
    if (stage) {
        var labels = Array.prototype.slice.call(stage.querySelectorAll("li[data-from]"));
        var video = stage.querySelector("video");
        var light = function () {
            var at = video.currentTime;
            var lit = labels.filter(function (li) { return at >= +li.dataset.from && at < +li.dataset.to; })[0] || labels[0];
            labels.forEach(function (li) { li.classList.toggle("on", li === lit); });
        };
        video.addEventListener("timeupdate", light);
        light();
    }

    // The conversation.
    var script = window.DIBSLY_CHAT || [];
    var box = document.querySelector(".chatbox");
    if (!box || !script.length) return;
    var list = box.querySelector(".messages");
    var chips = box.querySelector(".chips");
    var hero = document.querySelector(".ask .mascot");
    var busy = false;
    var asked = 0;
    var wait = function (ms) { return new Promise(function (done) { setTimeout(done, calm ? 0 : ms); }); };

    function add(node) { list.appendChild(node); list.scrollTop = list.scrollHeight; return node; }
    function bubble(text, who) {
        var p = document.createElement("p");
        p.className = "msg " + who;
        p.textContent = text;
        return add(p);
    }
    function typeInto(node, text) {
        if (calm) { node.textContent = text; return Promise.resolve(); }
        var characters = Array.from(text);
        var shown = 0;
        return new Promise(function (done) {
            var timer = setInterval(function () {
                shown += 2;
                node.textContent = characters.slice(0, shown).join("");
                list.scrollTop = list.scrollHeight;
                if (shown >= characters.length) { clearInterval(timer); done(); }
            }, 18);
        });
    }
    var money = window.DIBSLY_MONEY === "en"
        ? function (value) { return "₴" + value.toLocaleString("en-US"); }
        : function (value) { return value.toLocaleString("uk-UA").replace(/[\u00a0\u202f,]/g, " ") + " ₴"; };
    function barsCard(bars) {
        var card = document.createElement("div");
        card.className = "card";
        var title = document.createElement("h4");
        title.textContent = bars.title;
        var rows = document.createElement("div");
        rows.className = "bars";
        var top = bars.rows[0][1];
        bars.rows.forEach(function (row, index) {
            var line = document.createElement("div");
            var name = document.createElement("span");
            name.textContent = row[0];
            var bar = document.createElement("i");
            bar.style.width = Math.round(row[1] / top * 100) + "%";
            bar.style.animationDelay = index * 90 + "ms";
            var sum = document.createElement("b");
            sum.textContent = money(row[1]);
            line.append(name, bar, sum);
            rows.appendChild(line);
        });
        card.append(title, rows);
        return add(card);
    }
    function operationCard(op) {
        var card = document.createElement("div");
        card.className = "card";
        card.innerHTML = '<div class="op"><span class="icon"></span><div class="what"><strong></strong><span></span></div>' +
            '<span class="sum"></span></div><div class="card-actions"><button class="skip" type="button"></button>' +
            '<button class="save" type="button"></button></div><p class="done"></p>';
        card.querySelector(".icon").textContent = op.icon;
        card.querySelector(".what strong").textContent = op.title;
        card.querySelector(".what span").textContent = op.sub;
        card.querySelector(".sum").textContent = op.sum;
        card.querySelector(".save").textContent = op.save;
        card.querySelector(".skip").textContent = op.skip;
        card.querySelector(".done").textContent = op.done;
        card.querySelector(".save").addEventListener("click", function () {
            card.classList.add("saved");
            if (hero) play(hero, "celebrate", "idle");
            wait(500).then(function () { bubble(op.thanks, "dibsly"); });
        });
        card.querySelector(".skip").addEventListener("click", function () { card.remove(); });
        return add(card);
    }

    function ask(index) {
        if (busy) return;
        busy = true;
        var item = script[index];
        setChips(true);
        bubble(item.q, "me");
        if (hero) play(hero, "wait", null, true);
        wait(350).then(function () {
            var reply = bubble("•••", "dibsly typing");
            return wait(900).then(function () {
                reply.classList.remove("typing");
                return typeInto(reply, item.a);
            });
        }).then(function () {
            if (item.bars) barsCard(item.bars);
            if (item.op) operationCard(item.op);
            if (hero) play(hero, item.mood || "idle", "idle");
            asked += 1;
            chips.querySelectorAll(".chip")[index].classList.add("asked");
            busy = false;
            setChips(false);
        });
    }
    function setChips(disabled) {
        Array.prototype.forEach.call(chips.querySelectorAll(".chip"), function (chip) { chip.disabled = disabled; });
        again.hidden = asked < script.length;
    }
    script.forEach(function (item, index) {
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chip";
        chip.textContent = item.q;
        chip.addEventListener("click", function () { ask(index); });
        chips.appendChild(chip);
    });
    var again = document.createElement("button");
    again.type = "button";
    again.className = "chip";
    again.textContent = window.DIBSLY_CHAT_AGAIN || "Again";
    again.hidden = true;
    again.addEventListener("click", function () {
        list.innerHTML = "";
        asked = 0;
        Array.prototype.forEach.call(chips.querySelectorAll(".chip"), function (chip) { chip.classList.remove("asked"); });
        again.hidden = true;
        ask(0);
    });
    chips.appendChild(again);

    // The first question asks itself once the conversation is on screen.
    var started = false;
    watch([box], function (target, inView) {
        if (inView && !started) { started = true; setTimeout(function () { ask(0); }, calm ? 0 : 900); }
    }, { threshold: 0.5 });
})();
