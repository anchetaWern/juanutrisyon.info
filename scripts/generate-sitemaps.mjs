import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');

const SITE_ORIGIN = 'https://juanutrisyon.info';
const pages = [
  { path: '', lastmod: '2026-01-25', changefreq: 'monthly', priority: '1.0' },
  { path: '/about', lastmod: '2026-03-12', changefreq: 'monthly', priority: '1.0' },
  { path: '/contact', lastmod: '2026-03-12', changefreq: 'monthly', priority: '1.0' },
  { path: '/terms', lastmod: '2026-03-12', changefreq: 'monthly', priority: '1.0' },
  { path: '/privacy', lastmod: '2026-03-12', changefreq: 'monthly', priority: '1.0' },
  { path: '/guide', lastmod: '2026-03-12', changefreq: 'monthly', priority: '1.0' },
  { path: '/blog', lastmod: '2026-04-15', changefreq: 'monthly', priority: '0.9' },
  {
    path: '/blog/busog-pero-kulang-why-feeling-full-doesnt-mean-youre-nourished',
    lastmod: '2026-04-15',
    changefreq: 'monthly',
    priority: '0.8'
  },
  {
    path: '/blog/carinderia-survival-guide-healthy-choices',
    lastmod: '2026-04-15',
    changefreq: 'monthly',
    priority: '0.8'
  },
  {
    path: '/blog/common-nutrition-mistakes-filipinos-make',
    lastmod: '2026-04-12',
    changefreq: 'monthly',
    priority: '0.8'
  },
  {
    path: '/blog/healthy-eating-on-a-budget',
    lastmod: '2026-04-14',
    changefreq: 'monthly',
    priority: '0.8'
  },
  {
    path: '/blog/hidden-sugar-in-common-filipino-foods',
    lastmod: '2026-04-15',
    changefreq: 'monthly',
    priority: '0.8'
  },
  {
    path: '/blog/is-using-asin-a-sin',
    lastmod: '2026-04-10',
    changefreq: 'monthly',
    priority: '0.8'
  },
  {
    path: '/blog/natures-hidden-pantry',
    lastmod: '2026-04-06',
    changefreq: 'monthly',
    priority: '0.8'
  },
  {
    path: '/blog/sana-all-may-label',
    lastmod: '2026-04-03',
    changefreq: 'monthly',
    priority: '0.8'
  },
  {
    path: '/blog/why-filipino-food-is-high-in-sodium',
    lastmod: '2026-04-15',
    changefreq: 'monthly',
    priority: '0.8'
  }
];

function buildUrlset(entries) {
  const urls = entries
    .map(
      ({ path: pagePath, lastmod, changefreq, priority }) => `  <url>
    <loc>${SITE_ORIGIN}${pagePath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

await mkdir(publicDir, { recursive: true });
await writeFile(path.join(publicDir, 'sitemap.xml'), buildUrlset(pages), 'utf8');
