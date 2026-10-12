// Plugin de Vite para el SEO de la web pública (issue #7).
//
// - Inserta en index.html el JSON-LD HairSalon con los datos de src/data/business.ts.
// - En las vistas previas de los PR (--base=/preview/pr-<n>/) añade noindex para que
//   Google no las indexe como copias del sitio.
// - Genera robots.txt y sitemap.xml en dist/ con el dominio de SITE_URL.
//
// La agenda privada (admin/index.html) no se toca: ya lleva su propio noindex.
import type { HtmlTagDescriptor, Plugin } from "vite";
import {
  BUSINESS_NAME,
  INSTAGRAM_URL,
  MAPS_URL,
  OPENING_HOURS,
  PHONE_E164,
  POSTAL_ADDRESS,
  PRICE_RANGE,
  SITE_DESCRIPTION,
  SITE_URL,
} from "./src/data/business";

function hairSalonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    "@id": `${SITE_URL}/#salon`,
    name: BUSINESS_NAME,
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/og-image.jpg`,
    logo: `${SITE_URL}/apple-touch-icon.png`,
    telephone: PHONE_E164,
    priceRange: PRICE_RANGE,
    address: { "@type": "PostalAddress", ...POSTAL_ADDRESS },
    hasMap: MAPS_URL,
    openingHoursSpecification: OPENING_HOURS.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: [INSTAGRAM_URL],
  };
}

export default function seoPlugin(): Plugin {
  let base = "/";
  return {
    name: "salon-seo",
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: "post",
      handler(_html, ctx) {
        // Solo la web pública (index.html), no /admin/.
        if (!/(^|\/)index\.html$/.test(ctx.filename) || /admin[\\/]index\.html$/.test(ctx.filename)) return;
        const tags: HtmlTagDescriptor[] = [
          {
            tag: "script",
            attrs: { type: "application/ld+json" },
            // "<" escapado para que ningún texto pueda cerrar el <script>.
            children: JSON.stringify(hairSalonJsonLd()).replace(/</g, "\\u003c"),
            injectTo: "head",
          },
        ];
        if (base.startsWith("/preview/")) {
          tags.push({
            tag: "meta",
            attrs: { name: "robots", content: "noindex, nofollow" },
            injectTo: "head",
          });
        }
        return tags;
      },
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: [
          "User-agent: *",
          "Allow: /",
          "Disallow: /admin/",
          "Disallow: /preview/",
          "",
          `Sitemap: ${SITE_URL}/sitemap.xml`,
          "",
        ].join("\n"),
      });
      const today = new Date().toISOString().slice(0, 10);
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
  </url>
</urlset>
`,
      });
    },
  };
}
