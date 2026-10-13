/* Team section (shared copy of the home page code) */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Team: the dome swells to 1.5x over 600px once it is 200px from the
     top, the arc title rises into place over 400px (reference values) */
  (function () {
    var team = document.querySelector('.team');
    if (!team) return;
    if (reduce) gsap.set('.team-arc', { y: 0, scale: 1 });
    else {
      gsap.to('.team-dome', { scale: 1.5, ease: 'none', scrollTrigger: { trigger: '.team-dome', start: 'top top+=200', end: '+=600', scrub: true } });
      gsap.to('.team-arc', { y: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.team-arc', start: 'top bottom-=300', end: '+=400', scrub: true } });
    }

    /* Looping slider: one copy of the slides either side of the real
       set; after a move lands in a copy, jump to the matching real slide
       with transitions off (the two look identical, so nothing shows) */
    var inner = team.querySelector('.team-in'), view = team.querySelector('.team-view'), track = team.querySelector('.team-track');
    var real = [].slice.call(track.children), N = real.length;
    real.forEach(function (s) { var c = s.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); });
    real.slice().reverse().forEach(function (s) { var c = s.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.insertBefore(c, track.firstChild); });
    var slides = [].slice.call(track.children), idx = N;

    function xFor(i) {
      var w = slides[0].offsetWidth, step = w + parseFloat(getComputedStyle(slides[0]).marginRight);
      return view.offsetWidth / 2 - (i * step + w / 2);
    }
    function place(i, instant) {
      if (instant) team.classList.add('no-tr');
      track.style.transform = 'translate3d(' + xFor(i) + 'px,0,0)';
      slides.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
      if (instant) { void track.offsetWidth; requestAnimationFrame(function () { requestAnimationFrame(function () { team.classList.remove('no-tr'); }); }); }
    }
    function go(d) { idx = Math.max(1, Math.min(3 * N - 2, idx + d)); place(idx); }
    track.addEventListener('transitionend', function (e) {
      if (e.target !== track || e.propertyName !== 'transform') return;
      if (idx < N || idx >= 2 * N) { idx = ((idx % N) + N) % N + N; place(idx, true); }
    });
    place(idx, true);
    window.addEventListener('resize', function () { place(idx, true); });

    /* click a half to step, or click & drag (60px commits a move) */
    var startX = null, dx = 0, baseX = 0, moved = false;
    inner.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      startX = e.clientX; dx = 0; moved = false; baseX = xFor(idx);
    });
    window.addEventListener('pointermove', function (e) {
      if (startX === null) return;
      dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; team.classList.add('is-drag'); }
      if (moved) track.style.transform = 'translate3d(' + (baseX + dx) + 'px,0,0)';
    });
    function release(e, cancelled) {
      if (startX === null) return;
      team.classList.remove('is-drag');
      var r = inner.getBoundingClientRect();
      if (cancelled) place(idx);
      else if (!moved) go(e.clientX < r.left + r.width / 2 ? -1 : 1);
      else if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
      else place(idx);
      startX = null;
    }
    window.addEventListener('pointerup', function (e) { release(e, false); });
    window.addEventListener('pointercancel', function (e) { release(e, true); });
    inner.addEventListener('dragstart', function (e) { e.preventDefault(); });

    /* "click & drag" badge trails the pointer (0.1 easing like the
       reference); arrow and spin direction follow the half you're on */
    var badge = document.querySelector('.team-badge');
    if (badge && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var mx = 0, my = 0, bx = 0, by = 0, inside = false;
      inner.addEventListener('pointermove', function (e) {
        mx = e.clientX; my = e.clientY;
        var r = inner.getBoundingClientRect();
        badge.classList.toggle('is-prev', mx < r.left + r.width / 2);
        if (!inside) { inside = true; bx = mx; by = my; badge.classList.add('is-on'); }
      });
      inner.addEventListener('pointerleave', function () { inside = false; badge.classList.remove('is-on'); });
      gsap.ticker.add(function () {
        if (!inside) return;
        bx += (mx - bx) * 0.1; by += (my - by) * 0.1;
        badge.style.transform = 'translate3d(' + (bx - 58) + 'px,' + (by - 70) + 'px,0)';
      });
    }
  })();

})();
