/* Treatment cards + category tabs (7sky services clone), shared by the
   treatments page and the gift-card page. */
window.AureliaCards = function (opt) {
  var cats = window.AURELIA_CATS, items = window.AURELIA_TREATMENTS;
  var list = opt.list, grid = opt.grid;
  var arrow = '<svg viewBox="0 0 19 15" fill="none" aria-hidden="true"><path d="M0 7.5h17M11 1l6.5 6.5L11 14" stroke="currentColor" stroke-width="1.2"/></svg>';
  var price = function (s) { return +s.replace(/[^0-9.]/g, ''); };

  list.innerHTML = '<li role="tab" data-cat="all"><p class="t">All<span class="s"></span></p></li>' + cats.map(function (c) {
    return '<li role="tab" data-cat="' + c.id + '"><p class="t">' + c.name + '<img src="' + c.icon + '" alt="" /><span class="s"></span></p></li>';
  }).join('');

  grid.innerHTML = items.map(function (t, i) {
    var opts = t.opts.map(function (o, k) { return '<button type="button" class="c' + (k ? '' : ' active') + '"><span class="tm">' + o[0] + '</span><span class="pr">' + o[1] + '</span></button>'; }).join('');
    var from = t.opts.slice().sort(function (a, b) { return price(a[1]) - price(b[1]); })[0][1];
    return '<div class="cpt_cols" data-cat="' + t.cat + '" data-i="' + i + '" data-price="' + price(from) + '">' +
      '<div class="cpt_lnk"><div class="desc">' +
        '<h3 class="h3">' + t.name[0] + ' <span class="br">' + t.name[1] + '</span></h3>' +
        '<div class="bg" style="background-image:url(\'' + t.img + '\')"><div class="ovr_lr01"></div><div class="ovr_lr02"></div>' +
          '<div class="bg_desc"><div class="h4">' + t.name[0] + ' <span class="br">' + t.name[1] + '</span></div>' +
          '<p class="txt">' + t.desc + '</p>' +
          '<div class="bg_itm_btm"><div class="r">' + opts + '</div></div>' +
          '<div class="dbl_btm"><div class="ba light"><span class="crc"></span><a href="' + opt.primary.href(t) + '">' + opt.primary.label + arrow + '</a></div>' +
          '<div class="ba"><span class="crc"></span><a href="' + opt.secondary.href(t) + '">' + opt.secondary.label + arrow + '</a></div></div>' +
        '</div></div>' +
        '<div class="itm_btm"><span class="v">' + t.opts.length + (t.opts.length > 1 ? ' options' : ' option') + '</span><span class="p">from ' + from + '</span></div>' +
      '</div></div></div>';
  }).join('');

  grid.querySelectorAll('.bg_itm_btm .r').forEach(function (r) {
    r.addEventListener('click', function (e) { var c = e.target.closest('.c'); if (!c) return; r.querySelectorAll('.c').forEach(function (x) { x.classList.toggle('active', x === c); }); });
  });

  function show(cat) {
    list.querySelectorAll('li').forEach(function (li) { var on = li.dataset.cat === cat; li.classList.toggle('active', on); li.setAttribute('aria-selected', on); });
    grid.querySelectorAll('.cpt_cols').forEach(function (c) { c.classList.toggle('hide', cat !== 'all' && c.dataset.cat !== cat); });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  list.addEventListener('click', function (e) {
    var li = e.target.closest('li'); if (!li) return; show(li.dataset.cat);
    if (opt.useQuery) history.replaceState(null, '', li.dataset.cat === 'all' ? location.pathname : location.pathname + '?c=' + li.dataset.cat);
  });
  var q = opt.useQuery ? new URLSearchParams(location.search).get('c') : null;
  show(cats.some(function (c) { return c.id === q; }) ? q : 'all');

  if (opt.sort) opt.sort.forEach(function (b) {
    b.addEventListener('click', function () {
      opt.sort.forEach(function (x) { x.classList.toggle('active', x === b); });
      var cards = [].slice.call(grid.children);
      cards.sort(function (a, c) { return b.dataset.sort === 'price' ? a.dataset.price - c.dataset.price : a.dataset.i - c.dataset.i; });
      cards.forEach(function (c) { grid.appendChild(c); });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });
};
