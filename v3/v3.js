// dibslyapp.com landing 3.0 (2026-10-28, owner: «пиздатые анимации, что у примеров… чтоб когда пользователи зашли на
// сайт, они ахуели»): a WebGL field of grey particles with a few orange sparks, like the app's grain (owner: «согласен»), behind the page that follows the mouse and the scroll, a short
// counting intro, smooth scrolling, titles that rise in word by word, the hero's phone that stays and shows the app step
// by step (owner's brother's idea), a pinned horizontal gallery, cards that tilt under the cursor and magnetic buttons. With «reduce motion», on a missing library or without WebGL, the page is simply there.
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

    // ---------------------------------------------------------------- the phone level with the hero's kicker (wide screens)
    function alignStage() {
        var kicker = document.querySelector(".hero .kicker"), sticky = document.querySelector(".stage-sticky");
        if (!kicker || !sticky) return;
        var wide = window.innerWidth > 1080;
        sticky.classList.toggle("aligned", wide);
        if (!wide) return;
        var top = 0;
        for (var node = kicker; node; node = node.offsetParent) top += node.offsetTop;
        sticky.style.setProperty("--stage-top", top + "px");
    }
    alignStage();
    window.addEventListener("resize", alignStage);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignStage);

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
        var start = performance.now();
        function loop() {
            if (!running) return;
            var now = performance.now();
            uniforms.uTime.value = (now - start) / 1000;
            mouse.x += (mouse.tx - mouse.x) * 0.06;
            mouse.y += (mouse.ty - mouse.y) * 0.06;
            uniforms.uMouse.value.set(mouse.x, mouse.y);
            uniforms.uSpread.value += (state.spread - uniforms.uSpread.value) * 0.08;
            uniforms.uFade.value += (state.fade - uniforms.uFade.value) * 0.08;
            group.rotation.y += 0.00035;
            group.rotation.x = 0.42 + mouse.y * 0.12;
            group.rotation.z = mouse.x * 0.08;
            group.position.x += (state.shiftX - group.position.x) * 0.05;
            camera.position.z += (state.zoom - camera.position.z) * 0.05;
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
    ScrollTrigger.create({ trigger: "#auto", start: "top bottom", endTrigger: "#price", end: "bottom top",
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
    gsap.to(".hero-copy", { yPercent: -10, opacity: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "40% top", end: "bottom top", scrub: true } });
    gsap.to(".scroll-hint", { opacity: 0, scrollTrigger: { trigger: ".hero", start: "5% top", end: "20% top", scrub: true } });

    // ---------------------------------------------------------------- the marquee leans with the scroll's speed
    var track = document.querySelector(".marquee-track");
    if (track) {
        var skew = gsap.quickTo(track, "skewX", { duration: 0.6, ease: "power3.out" });
        ScrollTrigger.create({ trigger: ".marquee", start: "top bottom", end: "bottom top",
            onUpdate: function (self) { skew(Math.max(-10, Math.min(10, self.getVelocity() / -300))); } });
    }

    // ---------------------------------------------------------------- 08: the gallery scrolls sideways while pinned
    var mm = gsap.matchMedia();
    mm.add("(min-width: 1081px)", function () {
        var trackEl = document.querySelector(".gallery-track");
        var distance = function () { return Math.max(0, trackEl.scrollWidth - window.innerWidth); };
        gsap.to(trackEl, { x: function () { return -distance(); }, ease: "none",
            scrollTrigger: { trigger: ".gallery-pin", start: "center center", end: function () { return "+=" + distance(); }, pin: ".gallery", pinSpacing: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
        all(".shot .phone").forEach(function (phone, index) {
            gsap.from(phone, { rotate: index % 2 ? 6 : -6, y: 60, opacity: 0.2, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".gallery-pin", start: "top 80%" }, delay: index * 0.06 });
        });
    });
    mm.add("(max-width: 1080px)", function () {
        var pin = document.querySelector(".gallery-pin");
        pin.style.overflowX = "auto";
        pin.style.scrollSnapType = "x mandatory";
        all(".shot").forEach(function (shot) { shot.style.scrollSnapAlign = "center"; });
    });

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
            cursor.classList.toggle("hover", !!event.target.closest("a, button, summary, .spot, .shot"));
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
        all(".frame", screen).forEach(function (frame) { frames[frame.getAttribute("data-frame")] = frame; });
        var layers = Object.keys(frames).map(function (name) { return frames[name]; });
        var fx = {};
        ["banner", "cover", "hl", "tap", "app-toast"].forEach(function (name) { fx[name] = screen.querySelector(".fx ." + name); });
        var current = live, timeline = null, loop = null, depth = 1, playing = null;

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

        // Shows a screen over the one in front: "fade", "cut", "push" (a page from the right) or "sheet" (from below).
        function show(tl, name, how, at) {
            var next = frames[name], last = current;
            if (!next || next === last) return;
            current = next;
            depth += 1;
            tl.set(next, { zIndex: depth, xPercent: 0, yPercent: 0 }, at);
            if (how === "push") {
                tl.fromTo(next, { xPercent: 100, opacity: 1 }, { xPercent: 0, duration: 0.6, ease: "power3.inOut" }, at)
                    .to(last, { xPercent: -28, opacity: 0.4, duration: 0.6, ease: "power3.inOut" }, "<");
            } else if (how === "sheet") {
                tl.fromTo(next, { yPercent: 100, opacity: 1 }, { yPercent: 0, duration: 0.6, ease: "power3.out" }, at);
            } else {
                tl.fromTo(next, { opacity: 0 }, { opacity: 1, duration: how === "cut" ? 0.01 : 0.32, ease: "none" }, at);
            }
            tl.set(last, { opacity: 0, xPercent: 0, yPercent: 0 });
        }
        function tap(tl, px, py, at) {
            tl.set(fx.tap, { left: x(px), top: y(py), scale: 0.5, opacity: 0 }, at)
                .to(fx.tap, { scale: 1, opacity: 1, duration: 0.14, ease: "power2.out" }, at)
                .to(fx.tap, { scale: 1.6, opacity: 0, duration: 0.45, ease: "power2.out" }, ">");
        }
        function mark(tl, px, py, width, height, at, hold) {
            tl.set(fx.hl, { left: x(px), top: y(py), width: x(width), height: y(height), scale: 1.08, opacity: 0 }, at)
                .to(fx.hl, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" }, at)
                .to(fx.hl, { opacity: 0, duration: 0.4 }, at + (hold || 1.6));
        }
        // Back to a still screen: what a cut-short scene left half way is put straight.
        function settle() {
            if (timeline) timeline.kill();
            layers.forEach(function (layer) {
                gsap.set(layer, layer === current ? { opacity: 1, xPercent: 0, yPercent: 0 } : { opacity: 0, xPercent: 0, yPercent: 0 });
            });
            gsap.set([fx.banner, fx.hl, fx.tap, fx["app-toast"], fx.cover], { opacity: 0 });
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
                    tl.to(strip, { y: 0, duration: 0.8, ease: "power2.inOut" }, 0);
                    show(tl, "a-main", "fade", 0.8);
                } else {
                    show(tl, "a-main", "fade", 0);
                }
                tl.fromTo(fx.banner, { yPercent: -160, opacity: 1 }, { yPercent: 0, duration: 0.7, ease: "back.out(1.4)" }, 1.2);
                mark(tl, 8, 545, 386, 46, 2.0, 1.6);
                tl.to(fx.banner, { yPercent: -160, duration: 0.5, ease: "power2.in" }, 3.0);
                tap(tl, 359, 568, 3.6);
                show(tl, "a-after", "fade", 3.8);
                mark(tl, 146, 418, 104, 46, 4.3, 1.8);
            },
            // «+» → «Операція» → 8, 5 → «Вибери категорію» → «Кафе й ресторани»: saved.
            plus: function (tl) {
                show(tl, "a-after", "fade", 0);
                tap(tl, 348, 800, 0.6);
                show(tl, "b-plus", "fade", 0.75);
                tap(tl, 200, 602, 1.7);
                show(tl, "b-form", "sheet", 1.85);
                tap(tl, 131, 685, 2.9);
                show(tl, "b-8", "cut", 3.0);
                tap(tl, 131, 633, 3.45);
                show(tl, "b-85", "cut", 3.55);
                tap(tl, 201, 805, 4.4);
                show(tl, "b-cats", "sheet", 4.55);
                tap(tl, 71, 272, 5.7);
                show(tl, "b-after", "fade", 5.85);
                tl.fromTo(fx["app-toast"], { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "back.out(1.6)" }, 6.1)
                    .to(fx["app-toast"], { opacity: 0, yPercent: 30, duration: 0.4 }, 8.6);
                mark(tl, 146, 418, 104, 46, 6.4, 1.8);
            },
            // The chat rises as a sheet and its answer comes in part by part.
            ask: function (tl) {
                tl.set(fx.cover, { top: y(250), height: y(485), opacity: 1 }, 0);
                show(tl, "c-chat", "sheet", 0);
                [[332, 1.1], [385, 1.9], [582, 2.6], [655, 3.4], [735, 4.0]].forEach(function (step) {
                    var top = step[0];
                    tl.to(fx.cover, { top: y(top), height: y(735 - top), duration: 0.45, ease: "power2.out" }, step[1]);
                });
                tl.set(fx.cover, { opacity: 0 });
                mark(tl, 16, 395, 370, 186, 4.6, 2.2);
            },
            // The plan with what went over it, then the goals with when they come.
            plan: function (tl) {
                show(tl, "c-plan", "push", 0);
                mark(tl, 34, 375, 248, 116, 0.9, 2.0);
                show(tl, "c-goals", "push", 3.3);
                mark(tl, 66, 337, 254, 30, 4.2, 2.2);
            },
            invest: function (tl) {
                show(tl, "c-invest", "push", 0);
                mark(tl, 12, 196, 366, 32, 0.9, 2.4);
            },
            // Back on Main, down to «Борги» and «Кредити».
            money: function (tl) {
                stopLoop();
                tl.set(strip, { y: function () { return -travel() + 260; } }, 0);
                show(tl, "live", "fade", 0);
                tl.to(strip, { y: function () { return -travel(); }, duration: 1.4, ease: "power2.inOut" }, 0.4);
            },
            fop: function (tl) {
                show(tl, "c-fop", "push", 0);
                mark(tl, 10, 116, 300, 104, 0.9, 2.0);
                mark(tl, 22, 416, 360, 46, 3.2, 2.0);
            }
        };

        function play(name) {
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
