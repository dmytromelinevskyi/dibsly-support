// dibslyapp.com landing 3.0 (2026-10-28, owner: «пиздатые анимации, что у примеров… чтоб когда пользователи зашли на
// сайт, они ахуели»): a WebGL field of grey particles with a few orange sparks, like the app's grain (owner: «согласен»), behind the page that follows the mouse and the scroll, a short
// counting intro, smooth scrolling, titles that rise in word by word, the hero's phone that stays and shows the app step
// by step (owner's brother's idea), cards that tilt under the cursor and magnetic buttons. With «reduce motion», on a missing library or without WebGL, the page is simply there.
(function () {
    var root = document.documentElement;
    var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var small = window.innerWidth < 760;
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    var animated = !calm && !!gsap && !!ScrollTrigger;
    if (!animated) root.classList.add("no-motion");
    if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    function all(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }

    // ---------------------------------------------------------------- smooth scroll
    var lenis = null;
    if (animated && window.Lenis && !small) {
        lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
        all('a[href^="#"]').forEach(function (link) {
            link.addEventListener("click", function (event) {
                var target = document.querySelector(link.getAttribute("href"));
                if (!target) return;
                event.preventDefault();
                lenis.scrollTo(target, { offset: -20 });
            });
        });
    }

    // ---------------------------------------------------------------- titles: words rise out of their lines
    all(".hero-title .line, .title .line, .giant").forEach(function (line) {
        if (!animated) return;
        var nodes = Array.prototype.slice.call(line.childNodes);
        line.textContent = "";
        nodes.forEach(function (node) {
            if (node.nodeType === 3) {
                node.textContent.split(/(\s+)/).forEach(function (part) {
                    if (!part) return;
                    if (/^\s+$/.test(part)) { line.appendChild(document.createTextNode(part)); return; }
                    var word = document.createElement("span");
                    word.className = "word";
                    word.textContent = part;
                    line.appendChild(word);
                });
            } else {
                node.classList.add("word");
                line.appendChild(node);
            }
        });
    });

    // ---------------------------------------------------------------- the particle field
    var field = null;
    function startField() {
        var canvas = document.querySelector(".field");
        var THREE = window.THREE;
        if (!canvas || !THREE || calm) return null;
        var renderer;
        try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: true, powerPreference: "high-performance" }); }
        catch (error) { return null; }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0, 9);

        var count = small ? 2600 : 7000;
        var positions = new Float32Array(count * 3);
        var seeds = new Float32Array(count * 4);
        var seed = 11;
        function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
        for (var i = 0; i < count; i++) {
            var x, y, z;
            if (i % 3 === 0) {
                // A loose sphere of coins.
                var u = rnd() * 2 - 1, phi = rnd() * Math.PI * 2, r = 2.2 + Math.pow(rnd(), 0.6) * 1.6;
                var s = Math.sqrt(1 - u * u);
                x = r * s * Math.cos(phi); y = r * u * 0.85; z = r * s * Math.sin(phi);
            } else {
                // A spiral disc around it.
                var arm = i % 2, t = rnd(), angle = t * Math.PI * 5 + arm * Math.PI, radius = 2.6 + t * 6.5;
                x = Math.cos(angle) * radius + (rnd() - 0.5) * 1.4;
                z = Math.sin(angle) * radius + (rnd() - 0.5) * 1.4;
                y = (rnd() - 0.5) * (0.5 + t * 1.2);
            }
            positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = z;
            seeds[i * 4] = rnd(); seeds[i * 4 + 1] = rnd(); seeds[i * 4 + 2] = rnd(); seeds[i * 4 + 3] = rnd() < 0.12 ? 1 : 0;
        }
        var geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("seed", new THREE.BufferAttribute(seeds, 4));
        var uniforms = {
            uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(0, 0) }, uScroll: { value: 0 },
            uSpread: { value: 0 }, uFade: { value: 1 }, uPixel: { value: renderer.getPixelRatio() }
        };
        var material = new THREE.ShaderMaterial({
            uniforms: uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
            vertexShader: [
                "attribute vec4 seed;",
                "uniform float uTime; uniform vec2 uMouse; uniform float uScroll; uniform float uSpread; uniform float uPixel;",
                "varying float vWarm; varying float vAlpha;",
                "void main(){",
                "  vec3 p = position;",
                "  float t = uTime * (0.05 + seed.x * 0.08);",
                "  p += vec3(sin(t + seed.y * 6.28), cos(t * 1.3 + seed.z * 6.28), sin(t * 0.7 + seed.x * 6.28)) * (0.08 + seed.z * 0.18);",
                "  p *= 1.0 + uSpread * (0.6 + seed.y * 1.6);",
                "  p.y += uSpread * (seed.z - 0.5) * 6.0;",
                "  vec4 mv = modelViewMatrix * vec4(p, 1.0);",
                "  vec4 clip = projectionMatrix * mv;",
                "  vec2 ndc = clip.xy / clip.w;",
                "  vec2 away = ndc - uMouse;",
                "  float d = length(away);",
                "  float push = smoothstep(0.35, 0.0, d) * 0.12;",
                "  clip.xy += normalize(away + 1e-4) * push * clip.w;",
                "  gl_Position = clip;",
                "  gl_PointSize = (1.2 + seed.w * 1.6 + seed.x * 2.2) * uPixel * (7.0 / -mv.z);",
                "  vWarm = seed.w;",
                "  vAlpha = 0.35 + seed.y * 0.65;",
                "}"
            ].join("\n"),
            fragmentShader: [
                "uniform float uFade; varying float vWarm; varying float vAlpha;",
                "void main(){",
                "  float d = length(gl_PointCoord - 0.5);",
                "  float a = smoothstep(0.5, 0.0, d);",
                "  vec3 warm = vec3(1.0, 0.54, 0.24); vec3 cream = vec3(0.96, 0.92, 0.86);",
                "  vec3 c = mix(cream * 0.62, warm * 1.15, vWarm);",
                "  gl_FragColor = vec4(c, a * vAlpha * uFade);",
                "}"
            ].join("\n")
        });
        var points = new THREE.Points(geometry, material);
        var group = new THREE.Group();
        group.add(points);
        group.rotation.x = 0.42;
        group.position.x = small ? 0 : 2.2;
        scene.add(group);

        var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
        window.addEventListener("pointermove", function (event) {
            mouse.tx = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.ty = -((event.clientY / window.innerHeight) * 2 - 1);
        }, { passive: true });
        window.addEventListener("resize", function () {
            renderer.setSize(window.innerWidth, window.innerHeight, false);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        });

        var state = { spread: 0, fade: 1, shiftX: small ? 0 : 2.2, zoom: 9 };
        var running = true;
        document.addEventListener("visibilitychange", function () { running = !document.hidden; if (running) loop(); });
        // The field's pace (owner, 2026-10-28: the stars sped up as the page went on, hard to read over them). On screen
        // it stays within 1.3 times its start: the turn and the drift slow down as much as the spread and the camera
        // make them look faster (a point twice as far from the centre moves twice as far), and the scroll's changes —
        // the spread, the camera, the shift aside — move the points by at most a quarter of the start's speed, so a
        // new section eases in over a minute instead of a second. Time-based, so a 120 Hz screen is no faster.
        // Measured on the page: at the start the points move about 0.7% of the window's height a second; a unit of
        // spread moves them up to 0.6 of it, a unit of camera 0.05, a unit of shift 0.13.
        var last = performance.now(), clock = 0, START = 0.007;
        function ease(rate, dt) { return 1 - Math.pow(1 - rate, dt * 60); }
        function loop() {
            if (!running) { last = performance.now(); return; }
            var now = performance.now(), dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            mouse.x += (mouse.tx - mouse.x) * ease(0.06, dt);
            mouse.y += (mouse.ty - mouse.y) * ease(0.06, dt);
            uniforms.uMouse.value.set(mouse.x, mouse.y);
            uniforms.uFade.value += (state.fade - uniforms.uFade.value) * ease(0.05, dt);
            var ds = (state.spread - uniforms.uSpread.value) * ease(0.025, dt);
            var dz = (state.zoom - camera.position.z) * ease(0.025, dt);
            var dx = (state.shiftX - group.position.x) * ease(0.025, dt);
            var moves = Math.abs(ds) * 0.6 + Math.abs(dz) * 0.05 + Math.abs(dx) * 0.13, allowed = START * 0.25 * dt;
            var share = moves > allowed ? allowed / moves : 1;
            uniforms.uSpread.value += ds * share;
            camera.position.z += dz * share;
            group.position.x += dx * share;
            var apparent = (1 + uniforms.uSpread.value * 1.4) * 9 / camera.position.z;
            var pace = Math.min(apparent, 1.05) / apparent;
            clock += dt * pace;
            uniforms.uTime.value = clock;
            group.rotation.y += 0.021 * dt * pace;
            group.rotation.x = 0.42 + mouse.y * 0.12;
            group.rotation.z = mouse.x * 0.08;
            renderer.render(scene, camera);
            requestAnimationFrame(loop);
        }
        loop();
        canvas.classList.add("on");
        return state;
    }

    // ---------------------------------------------------------------- intro, then the hero
    function heroIn() {
        if (!animated) return;
        var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.from(".hero .kicker", { y: 20, opacity: 0, duration: 1 })
            .from(".hero-title .word", { yPercent: 115, rotate: 4, duration: 1.4, stagger: 0.07 }, "-=0.7")
            .to(".hero .fade-up", { y: 0, opacity: 1, duration: 1.2, stagger: 0.1 }, "-=1.0")
            .from(".hero-phone", { y: 160, rotateX: 28, rotateY: -18, opacity: 0, duration: 1.8 }, "-=1.5")
            .from(".nav-pill", { y: -40, opacity: 0, duration: 1 }, "-=1.4");
    }
    function begin() {
        field = startField();
        heroIn();
    }
    var intro = document.querySelector(".intro");
    var seen = false;
    try { seen = sessionStorage.getItem("dibsly.intro") === "1"; sessionStorage.setItem("dibsly.intro", "1"); } catch (error) {}
    if (animated && intro && !seen) {
        intro.classList.add("run");
        var counter = intro.querySelector(".intro-count");
        var shown = { v: 0 };
        gsap.timeline()
            .to(shown, { v: 100, duration: 1.1, ease: "power2.inOut", onUpdate: function () { counter.textContent = Math.round(shown.v); } })
            .to(intro, { yPercent: -100, duration: 0.9, ease: "expo.inOut", onStart: begin })
            .set(intro, { display: "none" });
    } else {
        if (intro) intro.style.display = "none";
        begin();
    }

    if (!animated) { runChat(); runMascots(); return; }

    // ---------------------------------------------------------------- the field follows the page
    ScrollTrigger.create({ trigger: ".hero", start: "top top", end: "bottom top", scrub: true,
        onUpdate: function (self) { if (field) { field.spread = self.progress * 0.9; field.zoom = 9 + self.progress * 3; } } });
    ScrollTrigger.create({ trigger: "#auto", start: "top bottom", endTrigger: "#faq", end: "bottom top",
        onToggle: function (self) { if (field) { field.fade = self.isActive ? 0.32 : 1; field.shiftX = self.isActive ? 0 : (small ? 0 : 2.2); } } });
    ScrollTrigger.create({ trigger: ".finale", start: "top 80%", end: "bottom bottom", scrub: true,
        onUpdate: function (self) { if (field) { field.spread = 0.9 - self.progress * 0.9; field.zoom = 12 - self.progress * 4.5; field.fade = 0.32 + self.progress * 0.9; field.shiftX = 0; } } });

    // ---------------------------------------------------------------- titles and reveals
    all(".title").forEach(function (title) {
        gsap.from(title.querySelectorAll(".word"), { yPercent: 115, rotate: 3, duration: 1.3, ease: "expo.out", stagger: 0.06,
            scrollTrigger: { trigger: title, start: "top 85%" } });
    });
    all(".kicker").forEach(function (kicker) {
        if (kicker.closest(".hero")) return;
        gsap.from(kicker, { x: -24, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: kicker, start: "top 90%" } });
    });
    var showItems = function (items) { gsap.to(items, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.08, overwrite: true }); };
    ScrollTrigger.batch(".reveal", { start: "top 88%", onEnter: showItems, onEnterBack: showItems });
    // Opened (or reloaded) further down the page: what is already above the screen is simply there.
    window.addEventListener("load", function () {
        var above = all(".reveal").filter(function (item) { return item.getBoundingClientRect().top < window.innerHeight * 0.88; });
        if (above.length) showItems(above);
        all(".title").forEach(function (title) {
            if (title.getBoundingClientRect().bottom < 0) gsap.set(title.querySelectorAll(".word"), { yPercent: 0, rotate: 0 });
        });
    });

    // ---------------------------------------------------------------- hero: the phone tilts under the cursor
    var heroPhone = document.querySelector(".hero-phone");
    if (fine && heroPhone) {
        window.addEventListener("pointermove", function (event) {
            var x = event.clientX / window.innerWidth - 0.5, y = event.clientY / window.innerHeight - 0.5;
            gsap.to(heroPhone, { rotateY: x * 14, rotateX: -y * 10, duration: 1.2, ease: "power3.out" });
        }, { passive: true });
    }
    var story = heroPhone ? journey(heroPhone.querySelector(".screen")) : null;
    // In the hero the phone stands level with «Особисті фінанси» (owner, 2026-10-28); by the first step it has settled
    // in the middle of the window, where the steps keep it. Never under the nav or past the window's bottom.
    var lift = document.querySelector(".phone-lift");
    if (lift && heroPhone) {
        var liftOffset = function () {
            if (window.innerWidth <= 1080) return 0;
            var kicker = document.querySelector(".hero .kicker"), top = 0;
            for (var node = kicker; node; node = node.offsetParent) top += node.offsetTop;
            var height = heroPhone.offsetHeight, centred = (window.innerHeight - height) / 2;
            return Math.max(84 - centred, Math.min(top - centred, centred - 16));
        };
        gsap.fromTo(lift, { y: liftOffset }, { y: 0, ease: "none", immediateRender: true,
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 30%", scrub: 0.6, invalidateOnRefresh: true } });
    }
    gsap.to(".hero-copy", { yPercent: -10, opacity: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "40% top", end: "bottom top", scrub: true } });
    gsap.to(".scroll-hint", { opacity: 0, scrollTrigger: { trigger: ".hero", start: "5% top", end: "20% top", scrub: true } });

    // ---------------------------------------------------------------- the marquee leans with the scroll's speed
    var track = document.querySelector(".marquee-track");
    if (track) {
        var skew = gsap.quickTo(track, "skewX", { duration: 0.6, ease: "power3.out" });
        ScrollTrigger.create({ trigger: ".marquee", start: "top bottom", end: "bottom top",
            onUpdate: function (self) { skew(Math.max(-10, Math.min(10, self.getVelocity() / -300))); } });
    }

    // ---------------------------------------------------------------- the price counts up
    all(".count").forEach(function (cell) {
        var to = parseFloat(cell.getAttribute("data-to")), decimals = parseInt(cell.getAttribute("data-decimals") || "0", 10);
        var value = { v: 0 };
        gsap.to(value, { v: to, duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: cell, start: "top 85%" },
            onUpdate: function () { cell.textContent = value.v.toFixed(decimals).replace(".", decimals && root.lang === "uk" && cell.closest(".float-card") ? "," : "."); } });
    });

    // ---------------------------------------------------------------- 09: cards light up under the cursor and tilt
    if (fine) {
        all(".spot").forEach(function (card) {
            card.addEventListener("pointermove", function (event) {
                var box = card.getBoundingClientRect();
                var x = (event.clientX - box.left) / box.width, y = (event.clientY - box.top) / box.height;
                card.style.setProperty("--x", x * 100 + "%");
                card.style.setProperty("--y", y * 100 + "%");
                gsap.to(card, { rotateY: (x - 0.5) * 8, rotateX: -(y - 0.5) * 8, transformPerspective: 900, duration: 0.6, ease: "power3.out" });
            });
            card.addEventListener("pointerleave", function () { gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.9, ease: "expo.out" }); });
        });
    }
    gsap.fromTo(".browser", { rotateX: 32, scale: 0.84, y: 40 }, { rotateX: 0, scale: 1, y: 0, ease: "none",
        scrollTrigger: { trigger: ".browser-wrap", start: "top 95%", end: "top 25%", scrub: true } });

    // ---------------------------------------------------------------- finale: the giant word gathers
    gsap.from(".giant .word", { yPercent: 40, scale: 1.25, letterSpacing: "0.08em", opacity: 0, ease: "none",
        scrollTrigger: { trigger: ".finale", start: "top 85%", end: "center center", scrub: true } });

    // ---------------------------------------------------------------- the rail, the nav, magnetic buttons, the cursor
    var railItems = all(".rail li");
    all("[data-section]").forEach(function (section) {
        ScrollTrigger.create({ trigger: section, start: "top 55%", end: "bottom 55%", onToggle: function (self) {
            if (!self.isActive) return;
            railItems.forEach(function (item) { item.classList.toggle("on", item.getAttribute("data-for") === section.id); });
        } });
    });
    var nav = document.querySelector(".nav");
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: function (self) {
        nav.classList.toggle("hide", self.direction === 1 && self.scroll() > 500);
    } });
    if (fine) {
        all(".magnetic").forEach(function (button) {
            button.addEventListener("pointermove", function (event) {
                var box = button.getBoundingClientRect();
                gsap.to(button, { x: (event.clientX - box.left - box.width / 2) * 0.3, y: (event.clientY - box.top - box.height / 2) * 0.4, duration: 0.5, ease: "power3.out" });
            });
            button.addEventListener("pointerleave", function () { gsap.to(button, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" }); });
        });
        var cursor = document.querySelector(".cursor");
        var cx = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3.out" });
        var cy = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3.out" });
        window.addEventListener("pointermove", function (event) { cursor.classList.add("on"); cx(event.clientX); cy(event.clientY); }, { passive: true });
        document.addEventListener("pointerover", function (event) {
            cursor.classList.toggle("hover", !!event.target.closest("a, button, summary, .spot"));
        });
    }

    runChat();
    runMascots();
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });

    // ================================================================ the journey: the hero's phone shows the app
    // Each step on the left plays its scene in the phone when it comes in: the app's own screens from the demo, cut,
    // faded, pushed or raised as a sheet, with a finger's taps, a notification, a highlight and a toast drawn over them.
    // Positions are the screen's points (402 × 874), as on the captures.
    function journey(screen) {
        if (!screen) return null;
        var live = screen.querySelector(".live"), strip = screen.querySelector(".screen-long");
        var frames = { live: live };
        // A page whose frames are not there yet (the English ones are shot later) keeps Main scrolling instead.
        var missing = false;
        function lost() { if (missing) return; missing = true; if (playing && playing !== "hero") play("hero"); }
        // The frames are a little shorter than the phone's screen: each one goes on below its picture in the colour of
        // its own bottom row (read once it has loaded), so nothing of the screen under it shows at the bottom edge.
        function floor(frame) {
            try {
                var canvas = document.createElement("canvas"), width = frame.naturalWidth;
                canvas.width = width;
                canvas.height = 1;
                var context = canvas.getContext("2d");
                context.drawImage(frame, 0, frame.naturalHeight - 1, width, 1, 0, 0, width, 1);
                // The row's background, not what is cut there: of its pixels by brightness, the one a quarter up.
                var row = context.getImageData(0, 0, width, 1).data, pixels = [];
                for (var i = 0; i < row.length; i += 4) pixels.push([row[i], row[i + 1], row[i + 2]]);
                pixels.sort(function (a, b) { return a[0] + a[1] + a[2] - b[0] - b[1] - b[2]; });
                frame.style.backgroundColor = "rgb(" + pixels[Math.floor(pixels.length / 4)].join(",") + ")";
            } catch (error) {}
        }
        all(".frame", screen).forEach(function (frame) {
            frames[frame.getAttribute("data-frame")] = frame;
            if (frame.complete && !frame.naturalWidth) lost(); else frame.addEventListener("error", lost);
            if (frame.complete && frame.naturalWidth) floor(frame); else frame.addEventListener("load", function () { floor(frame); });
        });
        var layers = Object.keys(frames).map(function (name) { return frames[name]; });
        var fx = {};
        ["banner", "bank", "hl", "tap", "touch", "app-toast"].forEach(function (name) { fx[name] = screen.querySelector(".fx ." + name); });
        var dim = screen.querySelector(".sheet-dim"), bar = screen.querySelector(".push-bar");
        var current = live, timeline = null, loop = null, depth = 1, playing = null, hand = null;
        // A language whose «Activity» title takes two lines puts the first purchase lower (en: 15 points).
        var activity = parseFloat(screen.getAttribute("data-activity-shift")) || 0;
        // Analytics' Flow, Trends and Capital tabs, x in points (their widths follow the language's words).
        var tabs = (screen.getAttribute("data-tabs") || "161,244,337").split(",").map(Number);
        // What sits elsewhere on the English frames (points, measured on the captures); the rest is the same for both:
        // «Борги» on Main's long strip, how far the chat scrolls from its top, its «Нова витрата» card, the width of
        // «Скинути фільтри» and the left and width of «Нагадати».
        var spot = document.documentElement.lang === "en"
            ? { debts: 1319.1, chat: 106.7, card: 416, reset: 142, remind: [47, 144] }
            : { debts: 1301.4, chat: 128.7, card: 395, reset: 180, remind: [31, 162] };

        function travel() {
            var tabs = live.querySelector(".ios-tabbar");
            return strip.offsetTop + strip.offsetHeight - (screen.offsetHeight - tabs.offsetHeight * 0.95);
        }
        function startLoop() {
            if (loop) loop.kill();
            gsap.set(strip, { y: 0 });
            loop = gsap.to(strip, { y: function () { return -travel(); }, duration: 26, ease: "sine.inOut", yoyo: true, repeat: -1, repeatDelay: 1.6, delay: 2.4 });
        }
        function stopLoop() { if (loop) { loop.kill(); loop = null; } }
        function x(pt) { return pt / 402 * 100 + "%"; }
        function y(pt) { return pt / 874 * 100 + "%"; }

        // A screen in a push without the status bar (the top 54 points).
        function barless() { return "inset(" + 54 * screen.offsetWidth / 402 + "px 0px 0px 0px)"; }
        // A rising sheet is cut along its own top edge on its frame (the points measured on the captures, the corners'
        // radius 40), so it rides exactly as it lands: no step when the whole frame comes in (owner: it jumped ~7 px).
        var sheetTops = { "b-form": 61.5, "b-cats": 71.5, "c-chat-top": 61.5, "g-history-filter": 61.5, "h-payment": 61.5 };
        function sheetEdge(name) {
            return function () {
                var pt = screen.offsetWidth / 402, top = (sheetTops[name] || 61.5) * pt;
                return "inset(" + top + "px 0px 0px 0px round " + 40 * pt + "px " + 40 * pt + "px 0px 0px)";
            };
        }
        // Shows a screen over the one in front: "fade", "cut", "push" (a page from the right), "pop" (back: the page
        // leaves to the right), "sheet" (from below) or "drop" (the sheet in front closes down onto the screen).
        // A push or a sheet stays hidden until its moment (no immediate render: a later sheet peeked under the screen).
        function show(tl, name, how, at) {
            var next = frames[name], last = current;
            if (!next || next === last) return;
            current = next;
            depth += 1;
            tl.set(next, { zIndex: depth, xPercent: 0, yPercent: 0 }, at);
            if (how === "push") {
                // As in iOS (owner, 2026-10-28): the status bar stays and only the screens under it slide — both have
                // their own bar cut off while they move, and the arriving frame's bar (the same 09:41 on every frame)
                // stands still over them; once in place, the whole frame.
                depth += 1;
                tl.call(function () { bar.src = next.getAttribute("src"); }, null, at)
                    .set(bar, { zIndex: depth, opacity: 1 }, at)
                    .set([next, last], { clipPath: barless }, at)
                    .fromTo(next, { xPercent: 100, opacity: 1 }, { xPercent: 0, duration: 0.6, ease: "power3.inOut", immediateRender: false }, at)
                    .to(last, { xPercent: -28, opacity: 0.4, duration: 0.6, ease: "power3.inOut" }, at)
                    .set(next, { clipPath: "none" }, at + 0.6)
                    .set(bar, { opacity: 0 }, at + 0.6);
            } else if (how === "pop") {
                // Back, as in iOS: the page goes off to the right over the one it came from, which slides back in
                // from the left, both under the same still status bar.
                depth += 2;
                tl.call(function () { bar.src = next.getAttribute("src"); }, null, at)
                    .set(last, { zIndex: depth - 1 }, at)
                    .set(bar, { zIndex: depth, opacity: 1 }, at)
                    .set([next, last], { clipPath: barless }, at)
                    .fromTo(next, { xPercent: -28, opacity: 0.4 }, { xPercent: 0, opacity: 1, duration: 0.6, ease: "power3.inOut", immediateRender: false }, at)
                    .to(last, { xPercent: 100, duration: 0.6, ease: "power3.inOut" }, at)
                    .set(next, { clipPath: "none" }, at + 0.6)
                    .set(bar, { opacity: 0 }, at + 0.6);
            } else if (how === "drop") {
                // A sheet closing: it goes down along its own edge, and the screen under it comes out of the dimming.
                depth += 2;
                tl.set(next, { opacity: 1 }, at)
                    .set(dim, { zIndex: depth - 1, opacity: 0.5 }, at)
                    .set(last, { zIndex: depth, clipPath: sheetEdge(last.getAttribute("data-frame")) }, at)
                    .to(last, { yPercent: 100, duration: 0.5, ease: "power3.in" }, at)
                    .to(dim, { opacity: 0, duration: 0.5, ease: "power1.in" }, at);
            } else if (how === "sheet") {
                // As in iOS (owner, 2026-10-28): the status bar stays, only the sheet rises — the frame's own bar is cut
                // off while it moves, its top corners rounded — and the screen under it dims (a layer between them that
                // fades out towards the bar); once up, the whole frame.
                depth += 1;
                tl.set(dim, { zIndex: depth - 1, opacity: 0 }, at)
                    .set(next, { zIndex: depth, clipPath: sheetEdge(name) }, at)
                    .fromTo(next, { yPercent: 100, opacity: 1 }, { yPercent: 0, duration: 0.6, ease: "power3.out", immediateRender: false }, at)
                    .to(dim, { opacity: 0.5, duration: 0.6, ease: "power1.out" }, at)
                    .set(next, { clipPath: "none" }, at + 0.6)
                    .set(dim, { opacity: 0 }, at + 0.6);
            } else {
                tl.fromTo(next, { opacity: 0 }, { opacity: 1, duration: how === "cut" ? 0.14 : 0.5, ease: "power1.inOut" }, at);
            }
            tl.set(last, { opacity: 0, xPercent: 0, yPercent: 0, clipPath: "none" });
        }
        // Scrolls a screen to another capture of it: the content between its fixed top and bottom (points) moves up by
        // the distance measured between the two frames, the old one's bars stay still over it; then the whole new frame.
        // Each frame is cut to the part of the band it fills, the cut kept still on the screen while the frame moves.
        function scroll(tl, name, at, distance, top, bottom) {
            var next = frames[name], last = current, move = { done: 0 };
            if (!next || next === last) return;
            current = next;
            depth += 2;
            function place() {
                var pt = screen.offsetWidth / 402, height = next.offsetHeight, gone = distance * move.done;
                gsap.set(last, { y: -gone * pt, clipPath: "inset(" + (top + gone) * pt + "px 0px " + (height - bottom * pt) + "px 0px)" });
                gsap.set(next, { y: (distance - gone) * pt, clipPath: "inset(" + top * pt + "px 0px " + (height - (bottom - distance + gone) * pt) + "px 0px)" });
            }
            function bars() {
                var pt = screen.offsetWidth / 402, w = bar.offsetWidth + "px", h = bar.offsetHeight + "px", t = top * pt + "px", b = bottom * pt + "px";
                return "polygon(0px 0px, " + w + " 0px, " + w + " " + t + ", 0px " + t + ", 0px " + b + ", " + w + " " + b + ", " + w + " " + h + ", 0px " + h + ")";
            }
            tl.call(function () { bar.src = last.getAttribute("src"); bar.style.backgroundColor = last.style.backgroundColor; }, null, at)
                .set(last, { zIndex: depth - 1 }, at)
                .set(next, { zIndex: depth - 2, xPercent: 0, yPercent: 0, opacity: 1 }, at)
                .set(bar, { zIndex: depth, opacity: 1, clipPath: bars }, at)
                .fromTo(move, { done: 0 }, { done: 1, duration: 0.9, ease: "power2.inOut", immediateRender: false, onStart: place, onUpdate: place }, at)
                .set(next, { y: 0, clipPath: "none" }, at + 0.9)
                .set(bar, { opacity: 0, clearProps: "clipPath" }, at + 0.9)
                .set(last, { opacity: 0, y: 0, clipPath: "none" }, at + 0.9);
        }
        // The finger comes in a little below its first target, glides from tap to tap, presses (a ring spreads from
        // under it) and lifts away at the end.
        // The ring waits for its moment (no immediate render: the scene's last ring showed from its start).
        function tap(tl, px, py, at) {
            if (!hand) {
                hand = { x: Math.min(370, px + 40), y: Math.min(840, py + 90) };
                tl.set(fx.touch, { left: x(hand.x), top: y(hand.y), scale: 1.25, opacity: 0 }, at - 1.0)
                    .to(fx.touch, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }, at - 1.0);
            }
            var glide = Math.min(0.75, 0.35 + Math.hypot(px - hand.x, py - hand.y) / 900);
            tl.to(fx.touch, { left: x(px), top: y(py), duration: glide, ease: "power2.inOut" }, at - glide - 0.06)
                .to(fx.touch, { scale: 0.78, duration: 0.1, ease: "power2.in" }, at)
                .to(fx.touch, { scale: 1, duration: 0.22, ease: "power2.out" }, at + 0.12)
                .fromTo(fx.tap, { left: x(px), top: y(py), scale: 0.6, opacity: 0.9 }, { scale: 1.9, opacity: 0, duration: 0.6, ease: "power2.out", immediateRender: false }, at + 0.02);
            hand = { x: px, y: py };
        }
        function release(tl, at) {
            if (!hand) return;
            tl.to(fx.touch, { opacity: 0, scale: 1.2, duration: 0.4, ease: "power2.out" }, at);
            hand = null;
        }
        function mark(tl, px, py, width, height, at, hold) {
            tl.set(fx.hl, { left: x(px), top: y(py), width: x(width), height: y(height), scale: 1.08, opacity: 0 }, at)
                .to(fx.hl, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" }, at)
                .to(fx.hl, { opacity: 0, duration: 0.4 }, at + (hold || 1.6));
        }
        // Back to a still screen: what a cut-short scene left half way is put straight — its timeline and every tween
        // still running on the screens and the effects are stopped, the notifications, toast, highlight and finger gone.
        function settle() {
            if (timeline) timeline.kill();
            timeline = null;
            var effects = Object.keys(fx).map(function (name) { return fx[name]; }).concat([dim, bar]);
            gsap.killTweensOf(layers.concat(effects));
            // The layers' order starts again from the screen in front: it only ever grew, and after a run through the
            // page the frames rose above the effects (z-index 50), hiding the marks and the finger on the last steps.
            depth = 1;
            layers.forEach(function (layer) {
                gsap.set(layer, { opacity: layer === current ? 1 : 0, xPercent: 0, yPercent: 0, y: 0, clipPath: "none", zIndex: layer === current ? 1 : 0 });
            });
            gsap.set(effects, { opacity: 0, xPercent: 0, yPercent: 0, y: 0, scale: 1 });
            gsap.set([dim, bar], { zIndex: 0 });
            gsap.set(bar, { clearProps: "clipPath" });
            hand = null;
        }

        var scenes = {
            hero: function (tl) {
                show(tl, "live", "fade", 0);
                tl.to(strip, { y: 0, duration: 0.9, ease: "power2.inOut" }, 0);
                tl.call(startLoop, null, 0.9);
            },
            // A purchase with Apple Pay waits in «Активність»; one tap saves it and «Витрачено» grows.
            auto: function (tl) {
                if (current === live) {
                    tl.to(strip, { y: 0, duration: 0.9, ease: "power2.inOut" }, 0);
                    show(tl, "a-main", "fade", 0.9);
                } else {
                    show(tl, "a-main", "fade", 0);
                }
                // The notifications come in from above the screen and leave fading out: a part of one left at the top
                // edge stayed on screen (owner: they «stuck»).
                tl.fromTo(fx.banner, { yPercent: -160, opacity: 1 }, { yPercent: 0, duration: 0.8, ease: "back.out(1.3)", immediateRender: false }, 1.5);
                mark(tl, 8, 545 + activity, 386, 46, 2.5, 1.8);
                tl.to(fx.banner, { yPercent: -160, opacity: 0, duration: 0.6, ease: "power2.in" }, 3.7);
                tap(tl, 359, 568 + activity, 4.6);
                show(tl, "a-after", "fade", 4.75);
                release(tl, 5.4);
                mark(tl, 146, 418, 104, 46, 5.5, 2.0);
                // Then a bank's own push (Premium, any bank, iOS 27): its purchase is the next draft in «Активність».
                tl.fromTo(fx.bank, { yPercent: -160, opacity: 1 }, { yPercent: 0, duration: 0.8, ease: "back.out(1.3)", immediateRender: false }, 7.7);
                mark(tl, 8, 545 + activity, 386, 46, 8.6, 2.2);
                tl.to(fx.bank, { yPercent: -160, opacity: 0, duration: 0.6, ease: "power2.in" }, 10.0);
            },
            // «+» → «Операція» → 8, 5 → «Вибери категорію» → «Кафе й ресторани»: saved.
            plus: function (tl) {
                show(tl, "a-after", "fade", 0);
                tap(tl, 348, 800, 1.3);
                show(tl, "b-plus", "fade", 1.45);
                tap(tl, 200, 602, 2.7);
                show(tl, "b-form", "sheet", 2.85);
                tap(tl, 131, 685, 4.2);
                show(tl, "b-8", "cut", 4.3);
                tap(tl, 131, 633, 4.95);
                show(tl, "b-85", "cut", 5.05);
                tap(tl, 201, 805, 6.1);
                show(tl, "b-cats", "sheet", 6.25);
                tap(tl, 71, 272, 7.6);
                show(tl, "b-after", "fade", 7.75);
                release(tl, 8.2);
                tl.fromTo(fx["app-toast"], { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.55, ease: "back.out(1.5)" }, 8.2)
                    .to(fx["app-toast"], { opacity: 0, yPercent: 30, duration: 0.45 }, 10.8);
                mark(tl, 146, 418, 104, 46, 8.5, 2.0);
            },
            // On Main the finger taps Dibsly's button above «+»; the chat rises as a sheet at its top (what went where, the
            // card marked), then scrolls down to the answer and the expense it is ready to save.
            ask: function (tl) {
                var open = 1.5;
                tl.set(strip, { y: 0 }, 0);
                show(tl, "live", "fade", 0);
                tap(tl, 349, 731, 1.3);
                release(tl, 1.8);
                show(tl, "c-chat-top", "sheet", open);
                mark(tl, 14, 200, 374, 185, open + 0.9, 1.8);
                scroll(tl, "c-chat", open + 3.4, spot.chat, 122, 712);
                mark(tl, 16, spot.card, 370, 186, open + 4.6, 2.2);
            },
            // Analytics' four tabs one by one (Categories → Flow → Trends → Capital, the tabs measured on the frames: the
            // screen's data-tabs, as wide as their words).
            analytics: function (tl) {
                show(tl, "d-analytics", "push", 0);
                [["d-cashflow", 1.6], ["d-trends", 3.0], ["d-capital", 4.4]].forEach(function (step, index) {
                    tap(tl, tabs[index], 195, step[1]);
                    show(tl, step[0], "cut", step[1] + 0.12);
                });
                release(tl, 4.9);
            },
            // History: the «Категорія» filter opens as a sheet, «Кафе й ресторани» closes it on the filtered list.
            history: function (tl) {
                show(tl, "g-history", "push", 0);
                tap(tl, 295, 145, 1.6);
                show(tl, "g-history-filter", "sheet", 1.75);
                tap(tl, 154, 245, 3.3);
                show(tl, "g-history-filtered", "drop", 3.45);
                release(tl, 3.9);
                mark(tl, 18, 712, spot.reset, 46, 4.3, 2.2);
            },
            // The calendar: the month, then as a list, then a payment (MEGOGO) opened.
            calendar: function (tl) {
                show(tl, "h-calendar", "push", 0);
                tap(tl, 306, 84, 1.5);
                show(tl, "h-calendar-list", "fade", 1.65);
                tap(tl, 200, 376, 3.2);
                show(tl, "h-payment", "sheet", 3.35);
                release(tl, 3.8);
            },
            // The plan with what went over it (the two red tiles, «Підписки» and «Доставка»), then the goals with when
            // they come («Відпустка» first: its «У такому темпі» line).
            plan: function (tl) {
                show(tl, "c-plan", "push", 0);
                mark(tl, 22, 388, 170, 110, 0.9, 2.0);
                show(tl, "c-goals", "push", 3.3);
                mark(tl, 66, 366, 236, 28, 4.2, 2.2);
            },
            // Savings shared with Настя: the shares, the shared goal, then down to the accounts: whose, and the shared one.
            together: function (tl) {
                show(tl, "i-savings", "push", 0);
                mark(tl, 16, 200, 370, 80, 0.9, 1.8);
                mark(tl, 24, 464, 364, 68, 3.1, 1.8);
                scroll(tl, "i-savings-accounts", 5.3, 383.8, 108, 874);
                mark(tl, 24, 512, 354, 48, 6.4, 1.8);
                mark(tl, 22, 764, 358, 52, 8.6, 1.8);
            },
            // Main scrolls down to «Борги» and «Кредити» (the strip stops where they stand on the frame), one mark each;
            // Саша's debt with «Нагадати», back, then all the credits.
            money: function (tl) {
                stopLoop();
                tl.set(strip, { y: function () { return -travel() + 260; } }, 0);
                show(tl, "live", "fade", 0);
                tl.to(strip, { y: function () { var pt = screen.offsetWidth / 402; return (120 - spot.debts) * pt - strip.offsetTop; }, duration: 1.4, ease: "power2.inOut" }, 0.4);
                show(tl, "f-main-money", "fade", 1.8);
                mark(tl, 14, 114, 374, 263, 2.5, 1.4);
                mark(tl, 14, 397, 374, 332, 4.4, 1.4);
                tap(tl, 170, 291, 6.6);
                show(tl, "f-debt", "push", 6.75);
                mark(tl, spot.remind[0], 331, spot.remind[1], 60, 7.6, 1.6);
                tap(tl, 38, 84, 10.0);
                show(tl, "f-main-money", "pop", 10.15);
                tap(tl, 352, 423, 11.4);
                show(tl, "f-credits", "push", 11.55);
                release(tl, 12.0);
            },
            invest: function (tl) {
                show(tl, "c-invest", "push", 0);
                // «Загальний результат … +32,67 %» (its line 198–211.5 points on the frames, «Нереалізовано» from 221.5).
                mark(tl, 10, 192, 362, 26, 0.9, 2.4);
            },
            fop: function (tl) {
                show(tl, "c-fop", "push", 0);
                // «До сплати … до 19 лист.», then «Найближчі строки»' second row, «ЄП і ВЗ за III кв. 16 290,00 ₴»
                // (between its lines at 374.5 and 419 points on the frames).
                mark(tl, 10, 117, 300, 107, 0.9, 2.0);
                mark(tl, 24, 376, 356, 42, 3.2, 2.0);
            }
        };

        function play(name) {
            if (missing) name = "hero";
            if (!scenes[name] || name === playing) return;
            playing = name;
            settle();
            if (name !== "hero") stopLoop();
            timeline = gsap.timeline();
            scenes[name](timeline);
        }
        if (strip.complete) startLoop(); else strip.addEventListener("load", startLoop);

        // Each step plays its scene as it comes in, and going back up plays the one before.
        var order = all("[data-scene]");
        order.forEach(function (section, index) {
            if (index === 0) return;
            var before = order[index - 1].getAttribute("data-scene");
            var copy = section.querySelector(".step-copy") || section;
            ScrollTrigger.create({ trigger: small ? copy : section, start: small ? "top 88%" : "top 55%",
                onEnter: function () { play(section.getAttribute("data-scene")); },
                onLeaveBack: function () { play(before); } });
        });
        return { play: play };
    }

    // ================================================================ Dibsly himself and the demo conversation (2.0)
    function runMascots() {
        var files = {};
        var own = { expense: 1, next: 1, annoyed: 1 };
        function path(name) {
            var where = own[name] ? (window.DIBSLY_ASSETS || "v2/") + "mascot/" : (window.DIBSLY_IMAGES || "img/") + "mascot/";
            return where + name + "-dark.json";
        }
        function data(name) {
            var p = path(name);
            if (!files[p]) files[p] = fetch(p).then(function (answer) { return answer.json(); });
            return files[p];
        }
        window.dibslyPlay = function (box, name, then, loop) {
            if (calm || !window.lottie || !box) return;
            var ticket = (box._ticket || 0) + 1;
            box._ticket = ticket;
            data(name).then(function (json) {
                if (box._ticket !== ticket) return;
                var stageEl = box.querySelector(".mascot-stage");
                var layer = document.createElement("div");
                layer.className = "mascot-layer";
                stageEl.appendChild(layer);
                var animation = window.lottie.loadAnimation({ container: layer, renderer: "svg", autoplay: true, loop: !then && loop, animationData: json });
                animation.addEventListener("DOMLoaded", function () {
                    box.classList.add("alive");
                    requestAnimationFrame(function () { layer.classList.add("shown"); });
                    var old = box._animation, oldLayer = box._layer;
                    box._animation = animation;
                    box._layer = layer;
                    if (old) setTimeout(function () { old.destroy(); if (oldLayer) oldLayer.remove(); }, 220);
                });
                if (then) animation.addEventListener("complete", function () { if (box._ticket === ticket) window.dibslyPlay(box, then, null, true); });
            });
        };
        var boxes = all(".mascot[data-play]");
        if (!("IntersectionObserver" in window)) return;
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var box = entry.target;
                if (entry.isIntersecting && !box._animation) window.dibslyPlay(box, box.getAttribute("data-play"), box.getAttribute("data-then"), box.hasAttribute("data-loop"));
                else if (box._animation) entry.isIntersecting ? box._animation.play() : box._animation.pause();
            });
        }, { rootMargin: "0px 0px -10% 0px" });
        boxes.forEach(function (box) { observer.observe(box); });
    }

    function runChat() {
        var script = window.DIBSLY_CHAT || [];
        var box = document.querySelector(".chatbox");
        if (!box || !script.length) return;
        var list = box.querySelector(".messages");
        var chips = box.querySelector(".chips");
        var hero = box.querySelector(".mascot");
        var busy = false, asked = 0;
        var wait = function (ms) { return new Promise(function (done) { setTimeout(done, calm ? 0 : ms); }); };
        function add(node) { list.appendChild(node); list.scrollTop = list.scrollHeight; return node; }
        function bubble(text, who) { var p = document.createElement("p"); p.className = "msg " + who; p.textContent = text; return add(p); }
        function typeInto(node, text) {
            if (calm) { node.textContent = text; return Promise.resolve(); }
            var characters = Array.from(text), count = 0;
            return new Promise(function (done) {
                var timer = setInterval(function () {
                    count += 3;
                    node.textContent = characters.slice(0, count).join("");
                    list.scrollTop = list.scrollHeight;
                    if (count >= characters.length) { clearInterval(timer); done(); }
                }, 16);
            });
        }
        function money(value) { return value.toLocaleString("uk-UA").replace(/[  ,]/g, " ") + " ₴"; }
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
                var name = document.createElement("span"); name.textContent = row[0];
                var bar = document.createElement("i"); bar.style.width = Math.round(row[1] / top * 100) + "%"; bar.style.animationDelay = index * 90 + "ms";
                var sum = document.createElement("b"); sum.textContent = money(row[1]);
                line.append(name, bar, sum);
                rows.appendChild(line);
            });
            card.append(title, rows);
            return add(card);
        }
        function operationCard(op) {
            var card = document.createElement("div");
            card.className = "card";
            card.innerHTML = '<div class="op"><span class="icon"></span><div class="what"><strong></strong><span></span></div><span class="sum"></span></div>' +
                '<div class="card-actions"><button class="skip" type="button"></button><button class="save" type="button"></button></div><p class="done"></p>';
            card.querySelector(".icon").textContent = op.icon;
            card.querySelector(".what strong").textContent = op.title;
            card.querySelector(".what span").textContent = op.sub;
            card.querySelector(".sum").textContent = op.sum;
            card.querySelector(".save").textContent = op.save;
            card.querySelector(".skip").textContent = op.skip;
            card.querySelector(".done").textContent = op.done;
            card.querySelector(".save").addEventListener("click", function () {
                card.classList.add("saved");
                if (window.dibslyPlay) window.dibslyPlay(hero, "celebrate", "idle");
                wait(500).then(function () { bubble(op.thanks, "dibsly"); });
            });
            card.querySelector(".skip").addEventListener("click", function () { card.remove(); });
            return add(card);
        }
        function setChips(disabled) {
            all(".chip", chips).forEach(function (chip) { chip.disabled = disabled; });
            again.hidden = asked < script.length;
        }
        function ask(index) {
            if (busy) return;
            busy = true;
            var item = script[index];
            setChips(true);
            bubble(item.q, "me");
            wait(250).then(function () {
                var reply = bubble("•••", "dibsly typing");
                return wait(650).then(function () { reply.classList.remove("typing"); return typeInto(reply, item.a); });
            }).then(function () {
                if (item.bars) barsCard(item.bars);
                if (item.op) operationCard(item.op);
                if (window.dibslyPlay) window.dibslyPlay(hero, item.mood || "idle", "idle");
                asked += 1;
                all(".chip", chips)[index].classList.add("asked");
                busy = false;
                setChips(false);
            });
        }
        script.forEach(function (item, index) {
            var chip = document.createElement("button");
            chip.type = "button"; chip.className = "chip"; chip.textContent = item.q;
            chip.addEventListener("click", function () { ask(index); });
            chips.appendChild(chip);
        });
        var again = document.createElement("button");
        again.type = "button"; again.className = "chip"; again.textContent = window.DIBSLY_CHAT_AGAIN || "Again"; again.hidden = true;
        again.addEventListener("click", function () {
            list.innerHTML = ""; asked = 0;
            all(".chip", chips).forEach(function (chip) { chip.classList.remove("asked"); });
            again.hidden = true;
            ask(0);
        });
        chips.appendChild(again);
        var started = false;
        if (!("IntersectionObserver" in window)) { ask(0); return; }
        var observer = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting && !started) { started = true; setTimeout(function () { ask(0); }, calm ? 0 : 600); observer.disconnect(); }
        }, { threshold: 0.5 });
        observer.observe(box);
    }
})();
