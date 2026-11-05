// A page's sections' list (.toc in the guides, features and legal pages; owner, 2026-11-05, on the phone: «хедер с
// разделами висит не там, чипсы не листаются, по тапу прыгает»). A tap on a section glides there and puts its title
// just under whatever stays stuck at the top: going down the header slips away and only the row of sections stays,
// going up the header comes back above it. The section being read is marked in the list, and on a phone its chip is
// brought into view in the row. `.stuck` tells the CSS when the row is at the top, so it covers the band behind the
// header (no page showing through above it).
export function attachToc(main) {
  var toc = main && main.querySelector('.toc');
  if (!toc) return function () {};
  var nav = document.querySelector('.nav'),
    calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)'),
    links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]')),
    undo = [],
    pinned = null,
    pinTimer = null,
    frame = 0,
    current = null;
  function on(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    undo.push(function () {
      target.removeEventListener(type, handler, options);
    });
  }
  function behavior() {
    return calm && calm.matches ? 'auto' : 'smooth';
  }
  function byHash(hash) {
    try {
      return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch (error) {
      return null;
    }
  }
  // The title is where the eye lands: a section's own heading, not its padded top.
  function title(element) {
    if (/^H[1-6]$/.test(element.tagName)) return element;
    return element.querySelector(':scope > h2, :scope > h3') || element;
  }
  var sections = links
    .map(function (link) {
      var target = byHash(link.getAttribute('href'));
      return target && { link: link, target: title(target) };
    })
    .filter(Boolean);
  function row() {
    return getComputedStyle(toc).flexDirection === 'row';
  }
  // How far below the screen's top the header ends while it is shown (the row of sections sits right there).
  function navSpace() {
    if (row()) return parseFloat(getComputedStyle(toc).getPropertyValue('--toc-top')) || 0;
    return nav ? nav.offsetTop + nav.offsetHeight : 0;
  }
  function rowHeight() {
    return row() ? toc.offsetHeight : 0;
  }
  function stuckTop() {
    return parseFloat(getComputedStyle(toc).top) || 0;
  }

  // ---------------------------------------------------------------- the section being read
  function show(link) {
    if (link === current) return;
    if (current) {
      current.classList.remove('on');
      current.removeAttribute('aria-current');
    }
    current = link;
    if (!link) return;
    link.classList.add('on');
    link.setAttribute('aria-current', 'location');
    // Never link.scrollIntoView: Safari would move the page as well.
    if (row()) {
      var left = link.offsetLeft - (toc.clientWidth - link.offsetWidth) / 2;
      toc.scrollTo({ left: Math.max(0, left), behavior: behavior() });
    } else if (
      // The side list moves only when the section is out of its view (not from under the pointer that chose it).
      link.offsetTop < toc.scrollTop ||
      link.offsetTop + link.offsetHeight > toc.scrollTop + toc.clientHeight
    ) {
      var top = link.offsetTop - (toc.clientHeight - link.offsetHeight) / 2;
      toc.scrollTo({ top: Math.max(0, top), behavior: behavior() });
    }
  }
  function spy() {
    frame = 0;
    var box = toc.getBoundingClientRect();
    toc.classList.toggle('stuck', row() && box.top <= stuckTop() + 1);
    if (pinned) return;
    var line = (row() ? box.bottom : navSpace()) + 32,
      reading = null;
    sections.forEach(function (section) {
      if (section.target.getBoundingClientRect().top <= line) reading = section.link;
    });
    show(reading);
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(spy);
  }

  // ---------------------------------------------------------------- a tap on a section (or any link inside the page)
  function release() {
    clearTimeout(pinTimer);
    pinTimer = setTimeout(function () {
      pinned = null;
    }, 180);
  }
  on(main, 'click', function (event) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var link = event.target.closest && event.target.closest('a[href^="#"]');
    if (!link || !main.contains(link)) return;
    var hash = link.getAttribute('href'),
      element = hash.length > 1 && byHash(hash);
    if (!element) return;
    event.preventDefault();
    var heading = title(element),
      top = heading.getBoundingClientRect().top + window.scrollY,
      gap = 20,
      // Going down past the first screen the header slips away (nav-menu.js), so only the row stays above the title;
      // going up the header comes back above the row.
      down = top - rowHeight() - gap,
      y = down > window.scrollY && down > 120 ? down : top - navSpace() - rowHeight() - gap;
    y = Math.max(0, Math.min(y, document.documentElement.scrollHeight - window.innerHeight));
    var section = sections.find(function (item) {
      return item.target === heading;
    });
    if (section) {
      pinned = section.link;
      show(section.link);
      release();
    }
    if (history.replaceState) history.replaceState(null, '', hash);
    window.scrollTo({ top: y, behavior: behavior() });
  });
  on(
    window,
    'scroll',
    function () {
      if (pinned) release();
      schedule();
    },
    { passive: true }
  );
  on(window, 'resize', schedule, { passive: true });
  schedule();
  return function () {
    undo.forEach(function (step) {
      step();
    });
    cancelAnimationFrame(frame);
    clearTimeout(pinTimer);
  };
}
