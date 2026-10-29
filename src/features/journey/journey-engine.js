// dibslyapp.com landing 3.0's engine (main's v3/v3.js, 2026-10-28), moved onto the React site (owner, 2026-10-29:
// «просто взять со самого dibslyapp все анимации»). The hero and the steps as there: smooth scrolling, titles that rise
// in word by word, reveals, the hero's phone that stays and plays each step's scene — the journey() below is main's,
// unchanged but for the language, which comes from the page — and the particle field behind it (field.js). On a wide
// screen the phone jumps left and right between steps as on Roma's landing (sides.js; owner, 2026-10-29).
// Left out: the counting intro, the tilt under the cursor, magnetic buttons and the cursor.
import { phoneAt } from './sides.js';
export async function startJourney(root, { lang, reduced }) {
  var html = document.documentElement;
  var small = window.innerWidth < 760;
  function all(selector, scope) {
    return Array.prototype.slice.call((scope || root).querySelectorAll(selector));
  }

  // With «reduce motion» the page is simply there and the rail still marks the step on screen.
  if (reduced) {
    html.classList.add('no-motion');
    var items = all('.rail li');
    var seen = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          items.forEach(function (item) {
            item.classList.toggle('on', item.getAttribute('data-for') === entry.target.id);
          });
        });
      },
      { rootMargin: '-55% 0px -45% 0px' }
    );
    all('[data-section]').forEach(function (section) {
      seen.observe(section);
    });
    return function () {
      seen.disconnect();
      html.classList.remove('no-motion');
    };
  }
  html.classList.remove('no-motion');
  var loaded = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    import('lenis'),
    import('three'),
    import('./field.js'),
  ]);
  var gsap = loaded[0].gsap,
    ScrollTrigger = loaded[1].ScrollTrigger,
    Lenis = loaded[2].default;
  gsap.registerPlugin(ScrollTrigger);
  var lenis = null,
    undo = [],
    field = loaded[4].startField(loaded[3], document.querySelector('.field'), small);
  if (field) undo.push(field.destroy);
  // The journey line cuts a hole for the phone: it redraws whenever the phone moves without a scroll.
  function moved() {
    window.dispatchEvent(new Event('dibsly:phone'));
  }
  function listen(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    undo.push(function () {
      target.removeEventListener(type, handler, options);
    });
  }

  var context = gsap.context(function () {
    // ------------------------------------------------------------ smooth scroll
    // Wide screens only: on phones and tablets the steps snap (below), which a smoothed scroll would fight.
    if (window.innerWidth > 1080) {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      var raf = function (time) {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      // The header's sheet (nav-menu.js) holds the page still while it is open.
      listen(document, 'dibsly:nav', function (event) {
        if (event.detail.open) lenis.stop();
        else lenis.start();
      });
      undo.push(function () {
        gsap.ticker.remove(raf);
        gsap.ticker.lagSmoothing(500, 33);
      });
      Array.prototype.slice
        .call(document.querySelectorAll('a[href^="#"]'))
        .forEach(function (link) {
          listen(link, 'click', function (event) {
            var target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            event.preventDefault();
            lenis.scrollTo(target, { offset: -20 });
          });
        });
    }

    // ------------------------------------------------------------ the hero comes in (no tilt: Roma's frame stands)
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    // The page comes prerendered with these hidden (journey.css): nothing shows in its layout place first and then
    // jumps (owner, 2026-10-29: the phone flashed further left on a reload, «как будто 25-й кадр»).
    tl.fromTo('.hero .kicker', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1 })
      .fromTo(
        '.hero-title .word',
        // y as well: GSAP reads the CSS translateY(115%) that hides them as y in pixels (the words stayed down).
        { yPercent: 115, y: 0, rotate: 4 },
        { yPercent: 0, y: 0, rotate: 0, duration: 1.4, stagger: 0.07 },
        '-=0.7'
      )
      .to('.hero .fade-up', { y: 0, opacity: 1, duration: 1.2, stagger: 0.1 }, '-=1.0')
      .fromTo(
        '.hero-phone',
        { y: 160, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.8, onUpdate: moved },
        '-=1.5'
      );

    // ------------------------------------------------------------ the field follows the page
    if (field) {
      ScrollTrigger.create({
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: function (self) {
          field.spread = self.progress * 0.9;
          field.zoom = 9 + self.progress * 3;
        },
      });
      ScrollTrigger.create({
        trigger: root.querySelector('.step'),
        start: 'top bottom',
        // The price and the finale are outside this component: elements, not selectors (the context scopes those).
        endTrigger: document.querySelector('#faq'),
        end: 'bottom top',
        onToggle: function (self) {
          field.fade = self.isActive ? 0.32 : 1;
          field.shiftX = self.isActive ? 0 : small ? 0 : 2.2;
        },
      });
      ScrollTrigger.create({
        trigger: document.querySelector('.finale'),
        start: 'top 80%',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: function (self) {
          field.spread = 0.9 - self.progress * 0.9;
          field.zoom = 12 - self.progress * 4.5;
          field.fade = 0.32 + self.progress * 0.9;
          field.shiftX = 0;
        },
      });
    }

    // ------------------------------------------------------------ titles and reveals
    all('.title').forEach(function (title) {
      gsap.from(title.querySelectorAll('.word'), {
        yPercent: 115,
        rotate: 3,
        duration: 1.3,
        ease: 'expo.out',
        stagger: 0.06,
        scrollTrigger: { trigger: title, start: 'top 85%' },
      });
    });
    all('.kicker').forEach(function (kicker) {
      if (kicker.closest('.hero')) return;
      gsap.from(kicker, {
        x: -24,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: kicker, start: 'top 90%' },
      });
    });
    var showItems = function (items) {
      gsap.to(items, {
        y: 0,
        opacity: 1,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.08,
        overwrite: true,
      });
    };
    ScrollTrigger.batch(all('.reveal'), {
      start: 'top 88%',
      onEnter: showItems,
      onEnterBack: showItems,
    });
    // Opened (or reloaded) further down the page: what is already above the screen is simply there.
    var placed = function () {
      var above = all('.reveal').filter(function (item) {
        return item.getBoundingClientRect().top < window.innerHeight * 0.88;
      });
      if (above.length) showItems(above);
      all('.title').forEach(function (title) {
        if (title.getBoundingClientRect().bottom < 0)
          gsap.set(title.querySelectorAll('.word'), { yPercent: 0, rotate: 0 });
      });
      ScrollTrigger.refresh();
    };

    var heroPhone = root.querySelector('.hero-phone');
    journey(heroPhone.querySelector('.screen'));
    // In the hero the phone stands level with «Особисті фінанси» (owner, 2026-10-28); by the first step it has settled
    // in the middle of the window, where the steps keep it. Never under the nav or past the window's bottom.
    var lift = root.querySelector('.phone-lift');
    var liftOffset = function () {
      if (window.innerWidth <= 1080) return 0;
      var kicker = root.querySelector('.hero .kicker'),
        top = 0;
      for (var node = kicker; node; node = node.offsetParent) top += node.offsetTop;
      var height = heroPhone.offsetHeight,
        centred = (window.innerHeight - height) / 2;
      return Math.max(84 - centred, Math.min(top - centred, centred - 16));
    };
    gsap.fromTo(
      lift,
      { y: liftOffset },
      {
        y: 0,
        ease: 'none',
        immediateRender: true,
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom 30%',
          scrub: 0.6,
          onUpdate: moved,
          invalidateOnRefresh: true,
        },
      }
    );
    gsap.to('.hero-copy', {
      yPercent: -10,
      opacity: 0.2,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: '40% top', end: 'bottom top', scrub: true },
    });
    gsap.to('.scroll-hint', {
      opacity: 0,
      scrollTrigger: { trigger: '.hero', start: '5% top', end: '20% top', scrub: true },
    });

    // ------------------------------------------------------------ left and right, as on Roma's landing
    // On a wide screen the phone jumps between the sides as his did: on a curve, lifted, smaller and turned edgewise
    // on the way (sides.js). The line keeps its own wave. On phones and tablets the phone stays in the middle.
    var magnet = root.querySelector('.phone-magnet'),
      model = null,
      shown = '';
    function measureSides() {
      gsap.set(magnet, { x: 0, y: 0, scale: 1, rotationX: 0, rotationY: 0, rotationZ: 0 });
      shown = '';
      if (window.innerWidth <= 1080) {
        model = null;
        return;
      }
      var phone = heroPhone.getBoundingClientRect();
      model = {
        anchors: [root.querySelector('.hero')].concat(all('.step')).map(function (section) {
          return {
            top: section.getBoundingClientRect().top + window.scrollY,
            side: section.getAttribute('data-side') || 'right',
          };
        }),
        width: window.innerWidth,
        height: window.innerHeight,
        centre: phone.left + phone.width / 2,
      };
      follow();
    }
    function follow() {
      if (!model) return;
      var at = phoneAt(model, window.scrollY),
        key = [at.x, at.y, at.rotationY, at.rotationZ]
          .map(function (value) {
            return value.toFixed(2);
          })
          .join(':');
      if (key === shown) return;
      shown = key;
      moved();
      gsap.set(magnet, {
        x: at.x,
        y: at.y,
        scale: at.scale,
        rotationX: at.rotationX,
        rotationY: at.rotationY,
        rotationZ: at.rotationZ,
        transformPerspective: 1400,
      });
    }
    gsap.ticker.add(follow);
    ScrollTrigger.addEventListener('refresh', measureSides);
    undo.push(function () {
      gsap.ticker.remove(follow);
      ScrollTrigger.removeEventListener('refresh', measureSides);
    });
    measureSides();

    // ------------------------------------------------------------ phones and tablets: words fade under the phone
    // The phone sticks under the header with the steps' words going up behind it. Main hid them with a band of the
    // page's colour; over the particles that was a flat box, so here each step's words fade out as their top comes up
    // to the phone's bottom edge, and back in when one scrolls down again.
    var narrow = gsap.matchMedia();
    narrow.add('(max-width: 1080px)', function () {
      // One flick, one step (owner, 2026-10-29: «быстро листаю и текст быстро пролистывается… когда я листнул, идет
      // пролистывание до следующего скрина»): while the steps are on screen the page snaps to each step's words under
      // the phone (journey.css, html.snap-steps); past them, to the gallery, then it scrolls freely again.
      ScrollTrigger.create({
        trigger: root.querySelector('.journey'),
        start: 'top top',
        // Off well before the gallery's top (not at it): a snap left on there took the sideways swipes of its rows.
        end: 'bottom 50%',
        onToggle: function (self) {
          html.classList.toggle('snap-steps', self.isActive);
        },
        onRefresh: function (self) {
          html.classList.toggle('snap-steps', self.isActive);
        },
      });
      undo.push(function () {
        html.classList.remove('snap-steps');
      });
      var sticky = root.querySelector('.stage-sticky'),
        box = root.querySelector('.journey');
      // Where the stuck phone really ends, measured on the device (owner, 2026-10-29: on his iPhone the phone stood
      // ~28 px lower than the CSS reckoned and covered the words): the sticky stage's top plus the phone's own place
      // in it, without the moves the scripts give it. The words stick under it (journey.css, --phone-bottom).
      var edge = function () {
        var inside =
          heroPhone.getBoundingClientRect().top -
          sticky.getBoundingClientRect().top -
          gsap.getProperty(heroPhone, 'y') -
          gsap.getProperty(lift, 'y');
        return parseFloat(getComputedStyle(sticky).top) + inside + heroPhone.offsetHeight;
      };
      var place = function () {
        box.style.setProperty('--phone-bottom', edge().toFixed(1) + 'px');
      };
      place();
      ScrollTrigger.addEventListener('refresh', place);
      all('.step-copy').forEach(function (copy) {
        gsap.fromTo(
          copy,
          { opacity: 1 },
          {
            opacity: 0,
            ease: 'none',
            // Whole while they sit under the phone, gone once they are behind it.
            scrollTrigger: {
              trigger: copy,
              start: function () {
                return 'top ' + (edge() + 12) + 'px';
              },
              end: function () {
                return 'top ' + (edge() - 24) + 'px';
              },
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      });
      return function () {
        ScrollTrigger.removeEventListener('refresh', place);
        box.style.removeProperty('--phone-bottom');
      };
    });
    undo.push(function () {
      narrow.revert();
    });

    // ------------------------------------------------------------ the rail
    var railItems = all('.rail li');
    all('[data-section]').forEach(function (section) {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: function (self) {
          if (!self.isActive) return;
          railItems.forEach(function (item) {
            item.classList.toggle('on', item.getAttribute('data-for') === section.id);
          });
        },
      });
    });
    // The rail belongs to the steps: past them (the gallery, the price) it steps aside.
    var rail = root.querySelector('.rail');
    ScrollTrigger.create({
      trigger: '.journey',
      start: 'top top',
      end: 'bottom 55%',
      onToggle: function (self) {
        rail.classList.toggle('away', !self.isActive);
      },
      // Opened further down (a reload, a link to the price): no toggle comes, the rail is put aside at once.
      onRefresh: function (self) {
        rail.classList.toggle('away', !self.isActive);
      },
    });

    if (document.readyState === 'complete') placed();
    else listen(window, 'load', placed);
    // The gallery, the price and the fonts change the page's height after the first paint.
    var pending = 0;
    var resize = new ResizeObserver(function () {
      clearTimeout(pending);
      pending = setTimeout(function () {
        ScrollTrigger.refresh();
      }, 200);
    });
    resize.observe(document.body);
    undo.push(function () {
      clearTimeout(pending);
      resize.disconnect();
    });
  }, root);

  // ================================================================ the journey: the hero's phone shows the app
  // Each step on the left plays its scene in the phone when it comes in: the app's own screens from the demo, cut,
  // faded, pushed or raised as a sheet, with a finger's taps, a notification, a highlight and a toast drawn over them.
  // Positions are the screen's points (402 × 874), as on the captures.
  function journey(screen) {
    if (!screen) return null;
    var live = screen.querySelector('.live'),
      strip = screen.querySelector('.screen-long');
    var frames = { live: live };
    // A page whose frames are not there yet (the English ones are shot later) keeps Main scrolling instead.
    var missing = false;
    function lost() {
      if (missing) return;
      missing = true;
      if (playing && playing !== 'hero') play('hero');
    }
    // The frames are a little shorter than the phone's screen: each one goes on below its picture in the colour of
    // its own bottom row (read once it has loaded), so nothing of the screen under it shows at the bottom edge.
    function floor(frame) {
      try {
        var canvas = document.createElement('canvas'),
          width = frame.naturalWidth;
        canvas.width = width;
        canvas.height = 1;
        var context = canvas.getContext('2d');
        context.drawImage(frame, 0, frame.naturalHeight - 1, width, 1, 0, 0, width, 1);
        // The row's background, not what is cut there: of its pixels by brightness, the one a quarter up.
        var row = context.getImageData(0, 0, width, 1).data,
          pixels = [];
        for (var i = 0; i < row.length; i += 4) pixels.push([row[i], row[i + 1], row[i + 2]]);
        pixels.sort(function (a, b) {
          return a[0] + a[1] + a[2] - b[0] - b[1] - b[2];
        });
        frame.style.backgroundColor =
          'rgb(' + pixels[Math.floor(pixels.length / 4)].join(',') + ')';
      } catch (error) {}
    }
    all('.frame', screen).forEach(function (frame) {
      frames[frame.getAttribute('data-frame')] = frame;
      if (frame.complete && !frame.naturalWidth) lost();
      else frame.addEventListener('error', lost);
      if (frame.complete && frame.naturalWidth) floor(frame);
      else
        frame.addEventListener('load', function () {
          floor(frame);
        });
    });
    // Under Main's strip, where it ends above the tab bar, the screen goes on in the strip's own bottom colour, not
    // the phone's (owner: a black band under «Кредити» when Main reached its end).
    function under() {
      floor(strip);
      live.style.backgroundColor = strip.style.backgroundColor;
    }
    if (strip.complete && strip.naturalWidth) under();
    else strip.addEventListener('load', under);
    var layers = Object.keys(frames).map(function (name) {
      return frames[name];
    });
    var fx = {};
    ['banner', 'bank', 'hl', 'tap', 'touch', 'app-toast'].forEach(function (name) {
      fx[name] = screen.querySelector('.fx .' + name);
    });
    var dim = screen.querySelector('.sheet-dim'),
      bar = screen.querySelector('.push-bar');
    // A second still picture over the first: in a scroll, the arriving frame's own bars fade in over the leaving
    // one's (the chat's opaque top bar turns into the translucent one over its scrolled answer, as in iOS).
    var bar2 = bar.cloneNode(false);
    bar.parentNode.insertBefore(bar2, bar.nextSibling);
    var current = live,
      timeline = null,
      loop = null,
      depth = 1,
      playing = null,
      hand = null;
    // Analytics' Flow, Trends and Capital tabs, x in points (their widths follow the language's words).
    var tabs = (screen.getAttribute('data-tabs') || '161,244,337').split(',').map(Number);
    // What sits elsewhere on the English frames (points, measured on the captures); the rest is the same for both:
    // «Борги» on Main's long strip, how far the chat scrolls from its top, its «Нова витрата» card, the left and
    // width of «Нагадати», step 01's two drafts (top, height) and the first one's ✓, the chat's «Зберегти» and its
    // «Збережено» row (y; the English «Activity» title takes two lines, the chat's card sits lower).
    var spot =
      lang === 'en'
        ? {
            debts: 1075.9,
            chat: 106.7,
            card: 416,
            remind: [47, 144],
            row1: [558, 49],
            row2: [612, 50],
            tick: 583,
            save: 559,
            saved: 567,
          }
        : {
            debts: 1075.9,
            chat: 128.7,
            card: 395,
            remind: [31, 162],
            row1: [543, 47],
            row2: [597, 46],
            tick: 565,
            save: 537,
            saved: 545,
          };

    function travel() {
      var tabs = live.querySelector('.ios-tabbar');
      return (
        strip.offsetTop + strip.offsetHeight - (screen.offsetHeight - tabs.offsetHeight * 0.95)
      );
    }
    function startLoop() {
      if (loop) loop.kill();
      gsap.set(strip, { y: 0 });
      loop = gsap.to(strip, {
        y: function () {
          return -travel();
        },
        duration: 26,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        repeatDelay: 1.6,
        delay: 2.4,
      });
    }
    function stopLoop() {
      if (loop) {
        loop.kill();
        loop = null;
      }
    }
    function x(pt) {
      return (pt / 402) * 100 + '%';
    }
    function y(pt) {
      return (pt / 874) * 100 + '%';
    }

    // A screen in a push without the status bar (the top 54 points).
    function barless() {
      return 'inset(' + (54 * screen.offsetWidth) / 402 + 'px 0px 0px 0px)';
    }
    // A rising sheet is cut along its own top edge on its frame (the points measured on the captures, the corners'
    // radius 40), so it rides exactly as it lands: no step when the whole frame comes in (owner: it jumped ~7 px).
    var sheetTops = { 'b-form': 61.5, 'b-cats': 71.5, 'c-chat-top': 61.5, 'h-payment': 61.5 };
    function sheetEdge(name) {
      return function () {
        var pt = screen.offsetWidth / 402,
          top = (sheetTops[name] || 61.5) * pt;
        return 'inset(' + top + 'px 0px 0px 0px round ' + 40 * pt + 'px ' + 40 * pt + 'px 0px 0px)';
      };
    }
    // Shows a screen over the one in front: "fade", "soft" (a slower fade, where a list grows or shrinks), "cut", "push" (a page from the right), "pop" (back: the page
    // leaves to the right), "sheet" (from below) or "drop" (the sheet in front closes down onto the screen).
    // A push or a sheet stays hidden until its moment (no immediate render: a later sheet peeked under the screen).
    function show(tl, name, how, at) {
      var next = frames[name],
        last = current;
      if (!next || next === last) return;
      current = next;
      depth += 1;
      tl.set(next, { zIndex: depth, xPercent: 0, yPercent: 0 }, at);
      if (how === 'push') {
        // As in iOS (owner, 2026-10-28): the status bar stays and only the screens under it slide — both have
        // their own bar cut off while they move, and the arriving frame's bar (the same 09:41 on every frame)
        // stands still over them; once in place, the whole frame.
        depth += 1;
        tl.call(
          function () {
            bar.src = next.getAttribute('src');
          },
          null,
          at
        )
          .set(bar, { zIndex: depth, opacity: 1 }, at)
          .set([next, last], { clipPath: barless }, at)
          .fromTo(
            next,
            { xPercent: 100, opacity: 1 },
            { xPercent: 0, duration: 0.6, ease: 'power3.inOut', immediateRender: false },
            at
          )
          .to(last, { xPercent: -28, opacity: 0.4, duration: 0.6, ease: 'power3.inOut' }, at)
          .set(next, { clipPath: 'none' }, at + 0.6)
          .set(bar, { opacity: 0 }, at + 0.6);
      } else if (how === 'pop') {
        // Back, as in iOS: the page goes off to the right over the one it came from, which slides back in
        // from the left, both under the same still status bar.
        depth += 2;
        tl.call(
          function () {
            bar.src = next.getAttribute('src');
          },
          null,
          at
        )
          .set(last, { zIndex: depth - 1 }, at)
          .set(bar, { zIndex: depth, opacity: 1 }, at)
          .set([next, last], { clipPath: barless }, at)
          .fromTo(
            next,
            { xPercent: -28, opacity: 0.4 },
            {
              xPercent: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power3.inOut',
              immediateRender: false,
            },
            at
          )
          .to(last, { xPercent: 100, duration: 0.6, ease: 'power3.inOut' }, at)
          .set(next, { clipPath: 'none' }, at + 0.6)
          .set(bar, { opacity: 0 }, at + 0.6);
      } else if (how === 'drop') {
        // A sheet closing: it goes down along its own edge, and the screen under it comes out of the dimming.
        depth += 2;
        tl.set(next, { opacity: 1 }, at)
          .set(dim, { zIndex: depth - 1, opacity: 0.5 }, at)
          .set(last, { zIndex: depth, clipPath: sheetEdge(last.getAttribute('data-frame')) }, at)
          .to(last, { yPercent: 100, duration: 0.5, ease: 'power3.in' }, at)
          .to(dim, { opacity: 0, duration: 0.5, ease: 'power1.in' }, at);
      } else if (how === 'sheet') {
        // As in iOS (owner, 2026-10-28): the status bar stays, only the sheet rises — the frame's own bar is cut
        // off while it moves, its top corners rounded — and the screen under it dims (a layer between them that
        // fades out towards the bar); once up, the whole frame.
        depth += 1;
        tl.set(dim, { zIndex: depth - 1, opacity: 0 }, at)
          .set(next, { zIndex: depth, clipPath: sheetEdge(name) }, at)
          .fromTo(
            next,
            { yPercent: 100, opacity: 1 },
            { yPercent: 0, duration: 0.6, ease: 'power3.out', immediateRender: false },
            at
          )
          .to(dim, { opacity: 0.5, duration: 0.6, ease: 'power1.out' }, at)
          .set(next, { clipPath: 'none' }, at + 0.6)
          .set(dim, { opacity: 0 }, at + 0.6);
      } else {
        tl.fromTo(
          next,
          { opacity: 0 },
          {
            opacity: 1,
            duration: how === 'cut' ? 0.14 : how === 'soft' ? 0.8 : 0.5,
            ease: 'power1.inOut',
          },
          at
        );
      }
      tl.set(last, { opacity: 0, xPercent: 0, yPercent: 0, clipPath: 'none' });
    }
    // The «Витрату збережено» toast over the tab bar, its line the scene's own (the .app-toast's data-<scene>).
    function toast(tl, scene, at, until) {
      var box = fx['app-toast'],
        line = box.querySelector('span'),
        text = box.getAttribute('data-' + scene);
      if (text)
        tl.call(
          function () {
            line.textContent = text;
          },
          null,
          at
        );
      tl.fromTo(
        box,
        { yPercent: 60, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.55, ease: 'back.out(1.5)', immediateRender: false },
        at
      ).to(box, { opacity: 0, yPercent: 30, duration: 0.45 }, until);
    }
    // Scrolls a screen to another capture of it: the content between its fixed top and bottom (points) moves up by
    // the distance measured between the two frames; the bars stay still over it and turn from the old frame's into
    // the new one's during the scroll's second two thirds (owner: the chat's black bar jumped to the translucent
    // one at the end); then the whole new frame.
    // Each frame is cut to the part of the band it fills, the cut kept still on the screen while the frame moves.
    function scroll(tl, name, at, distance, top, bottom) {
      var next = frames[name],
        last = current,
        move = { done: 0 };
      if (!next || next === last) return;
      current = next;
      depth += 2;
      function place() {
        var pt = screen.offsetWidth / 402,
          height = next.offsetHeight,
          gone = distance * move.done;
        gsap.set(last, {
          y: -gone * pt,
          clipPath: 'inset(' + (top + gone) * pt + 'px 0px ' + (height - bottom * pt) + 'px 0px)',
        });
        gsap.set(next, {
          y: (distance - gone) * pt,
          clipPath:
            'inset(' +
            top * pt +
            'px 0px ' +
            (height - (bottom - distance + gone) * pt) +
            'px 0px)',
        });
      }
      function bars() {
        var pt = screen.offsetWidth / 402,
          w = bar.offsetWidth + 'px',
          h = bar.offsetHeight + 'px',
          t = top * pt + 'px',
          b = bottom * pt + 'px';
        return (
          'polygon(0px 0px, ' +
          w +
          ' 0px, ' +
          w +
          ' ' +
          t +
          ', 0px ' +
          t +
          ', 0px ' +
          b +
          ', ' +
          w +
          ' ' +
          b +
          ', ' +
          w +
          ' ' +
          h +
          ', 0px ' +
          h +
          ')'
        );
      }
      depth += 1;
      tl.call(
        function () {
          bar.src = last.getAttribute('src');
          bar.style.backgroundColor = last.style.backgroundColor;
          bar2.src = next.getAttribute('src');
          bar2.style.backgroundColor = next.style.backgroundColor;
        },
        null,
        at
      )
        .set(last, { zIndex: depth - 2 }, at)
        .set(next, { zIndex: depth - 3, xPercent: 0, yPercent: 0, opacity: 1 }, at)
        .set(bar, { zIndex: depth - 1, opacity: 1, clipPath: bars }, at)
        .set(bar2, { zIndex: depth, opacity: 0, clipPath: bars }, at)
        .fromTo(
          move,
          { done: 0 },
          {
            done: 1,
            duration: 0.9,
            ease: 'power2.inOut',
            immediateRender: false,
            onStart: place,
            onUpdate: place,
          },
          at
        )
        .to(bar2, { opacity: 1, duration: 0.6, ease: 'power1.inOut' }, at + 0.3)
        .set(next, { y: 0, clipPath: 'none' }, at + 0.9)
        .set([bar, bar2], { opacity: 0, clearProps: 'clipPath' }, at + 0.9)
        .set(last, { opacity: 0, y: 0, clipPath: 'none' }, at + 0.9);
    }
    // The finger comes in a little below its first target, glides from tap to tap, presses (a ring spreads from
    // under it) and lifts away at the end.
    // The ring waits for its moment (no immediate render: the scene's last ring showed from its start).
    function tap(tl, px, py, at) {
      if (!hand) {
        hand = { x: Math.min(370, px + 40), y: Math.min(840, py + 90) };
        tl.set(fx.touch, { left: x(hand.x), top: y(hand.y), scale: 1.25, opacity: 0 }, at - 1.0).to(
          fx.touch,
          { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' },
          at - 1.0
        );
      }
      var glide = Math.min(0.75, 0.35 + Math.hypot(px - hand.x, py - hand.y) / 900);
      tl.to(
        fx.touch,
        { left: x(px), top: y(py), duration: glide, ease: 'power2.inOut' },
        at - glide - 0.06
      )
        .to(fx.touch, { scale: 0.78, duration: 0.1, ease: 'power2.in' }, at)
        .to(fx.touch, { scale: 1, duration: 0.22, ease: 'power2.out' }, at + 0.12)
        .fromTo(
          fx.tap,
          { left: x(px), top: y(py), scale: 0.6, opacity: 0.9 },
          { scale: 1.9, opacity: 0, duration: 0.6, ease: 'power2.out', immediateRender: false },
          at + 0.02
        );
      hand = { x: px, y: py };
    }
    function release(tl, at) {
      if (!hand) return;
      tl.to(fx.touch, { opacity: 0, scale: 1.2, duration: 0.4, ease: 'power2.out' }, at);
      hand = null;
    }
    function mark(tl, px, py, width, height, at, hold) {
      tl.set(
        fx.hl,
        { left: x(px), top: y(py), width: x(width), height: y(height), scale: 1.08, opacity: 0 },
        at
      )
        .to(fx.hl, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' }, at)
        .to(fx.hl, { opacity: 0, duration: 0.4 }, at + (hold || 1.6));
    }
    // Back to a still screen: what a cut-short scene left half way is put straight — its timeline and every tween
    // still running on the screens and the effects are stopped, the notifications, toast, highlight and finger gone.
    function settle() {
      if (timeline) timeline.kill();
      timeline = null;
      var effects = Object.keys(fx)
        .map(function (name) {
          return fx[name];
        })
        .concat([dim, bar, bar2]);
      gsap.killTweensOf(layers.concat(effects));
      // The layers' order starts again from the screen in front: it only ever grew, and after a run through the
      // page the frames rose above the effects (z-index 50), hiding the marks and the finger on the last steps.
      depth = 1;
      layers.forEach(function (layer) {
        gsap.set(layer, {
          opacity: layer === current ? 1 : 0,
          xPercent: 0,
          yPercent: 0,
          y: 0,
          clipPath: 'none',
          zIndex: layer === current ? 1 : 0,
        });
      });
      gsap.set(effects, { opacity: 0, xPercent: 0, yPercent: 0, y: 0, scale: 1 });
      gsap.set([dim, bar, bar2], { zIndex: 0 });
      gsap.set([bar, bar2], { clearProps: 'clipPath' });
      hand = null;
    }

    var scenes = {
      hero: function (tl) {
        show(tl, 'live', 'fade', 0);
        tl.to(strip, { y: 0, duration: 0.9, ease: 'power2.inOut' }, 0);
        tl.call(startLoop, null, 0.9);
      },
      // A purchase with Apple Pay waits in «Активність»; one tap saves it and «Витрачено» grows.
      // «Активність» starts empty (the live Main is a-d0's state, so its first frame comes in unseen); Apple Pay's
      // notification brings a draft, a bank's push a second one; the ✓ on the first saves it: it leaves, the toast
      // says so and «Витрачено» grows (owner, task 17).
      auto: function (tl) {
        if (current === live) {
          tl.to(strip, { y: 0, duration: 0.9, ease: 'power2.inOut' }, 0);
          show(tl, 'a-d0', 'cut', 0.9);
        } else {
          show(tl, 'a-d0', 'fade', 0);
        }
        // The notifications come in from above the screen and leave fading out: a part of one left at the top
        // edge stayed on screen (owner: they «stuck»).
        tl.fromTo(
          fx.banner,
          { yPercent: -160, opacity: 1 },
          { yPercent: 0, duration: 0.8, ease: 'back.out(1.3)', immediateRender: false },
          1.4
        );
        show(tl, 'a-d1', 'soft', 2.3);
        mark(tl, 8, spot.row1[0], 386, spot.row1[1], 3.1, 1.6);
        tl.to(fx.banner, { yPercent: -160, opacity: 0, duration: 0.6, ease: 'power2.in' }, 3.6);
        // Then a bank's own push (Premium, any bank, iOS 27): its purchase is the next draft in «Активність».
        tl.fromTo(
          fx.bank,
          { yPercent: -160, opacity: 1 },
          { yPercent: 0, duration: 0.8, ease: 'back.out(1.3)', immediateRender: false },
          5.1
        );
        show(tl, 'a-d2', 'soft', 6.0);
        mark(tl, 8, spot.row2[0], 386, spot.row2[1], 6.8, 1.6);
        tl.to(fx.bank, { yPercent: -160, opacity: 0, duration: 0.6, ease: 'power2.in' }, 7.3);
        tap(tl, 361, spot.tick, 9.2);
        show(tl, 'a-d2-saved', 'soft', 9.35);
        release(tl, 9.9);
        toast(tl, 'auto', 9.8, 12.2);
        mark(tl, 146, 418, 104, 46, 10.2, 2.0);
      },
      // «+» → «Операція» → 8, 5 → «Вибери категорію» → «Кафе й ресторани»: saved.
      plus: function (tl) {
        show(tl, 'a-d2-saved', 'fade', 0);
        tap(tl, 348, 800, 1.3);
        show(tl, 'b-plus', 'fade', 1.45);
        tap(tl, 200, 602, 2.7);
        show(tl, 'b-form', 'sheet', 2.85);
        tap(tl, 131, 685, 4.2);
        show(tl, 'b-8', 'cut', 4.3);
        tap(tl, 131, 633, 4.95);
        show(tl, 'b-85', 'cut', 5.05);
        tap(tl, 201, 805, 6.1);
        show(tl, 'b-cats', 'sheet', 6.25);
        tap(tl, 71, 272, 7.6);
        show(tl, 'b-after', 'fade', 7.75);
        release(tl, 8.2);
        toast(tl, 'plus', 8.2, 10.8);
        mark(tl, 146, 418, 104, 46, 8.5, 2.0);
      },
      // On Main the finger taps Dibsly's button above «+»; the chat rises as a sheet at its top (what went where, the
      // card marked), then scrolls down to the answer and the expense it is ready to save; «Зберегти» saves it:
      // «✓ Збережено» and «Відмінити» on the card (that frame's chat sits 20 points lower: a slow fade, no jump).
      ask: function (tl) {
        var open = 1.5;
        tl.set(strip, { y: 0 }, 0);
        show(tl, 'live', 'fade', 0);
        tap(tl, 349, 731, 1.3);
        release(tl, 1.8);
        show(tl, 'c-chat-top', 'sheet', open);
        mark(tl, 14, 200, 374, 185, open + 0.9, 1.8);
        scroll(tl, 'c-chat', open + 3.4, spot.chat, 122, 712);
        mark(tl, 16, spot.card, 370, 186, open + 4.6, 2.2);
        tap(tl, 288, spot.save, open + 7.2);
        show(tl, 'c-chat-saved', 'soft', open + 7.35);
        release(tl, 7.9 + open);
        mark(tl, 22, spot.saved - 19, 358, 38, open + 8.2, 2.2);
      },
      // Analytics' four tabs one by one (Categories → Flow → Trends → Capital, the tabs measured on the frames: the
      // screen's data-tabs, as wide as their words).
      analytics: function (tl) {
        show(tl, 'd-analytics', 'push', 0);
        [
          ['d-cashflow', 1.6],
          ['d-trends', 3.0],
          ['d-capital', 4.4],
        ].forEach(function (step, index) {
          tap(tl, tabs[index], 195, step[1]);
          show(tl, step[0], 'cut', step[1] + 0.12);
        });
        release(tl, 4.9);
      },
      // The calendar: the month, then as a list, then a payment (MEGOGO) opened.
      calendar: function (tl) {
        show(tl, 'h-calendar', 'push', 0);
        tap(tl, 306, 84, 1.5);
        show(tl, 'h-calendar-list', 'fade', 1.65);
        tap(tl, 200, 376, 3.2);
        show(tl, 'h-payment', 'sheet', 3.35);
        release(tl, 3.8);
      },
      // The plan with what went over it (the two red tiles, «Підписки» and «Доставка»), then the goals with when
      // they come («Відпустка» first: its «У такому темпі» line).
      plan: function (tl) {
        show(tl, 'c-plan', 'push', 0);
        mark(tl, 22, 388, 170, 110, 0.9, 2.0);
        show(tl, 'c-goals', 'push', 3.3);
        mark(tl, 66, 366, 236, 28, 4.2, 2.2);
      },
      // Savings shared with Настя: the shares, the shared goal, then down to the accounts: whose, and the shared one.
      together: function (tl) {
        show(tl, 'i-savings', 'push', 0);
        mark(tl, 16, 200, 370, 80, 0.9, 1.8);
        mark(tl, 24, 464, 364, 68, 3.1, 1.8);
        scroll(tl, 'i-savings-accounts', 5.3, 383.8, 108, 874);
        mark(tl, 24, 512, 354, 48, 6.4, 1.8);
        mark(tl, 22, 764, 358, 52, 8.6, 1.8);
      },
      // Main scrolls down to «Борги» and «Кредити» (the strip stops where they stand on the frame), one mark each;
      // Саша's debt with «Нагадати», back, then all the credits.
      money: function (tl) {
        stopLoop();
        tl.set(
          strip,
          {
            y: function () {
              return -travel() + 260;
            },
          },
          0
        );
        show(tl, 'live', 'fade', 0);
        tl.to(
          strip,
          {
            y: function () {
              var pt = screen.offsetWidth / 402;
              return (120 - spot.debts) * pt - strip.offsetTop;
            },
            duration: 1.4,
            ease: 'power2.inOut',
          },
          0.4
        );
        show(tl, 'f-main-money', 'fade', 1.8);
        mark(tl, 14, 114, 374, 263, 2.5, 1.4);
        mark(tl, 14, 397, 374, 332, 4.4, 1.4);
        tap(tl, 170, 291, 6.6);
        show(tl, 'f-debt', 'push', 6.75);
        mark(tl, spot.remind[0], 331, spot.remind[1], 60, 7.6, 1.6);
        tap(tl, 38, 84, 10.0);
        show(tl, 'f-main-money', 'pop', 10.15);
        tap(tl, 352, 423, 11.4);
        show(tl, 'f-credits', 'push', 11.55);
        release(tl, 12.0);
      },
      invest: function (tl) {
        show(tl, 'c-invest', 'push', 0);
        // «Загальний результат … +32,67 %» (its line 198–211.5 points on the frames, «Нереалізовано» from 221.5).
        mark(tl, 10, 192, 362, 26, 0.9, 2.4);
      },
      fop: function (tl) {
        show(tl, 'c-fop', 'push', 0);
        // «До сплати … до 19 лист.», then «Найближчі строки»' second row, «ЄП і ВЗ за III кв. 16 290,00 ₴»
        // (between its lines at 374.5 and 419 points on the frames).
        mark(tl, 10, 117, 300, 107, 0.9, 2.0);
        mark(tl, 24, 376, 356, 42, 3.2, 2.0);
      },
    };

    function play(name) {
      if (missing) name = 'hero';
      if (!scenes[name] || name === playing) return;
      playing = name;
      settle();
      if (name !== 'hero') stopLoop();
      timeline = gsap.timeline();
      scenes[name](timeline);
    }
    if (strip.complete) startLoop();
    else strip.addEventListener('load', startLoop);

    // Each step plays its scene as it comes in, and going back up plays the one before.
    var order = all('[data-scene]');
    order.forEach(function (section, index) {
      if (index === 0) return;
      var before = order[index - 1].getAttribute('data-scene');
      var copy = section.querySelector('.step-copy') || section;
      ScrollTrigger.create({
        // One column up to 1080 px (the layout's own break, not main's 760): a scene starts with its words.
        trigger: window.innerWidth <= 1080 ? copy : section,
        start: window.innerWidth <= 1080 ? 'top 88%' : 'top 55%',
        onEnter: function () {
          play(section.getAttribute('data-scene'));
        },
        onLeaveBack: function () {
          play(before);
        },
      });
    });
    return { play: play };
  }

  return function () {
    context.revert();
    if (lenis) lenis.destroy();
    undo.forEach(function (step) {
      step();
    });
  };
}
