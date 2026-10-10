/* The stage: everything on the page that moves with you.
 *
 * 1. Chapters. On a wide screen each section is a full-screen page. As the
 *    next one slides up over it, it sinks back: moves down a little, shrinks
 *    and dims. Only transform and opacity change, so layout never moves and
 *    menu jumps land exactly where they should.
 * 2. The monogram. In the hero it turns towards the pointer and drifts with
 *    it, and a highlight runs across its face. Rulers on the hero's edges and
 *    a readout measure where the pointer is.
 * 3. The work frame tips up into place as it scrolls in, and the rule under
 *    the process steps fills as that chapter goes by.
 * 4. The header: clear while the hero is at the top, light or dark to match
 *    the chapter under it, the current chapter marked in the menu, and a
 *    hairline showing how far down you are.
 * 5. The hero headline is sized so its longer line exactly fills the width.
 *
 * Nothing runs under prefers-reduced-motion except the menu marker and the
 * progress line, which only report where you are. Without this script every
 * chapter is an ordinary section and the monogram stands still.
 */
(function () {
  "use strict";

  var root = document.documentElement;
  var header = document.querySelector(".header");
  var bar = document.querySelector(".progress span");
  var hero = document.querySelector(".hero");
  var chapters = Array.prototype.slice.call(document.querySelectorAll(".chapter"));
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  /* Same width as the chapter layout in style.css (60rem). */
  var wide = window.matchMedia("(min-width: 60rem) and (min-height: 34rem)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  /* ---------- Measurements ----------
     Read on load and resize, never during a scroll frame, so scrolling only
     ever writes styles. */

  var vh = window.innerHeight;
  var docMax = 1;
  var boxes = [];
  var themed = Array.prototype.slice.call(document.querySelectorAll("main > [data-theme], footer[data-theme]"));
  var themes = [];
  var headerH = 0;
  var frame = document.querySelector(".frame");
  var frameTop = 0;
  var steps = document.querySelector("[data-progress]");
  var stepsBox = { top: 0, height: 1 };

  function pageTop(el) {
    var top = 0;
    while (el) {
      top += el.offsetTop;
      el = el.offsetParent;
    }
    return top;
  }

  function measure() {
    vh = window.innerHeight;
    docMax = Math.max(1, document.documentElement.scrollHeight - vh);
    boxes = chapters.map(function (el) {
      var top = pageTop(el);
      var anchor = el.querySelector("[id]");
      return {
        el: el,
        inner: el.querySelector(".chapter-inner"),
        top: top,
        bottom: top + el.offsetHeight,
        id: anchor && anchor.id !== "hero-title" ? anchor.id : null,
      };
    });
    themes = themed.map(function (el) {
      return { top: pageTop(el), theme: el.getAttribute("data-theme") };
    });
    headerH = header ? header.offsetHeight : 0;
    if (frame) frameTop = pageTop(frame.parentNode);
    if (steps) stepsBox = { top: pageTop(steps), height: steps.offsetHeight };
  }

  /* ---------- The headline, fitted ----------
     Measure each line at its natural width, then scale the font so the
     longer one fills the column. Capped by the window height so a short
     laptop window still shows the call to action. Phones keep the CSS size
     and let the words wrap. */

  var title = document.querySelector(".hero-title");
  var fitWide = window.matchMedia("(min-width: 60rem)");

  function fit() {
    if (!title) return;
    title.style.fontSize = "";
    if (!fitWide.matches) return;
    var lines = title.querySelectorAll(".line-in");
    var base = parseFloat(window.getComputedStyle(title).fontSize);
    var widest = 0;
    title.classList.add("is-measuring");
    for (var i = 0; i < lines.length; i++) {
      widest = Math.max(widest, lines[i].getBoundingClientRect().width);
    }
    title.classList.remove("is-measuring");
    if (!widest) return;
    var size = (base * title.clientWidth) / widest;
    size = Math.min(size * 0.995, window.innerHeight * 0.16, 200);
    title.style.fontSize = size.toFixed(2) + "px";
  }

  /* ---------- Scroll ---------- */

  var stacking = false;
  var heroStage = hero && hero.querySelector(".hero-stage");
  var current = null;

  function setStacking(on) {
    stacking = on;
    root.classList.toggle("stacking", on);
    if (!on) {
      boxes.forEach(function (b) {
        if (b.inner) {
          b.inner.style.transform = "";
          b.inner.style.opacity = "";
        }
      });
      if (heroStage) heroStage.style.transform = "";
      if (frame) frame.style.transform = "";
      if (steps) steps.style.removeProperty("--p");
    }
  }

  function onScroll() {
    var y = window.scrollY;

    if (header) {
      header.classList.toggle("at-top", y < 8);
      /* Take the theme of whatever is under the middle of the header. */
      var under = y + headerH / 2;
      var theme = "light";
      for (var t = 0; t < themes.length; t++) {
        if (themes[t].top <= under) theme = themes[t].theme;
      }
      if (header.getAttribute("data-theme") !== theme) header.setAttribute("data-theme", theme);
    }
    if (bar) bar.style.transform = "scaleX(" + clamp(y / docMax, 0, 1).toFixed(4) + ")";

    /* The chapter under the top third of the window is the current one. */
    var mark = y + vh * 0.35;
    var here = null;
    for (var i = 0; i < boxes.length; i++) {
      if (boxes[i].top <= mark) here = boxes[i].id;
    }
    if (here !== current) {
      current = here;
      links.forEach(function (a) {
        a.classList.toggle("is-current", a.getAttribute("href") === "#" + here);
      });
    }

    if (!stacking) return;

    /* A chapter sinks once the next one covers its bottom quarter (the hero
       from the first pixel). It starts late on purpose: landing on a chapter
       from the menu must find it still, not half gone. */
    for (var j = 0; j < boxes.length - 1; j++) {
      var b = boxes[j];
      if (!b.inner) continue;
      var nextTop = b.bottom - y;
      var start = j === 0 ? vh : vh * 0.75;
      var p = clamp((start - nextTop) / start, 0, 1);
      if (p === b.p) continue;
      b.p = p;
      if (p === 0) {
        b.inner.style.transform = "";
        b.inner.style.opacity = "";
      } else {
        b.inner.style.transform =
          "translate3d(0," + (p * vh * 0.35).toFixed(1) + "px,0) scale(" + (1 - p * 0.06).toFixed(4) + ")";
        b.inner.style.opacity = (1 - p * 0.65).toFixed(3);
      }
      if (j === 0 && heroStage) {
        heroStage.style.transform = "translate3d(0," + (p * vh * 0.2).toFixed(1) + "px,0)";
      }
    }

    if (frame) {
      var f = clamp((y + vh - frameTop) / (vh * 0.7), 0, 1);
      var ease = 1 - Math.pow(1 - f, 3);
      frame.style.transform =
        "rotateX(" + ((1 - ease) * 22).toFixed(2) + "deg) scale(" + (0.92 + ease * 0.08).toFixed(4) + ")";
    }

    if (steps) {
      var s = clamp((y + vh * 0.75 - stepsBox.top) / (stepsBox.height * 0.8), 0, 1);
      steps.style.setProperty("--p", s.toFixed(3));
    }
  }

  var ticking = false;
  function requestScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      onScroll();
    });
  }

  function refresh() {
    fit();
    measure();
    setStacking(wide.matches && !reduced.matches);
    boxes.forEach(function (b) {
      b.p = -1;
    });
    onScroll();
  }

  /* ---------- The monogram and the rulers ---------- */

  var mark = hero && hero.querySelector(".mark-body");
  var auras = hero ? Array.prototype.slice.call(hero.querySelectorAll(".aura i")) : [];
  var sheen = hero && hero.querySelector(".mark-sheen");
  var glow = hero && hero.querySelector(".mark-glow");
  var rulerX = hero && hero.querySelector(".ruler--x i");
  var rulerY = hero && hero.querySelector(".ruler--y i");
  var readX = hero && hero.querySelector('[data-readout="x"]');
  var readY = hero && hero.querySelector('[data-readout="y"]');

  /* Rest pose: turned a little, so the thickness shows before you move. */
  var rest = { rx: 8, ry: -20, tx: 0, ty: 0, sheen: 70 };
  var pose = { rx: rest.rx, ry: rest.ry, tx: 0, ty: 0, sheen: rest.sheen };
  var goal = { rx: rest.rx, ry: rest.ry, tx: 0, ty: 0, sheen: rest.sheen };
  var spinning = false;

  function pad(n) {
    n = Math.max(0, Math.round(n));
    return ("0000" + n).slice(-4);
  }

  function step() {
    var settled = true;
    for (var k in goal) {
      var d = goal[k] - pose[k];
      if (Math.abs(d) > 0.01) settled = false;
      /* Ease towards the pointer rather than snapping to it: weight. */
      pose[k] += d * 0.075;
    }
    mark.style.transform =
      "translate3d(" + pose.tx.toFixed(2) + "px," + pose.ty.toFixed(2) + "px,0) " +
      "rotateX(" + pose.rx.toFixed(2) + "deg) rotateY(" + pose.ry.toFixed(2) + "deg)";
    if (sheen) sheen.style.setProperty("--sheen", pose.sheen.toFixed(2) + "%");
    if (glow) glow.style.transform = "translate3d(" + (-pose.tx * 0.6).toFixed(2) + "px," + (-pose.ty * 0.6).toFixed(2) + "px,0)";
    /* The light in the room drifts the other way, each pool at its own
       depth: the far ones move least. */
    for (var a = 0; a < auras.length; a++) {
      var depth = [-1.6, 1.1, -0.7][a] || 0;
      auras[a].style.transform = "translate3d(" + (pose.tx * depth).toFixed(1) + "px," + (pose.ty * depth).toFixed(1) + "px,0)";
    }
    if (settled) {
      spinning = false;
      return;
    }
    window.requestAnimationFrame(step);
  }

  function spin() {
    if (spinning) return;
    spinning = true;
    window.requestAnimationFrame(step);
  }

  function onPointer(event) {
    if (event.pointerType === "touch") return;
    if (window.scrollY > vh) return;
    var w = window.innerWidth;
    var nx = (event.clientX / w) * 2 - 1;
    var ny = (event.clientY / vh) * 2 - 1;
    goal.ry = rest.ry * 0.35 + nx * 30;
    goal.rx = rest.rx * 0.5 - ny * 16;
    goal.tx = nx * 28;
    goal.ty = ny * 18;
    goal.sheen = 85 - (nx + 1) * 35;
    spin();

    if (rulerX && rulerY) {
      /* Measured from the rulers' own zero: the hero's left edge, and the
         line under the header. */
      var x = event.clientX - rulerX.parentNode.getBoundingClientRect().left;
      var yy = event.clientY - rulerY.parentNode.getBoundingClientRect().top;
      rulerX.style.transform = "translateX(" + x.toFixed(0) + "px)";
      rulerY.style.transform = "translateY(" + yy.toFixed(0) + "px)";
      if (readX) readX.textContent = pad(x);
      if (readY) readY.textContent = pad(yy);
      hero.classList.toggle("measuring", yy >= 0);
    }
  }

  function onLeave() {
    goal.rx = rest.rx;
    goal.ry = rest.ry;
    goal.tx = 0;
    goal.ty = 0;
    goal.sheen = rest.sheen;
    spin();
    if (hero) hero.classList.remove("measuring");
  }

  var following = false;
  function setFollow() {
    var on = !!mark && finePointer.matches && !reduced.matches;
    if (on === following) return;
    following = on;
    if (on) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    } else {
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (mark) mark.style.transform = "";
      if (glow) glow.style.transform = "";
      auras.forEach(function (el) {
        el.style.transform = "";
      });
      if (hero) hero.classList.remove("measuring");
    }
  }

  /* ---------- Wiring ---------- */

  function listen(mq, fn) {
    if (mq.addEventListener) mq.addEventListener("change", fn);
    else if (mq.addListener) mq.addListener(fn);
  }

  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", function () {
    window.requestAnimationFrame(refresh);
  });
  listen(wide, refresh);
  listen(reduced, function () {
    refresh();
    setFollow();
  });
  listen(finePointer, setFollow);

  /* Heights change when fonts arrive, images decode or an FAQ answer opens:
     re-measure so the chapters keep sinking at the right moment. */
  if ("ResizeObserver" in window) {
    var pending = false;
    new ResizeObserver(function () {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(function () {
        pending = false;
        refresh();
      });
    }).observe(document.body);
  }
  window.addEventListener("load", refresh);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);

  refresh();
  setFollow();
})();
