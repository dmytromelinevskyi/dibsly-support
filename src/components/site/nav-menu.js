// dibslyapp.com's header behaviour (main's v3/nav.js, 2026-10-29), unchanged but for running on the React page and
// undoing itself: «Можливості» and «Допомога» open their cards on hover, on a click and from the keyboard (↓ ↑ inside,
// ← → between the menu's items, Esc), and close on Esc, a click elsewhere or leaving them. Under 900 px the burger opens
// the whole menu as a sheet: focus stays in it, the page under it does not scroll, Esc, the cross or a chosen item close
// it. The landing hears «dibsly:nav» to pause its smooth scroll while the sheet is open.
export function attachNav(root) {
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var undo = [];
  function on(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    undo.push(function () {
      target.removeEventListener(type, handler, options);
    });
  }
  function all(selector, scope) {
    return Array.prototype.slice.call((scope || root).querySelectorAll(selector));
  }

  // ---------------------------------------------------------------- the groups' cards
  var groups = all('.nav-group');
  function setOpen(group, open) {
    var button = group.querySelector('.nav-top');
    group.classList.toggle('open', open);
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function closeAll(except) {
    groups.forEach(function (group) {
      if (group !== except) setOpen(group, false);
    });
  }
  function items(group) {
    return all('.nav-drop a', group);
  }
  groups.forEach(function (group) {
    var button = group.querySelector('.nav-top'),
      timer = null;
    // A click toggles; a card the pointer has just opened stays (the click pins it rather than closing it).
    on(button, 'click', function () {
      var open = !group.classList.contains('open') || group.getAttribute('data-by') === 'hover';
      group.setAttribute('data-by', 'click');
      closeAll(group);
      setOpen(group, open);
    });
    on(button, 'keydown', function (event) {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      closeAll(group);
      setOpen(group, true);
      var list = items(group);
      void getComputedStyle(group.querySelector('.nav-drop')).visibility; // the card visible before its link is focused
      list[event.key === 'ArrowDown' ? 0 : list.length - 1].focus();
    });
    on(group, 'keydown', function (event) {
      var list = items(group),
        at = list.indexOf(document.activeElement);
      if (event.key === 'Escape' && group.classList.contains('open')) {
        event.preventDefault();
        event.stopPropagation();
        setOpen(group, false);
        button.focus();
      } else if (
        at >= 0 &&
        (event.key === 'ArrowDown' ||
          event.key === 'ArrowUp' ||
          event.key === 'Home' ||
          event.key === 'End')
      ) {
        event.preventDefault();
        var next =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? list.length - 1
              : (at + (event.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length;
        list[next].focus();
      }
    });
    on(group, 'focusout', function (event) {
      if (!group.contains(event.relatedTarget)) setOpen(group, false);
    });
    if (hover) {
      on(group, 'mouseenter', function () {
        clearTimeout(timer);
        if (!group.classList.contains('open')) group.setAttribute('data-by', 'hover');
        closeAll(group);
        setOpen(group, true);
      });
      on(group, 'mouseleave', function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          if (!group.contains(document.activeElement)) setOpen(group, false);
        }, 160);
      });
    }
    items(group).forEach(function (link) {
      on(link, 'click', function () {
        setOpen(group, false);
      });
    });
  });
  on(document, 'click', function (event) {
    groups.forEach(function (group) {
      if (!group.contains(event.target)) setOpen(group, false);
    });
  });
  on(document, 'keydown', function (event) {
    if (event.key === 'Escape') closeAll();
  });
  // ← → between the menu's own items (the two groups' buttons and the two links).
  all('.nav-menu').forEach(function (menu) {
    on(menu, 'keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      var tops = all('.nav-top', menu),
        at = tops.indexOf(document.activeElement);
      if (at < 0) return;
      event.preventDefault();
      closeAll();
      tops[(at + (event.key === 'ArrowRight' ? 1 : -1) + tops.length) % tops.length].focus();
    });
  });
  // A card left open does not ride along when the page scrolls away under it.
  var openedAt = null;
  on(
    window,
    'scroll',
    function () {
      var open = groups.some(function (group) {
        return group.classList.contains('open');
      });
      if (!open) {
        openedAt = null;
        return;
      }
      if (openedAt === null) openedAt = window.scrollY;
      if (Math.abs(window.scrollY - openedAt) > 60) {
        closeAll();
        openedAt = null;
      }
    },
    { passive: true }
  );

  // ---------------------------------------------------------------- hidden going down, back going up
  // As on main (owner, 2026-10-29: «хедер скрытым и показывать когда пользователь вверх проскролил»): the pill slips
  // away while the page goes down past its first screen and comes back as soon as it goes up, or at the top.
  var nav = root.querySelector('.nav'),
    lastY = window.scrollY;
  on(
    window,
    'scroll',
    function () {
      var y = window.scrollY;
      if (Math.abs(y - lastY) < 6) return;
      var open = groups.some(function (group) {
        return group.classList.contains('open');
      });
      // While a phone's steps snap under the stuck phone (html.snap-steps) the header stays away, so the phone can sit
      // at the top of the screen and be larger (owner, 2026-10-29: «скрин телефона побольше»).
      var steps =
        document.documentElement.classList.contains('snap-steps') && y > window.innerHeight * 0.6;
      nav.classList.toggle('hide', !open && ((y > lastY && y > 120) || steps));
      lastY = y;
    },
    { passive: true }
  );

  // ---------------------------------------------------------------- the sheet (under 900 px)
  all('.nav-burger').forEach(function (burger) {
    var sheet = document.getElementById(burger.getAttribute('aria-controls'));
    if (!sheet) return;
    var close = sheet.querySelector('.nav-close'),
      wide = window.matchMedia('(min-width: 900px)');
    function focusable() {
      return all('a[href], button', sheet).filter(function (el) {
        return el.offsetParent !== null || el === close;
      });
    }
    function tell(open) {
      document.dispatchEvent(new CustomEvent('dibsly:nav', { detail: { open: open } }));
    }
    function open() {
      closeAll();
      sheet.hidden = false;
      document.documentElement.classList.add('nav-locked');
      burger.setAttribute('aria-expanded', 'true');
      tell(true);
      if (calm) sheet.classList.add('open');
      else
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            sheet.classList.add('open');
          });
        });
      close.focus({ preventScroll: true });
    }
    function shut(back) {
      if (sheet.hidden) return;
      sheet.classList.remove('open');
      document.documentElement.classList.remove('nav-locked');
      burger.setAttribute('aria-expanded', 'false');
      tell(false);
      if (calm) sheet.hidden = true;
      else
        setTimeout(function () {
          if (!sheet.classList.contains('open')) sheet.hidden = true;
        }, 400);
      if (back) burger.focus({ preventScroll: true });
    }
    on(burger, 'click', open);
    on(close, 'click', function () {
      shut(true);
    });
    on(sheet, 'keydown', function (event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        shut(true);
        return;
      }
      if (event.key !== 'Tab') return;
      var list = focusable(),
        first = list[0],
        last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    // A chosen item closes the sheet before the page goes there (capture: ahead of the landing's smooth scroll).
    on(
      document,
      'click',
      function (event) {
        var link = event.target.closest && event.target.closest('a[href]');
        if (link && sheet.contains(link)) shut(false);
      },
      true
    );
    on(wide, 'change', function () {
      if (wide.matches) shut(false);
    });
    undo.push(function () {
      document.documentElement.classList.remove('nav-locked');
    });
  });
  return function () {
    undo.forEach(function (step) {
      step();
    });
  };
}
