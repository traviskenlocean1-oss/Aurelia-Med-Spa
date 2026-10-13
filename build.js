/* Builds the inner pages from src/pages/*.html + the shared partials.
   Each page template starts with a JSON comment:
   <!--{"title":"…","desc":"…","file":"about.html","header":"dark","bottom":true}-->
   followed by optional <style>…</style>, the page body, and an optional
   <script>…</script> block. Run: node build.js */
const fs = require('fs');
const path = require('path');
const SITE = 'https://aurelia-med-spa.traviskenlocean1.workers.dev/';
const part = (n) => fs.readFileSync(path.join(__dirname, 'src/partials', n + '.html'), 'utf8');
const header = part('header'), bottom = part('bottom'), footer = part('footer'), team = part('team');

for (const f of fs.readdirSync(path.join(__dirname, 'src/pages')).filter((f) => f.endsWith('.html'))) {
  let src = fs.readFileSync(path.join(__dirname, 'src/pages', f), 'utf8');
  const meta = JSON.parse(src.match(/^<!--(\{[\s\S]*?\})-->/)[1]);
  src = src.replace(/^<!--\{[\s\S]*?\}-->\s*/, '');
  src = src.replace('{{team}}', team);
  let style = '', script = '';
  src = src.replace(/<style>([\s\S]*?)<\/style>\s*/, (_, s) => { style = s; return ''; });
  src = src.replace(/<script data-page>([\s\S]*?)<\/script>\s*$/, (_, s) => { script = s; return ''; });
  const url = SITE + meta.file;
  const ld = { '@context': 'https://schema.org', '@type': 'WebPage', name: meta.title, url, description: meta.desc,
    isPartOf: { '@id': SITE + '#business' },
    breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: meta.crumb || meta.title.split('|')[0].trim(), item: url } ] } };
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${meta.title}</title>
<meta name="description" content="${meta.desc}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<meta name="theme-color" content="#1c1512" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Aurelia Med Spa" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${meta.title}" />
<meta property="og:description" content="${meta.desc}" />
<meta property="og:image" content="${SITE}${meta.ogImage || 'assets/img/hero-poster.jpg'}" />
<meta name="twitter:card" content="summary_large_image" />
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<link rel="icon" href="/favicon.ico" sizes="48x48" /><link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png" /><link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400&family=Poppins:wght@200;300;400&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="assets/css/site.css" />
${(meta.css || []).map((c) => '<link rel="stylesheet" href="assets/css/' + c + '.css" />').join('\n')}
<style>${style}</style>
</head>
<body class="inner" data-header="${meta.header || 'light'}">
<div class="pt" aria-hidden="true"><img src="assets/brand/logo-dark.png" alt="" width="96" height="52" /></div>

${header}
<main>
${src.trim()}
${meta.bottom === false ? '' : '\n' + bottom}
</main>

${footer}
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/TextPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>
<script>gsap.registerPlugin(ScrollTrigger, TextPlugin);</script>
${meta.data ? '<script src="assets/js/treatments-data.js"></script>' : ''}
${(meta.js || []).map((j) => '<script src="assets/js/' + j + '.js"></script>').join('')}
${script ? '<script>' + script + '</script>' : ''}
<script src="assets/js/site.js"></script>
${meta.team ? '<script src="assets/js/team.js"></script>' : ''}
<script src="assets/js/transition.js"></script>
</body>
</html>
`;
  // ln-space: a real space between stacked title lines so the text reads as words
  const out = html.replace(/<\/span><span class="(ln|br|st)/g, '</span> <span class="$1');
  fs.writeFileSync(path.join(__dirname, meta.file), out);
  console.log('built', meta.file);
}
