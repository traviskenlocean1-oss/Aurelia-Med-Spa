/* Aurelia Med Spa — shared behaviour for the inner pages (about,
   treatments, gift cards, contact, book). Menu, header, Glow Club rows,
   Book Now pill and footer logic are the home page's, copied as-is. */
(function () {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  window.AURELIA = { reduce: reduce };
  requestAnimationFrame(function () { root.classList.add('is-ready'); });

  /* Smooth scroll, wired into ScrollTrigger */
  if (!reduce) {
    var lenis = window.lenis = new Lenis({ lerp: 0.09 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* Marquee rows (Glow Club): three identical sets so the -33.333% loop is seamless */
  document.querySelectorAll('.mt-move').forEach(function (row) {
    var icon = row.dataset.icon === 'leaf'
      ? '<svg class="leaf-art" data-variant="1" data-stroke="rgba(217,183,126,.85)" viewBox="0 0 492 459" aria-hidden="true"></svg>'
      : '<svg viewBox="0 0 200 200" aria-hidden="true" fill="none" stroke="#D9B77E" stroke-width="1.6"><circle cx="100" cy="100" r="92" stroke-opacity=".55"/><circle cx="100" cy="100" r="78"/><circle cx="100" cy="100" r="30"/>' +
        Array.apply(null, Array(16)).map(function (_, i) { var a = i * Math.PI / 8, c = Math.cos(a), s = Math.sin(a); return '<path d="M' + (100 + c * 38) + ' ' + (100 + s * 38) + 'L' + (100 + c * (i % 2 ? 58 : 68)) + ' ' + (100 + s * (i % 2 ? 58 : 68)) + '"/>'; }).join('') + '</svg>';
    var col = '<div class="mt-col"><div class="t">' + row.dataset.word + '</div>' + icon + '</div>';
    row.innerHTML = new Array(13).join(col);
    row.setAttribute('aria-hidden', 'true');
  });

  /* Line-art leaves (stroke-only botanical branches, drawn in code so
     nothing is copied from the reference) */
  (function () {
    var NS = 'http://www.w3.org/2000/svg';
    function leaf(x, y, ang, len, w) {
      var c = Math.cos(ang), s = Math.sin(ang), px = -s, py = c;
      var tx = x + c * len, ty = y + s * len;
      var a1 = [x + c * len * .3 + px * w, y + s * len * .3 + py * w], a2 = [x + c * len * .75 + px * w * .8, y + s * len * .75 + py * w * .8];
      var b1 = [x + c * len * .75 - px * w * .8, y + s * len * .75 - py * w * .8], b2 = [x + c * len * .3 - px * w, y + s * len * .3 - py * w];
      return 'M' + x + ' ' + y + 'C' + a1 + ' ' + a2 + ' ' + tx + ' ' + ty + 'C' + b1 + ' ' + b2 + ' ' + x + ' ' + y +
             'M' + x + ' ' + y + 'Q' + (x + c * len * .5 + px * w * .12) + ' ' + (y + s * len * .5 + py * w * .12) + ' ' + (tx - c * len * .08) + ' ' + (ty - s * len * .08);
    }
    var V = [
      { stem: 'M-20 860C140 700 300 560 470 420C620 300 720 170 800 20', leaves: [[120,740,-2.2,190,62],[240,630,-.55,170,58],[330,560,-2.4,230,70],[470,430,-.7,210,64],[560,340,-2.1,240,74],[680,230,-.35,190,60],[760,90,-1.9,170,52]] },
      { stem: 'M0 420C120 360 230 300 330 230C400 180 450 120 480 40', leaves: [[70,385,-2.5,150,48],[160,330,-.6,140,46],[250,280,-2.2,170,56],[330,230,-.45,150,50],[400,160,-2,160,52]] },
      { stem: 'M20 260C140 230 260 200 370 150C440 118 490 80 520 30', leaves: [[90,240,-2.3,140,46],[200,215,-.5,150,48],[300,180,-2,160,52],[390,140,-.4,130,44],[470,80,-1.8,120,40]] },
      { stem: 'M480 420C370 360 270 300 180 230C110 175 60 115 30 40', leaves: [[420,385,-.65,150,48],[330,330,-2.5,140,46],[240,280,-.95,170,56],[170,225,-2.7,150,50],[100,160,-1.15,160,52]] }
    ];
    document.querySelectorAll('.leaf-art').forEach(function (svg) {
      var v = V[+svg.dataset.variant];
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', v.stem + v.leaves.map(function (l) { return leaf.apply(null, l); }).join(''));
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', svg.dataset.stroke || (svg.classList.contains('sky-leaf') ? 'rgba(220,214,200,.75)' : '#4a4440'));
      p.setAttribute('stroke-width', svg.classList.contains('sky-leaf') ? '1.2' : '1.4');
      p.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(p);
    });
  })();

  /* Menu: cream panel wipes down, side photo wipes up, rows rise in */
  var menu = document.getElementById('site-menu');
  var burger = document.querySelector('.burger');
  if (menu && burger) {
    var rows = gsap.utils.toArray('.menu-list > li');
    var rowLinks = rows.map(function (li) { return li.firstElementChild; });
    gsap.set(rows, { opacity: 0 });
    gsap.set(rowLinks, { y: 50 });
    var menuTl = gsap.timeline({ paused: true, onReverseComplete: function () { gsap.set(menu, { visibility: 'hidden' }); } })
      .set(menu, { visibility: 'visible' })
      .to(menu, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 0.95, ease: 'power2.inOut' }, 0)
      .to('.menu-side', { clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)', duration: 1.0, ease: 'power3.out' }, 0.45)
      .to(rows, { opacity: 1, duration: 0.55, ease: 'power2.out', stagger: 0.12 }, 0.45)
      .to(rowLinks, { y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.12 }, 0.45);
    var setMenu = function (open) {
      root.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) { menuTl.timeScale(1).play(); if (window.lenis) window.lenis.stop(); }
      else { menuTl.timeScale(1.6).reverse(); if (window.lenis) window.lenis.start(); }
    };
    burger.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('menu-open')) setMenu(false); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    var subBtn = menu.querySelector('button[aria-controls="sub-treatments"]');
    if (subBtn) subBtn.addEventListener('click', function () {
      var open = subBtn.getAttribute('aria-expanded') !== 'true';
      subBtn.setAttribute('aria-expanded', open);
      document.getElementById('sub-treatments').classList.toggle('open', open);
    });
  }

  /* Header: pages with a dark top start with the white header and switch
     to the cream bar after 84px; light pages use the cream bar throughout */
  if (document.body.dataset.header === 'dark') {
    ScrollTrigger.create({ start: 84, end: 'max',
      onEnter: function () { root.classList.add('is-scrolled'); },
      onLeaveBack: function () { root.classList.remove('is-scrolled'); } });
  } else root.classList.add('is-scrolled');

  /* Split-line titles: each line rises out of a tilt, 0.15s apart
     (7sky: y 250, scaleY 2, rotation 15, rotationX -45, power3, 1.25s) */
  gsap.utils.toArray('.t-split').forEach(function (el) {
    var lines = el.querySelectorAll('.ln');
    if (!lines.length) lines = [el];
    if (reduce) return;
    gsap.set(el, { perspective: 200 });
    gsap.from(lines, { opacity: 0, duration: 1.25, y: 250, scaleY: 2, stagger: 0.15, transformOrigin: '0% 0% 0%', rotation: 15, rotationX: -45, ease: 'power3',
      scrollTrigger: { trigger: el, start: 'top bottom-=' + (el.dataset.start || 200) } });
  });
  /* .up: fade + rise 25px (7sky, 1.25s power1.inOut) */
  gsap.utils.toArray('.up').forEach(function (el) {
    if (reduce) { gsap.set(el, { opacity: 1 }); return; }
    gsap.fromTo(el, { y: 25, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.25, ease: 'power1.inOut', scrollTrigger: { trigger: el, start: 'top 92%' } });
  });

  /* Pill buttons: a filled circle bursts from the cursor and shrinks back
     to where it leaves (0.75s) */
  document.querySelectorAll('.ba').forEach(function (b) {
    var c = b.querySelector('.crc'); if (!c) return;
    function go(e, on) {
      var r = b.getBoundingClientRect();
      gsap.set(c, { left: e.clientX - r.left, top: e.clientY - r.top });
      gsap.to(c, { scale: on ? 1 : 0, duration: 0.75, ease: on ? 'power2.out' : 'power2.inOut', overwrite: true });
    }
    b.addEventListener('mouseenter', function (e) { go(e, true); });
    b.addEventListener('mouseleave', function (e) { go(e, false); });
  });

  /* Glow Club: pinned under the section before it until that section's
     end marker reaches the top, so the page lifts off a still dark panel */
  if (document.querySelector('.moves') && document.querySelector('.mv-end')) {
    ScrollTrigger.create({ trigger: '.moves', start: 'top top', endTrigger: '.mv-end', end: 'top top', pin: true, pinSpacing: true });
  }
  gsap.utils.toArray('.mt-line').forEach(function (l) {
    if (reduce) { gsap.set(l, { scaleX: 1 }); return; }
    gsap.to(l, { scaleX: 1, duration: 1, ease: 'none', scrollTrigger: { trigger: l, start: 'top bottom-=150' } });
  });
  var bb = document.querySelector('.big-btn a');
  if (bb) {
    var bt = bb.querySelector('.bb-txt');
    bb.addEventListener('mouseenter', function () { gsap.to(bt, { duration: 0.25, text: 'now book', ease: 'none', overwrite: true }); });
    bb.addEventListener('mouseleave', function () { gsap.to(bt, { duration: 0.25, text: 'book now', ease: 'none', overwrite: true }); });
  }
  if (!reduce && document.querySelector('.site-footer')) gsap.fromTo(['.f-map', '.f-rows'], { y: -40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: 'none',
    scrollTrigger: { trigger: '.site-footer', start: 'top bottom', end: '+=150', scrub: true } });
})();
