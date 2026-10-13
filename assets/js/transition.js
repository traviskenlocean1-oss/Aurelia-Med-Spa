/* Page transitions (house style: a deep scale + fade, identical on every
   page). Leaving: the page shrinks and fades while a cream veil comes up.
   Arriving: the veil lifts and the page settles in from slightly larger. */
(function () {
  var root = document.documentElement;
  root.classList.add('pt-js');
  var pt = document.querySelector('.pt');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function parts() { return document.querySelectorAll('main, .site-footer'); }
  function origin() { return '50% ' + (window.scrollY + window.innerHeight / 2) + 'px'; }

  function goToHash() {
    if (!location.hash) return;
    var el = document.querySelector(location.hash);
    if (!el) return;
    if (window.lenis) window.lenis.scrollTo(el, { immediate: true, force: true });
    else el.scrollIntoView();
  }

  function enter() {
    if (!pt || reduce || !window.gsap) { root.classList.add('pt-done'); goToHash(); return; }
    gsap.set(parts(), { scale: 1.08, opacity: 0, transformOrigin: origin() });
    gsap.to(pt, { opacity: 0, duration: 0.9, ease: 'power2.inOut', delay: 0.1 });
    gsap.to(parts(), { scale: 1, opacity: 1, duration: 1.3, ease: 'power3.out', delay: 0.1, clearProps: 'transform,opacity,transformOrigin',
      onComplete: function () {
        root.classList.add('pt-done');
        gsap.set(pt, { clearProps: 'opacity' });
        if (window.ScrollTrigger) ScrollTrigger.refresh();
        goToHash();
      } });
  }

  function leave(href) {
    if (!pt || reduce || !window.gsap) { location.href = href; return; }
    if (window.lenis) window.lenis.stop();
    root.classList.remove('pt-done');
    gsap.set(pt, { opacity: 0, visibility: 'visible' });
    gsap.to(pt, { opacity: 1, duration: 0.75, ease: 'power2.in' });
    gsap.to(parts(), { scale: 0.86, opacity: 0, duration: 0.75, ease: 'power3.in', transformOrigin: origin(),
      onComplete: function () { location.href = href; } });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank' || a.hasAttribute('download')) return;
    var url = new URL(a.getAttribute('href'), location.href);
    if (url.origin !== location.origin || /^(tel|mailto):/.test(a.getAttribute('href'))) return;
    var samePage = url.pathname.replace(/index\.html$/, '') === location.pathname.replace(/index\.html$/, '');
    if (samePage && url.hash) {          // in-page anchor: smooth scroll instead of a reload
      var el = document.querySelector(url.hash);
      if (el) { e.preventDefault(); if (window.lenis) window.lenis.scrollTo(el, { duration: 1.6 }); else el.scrollIntoView({ behavior: 'smooth' }); history.replaceState(null, '', url.hash); }
      return;
    }
    if (samePage && !url.hash) return;
    e.preventDefault();
    leave(url.href);
  });

  /* back/forward cache: show the page again instead of the faded state */
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted || !window.gsap) return;
    gsap.set(parts(), { clearProps: 'transform,opacity,transformOrigin' });
    gsap.set(pt, { opacity: 0 });
    root.classList.add('pt-done');
    if (window.lenis) window.lenis.start();
  });

  if (document.readyState === 'complete') enter();
  else window.addEventListener('load', enter);
})();
