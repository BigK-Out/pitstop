// Build-time SEO: fills %PITSTOP_*% placeholders in index.html and adds Product JSON-LD.

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function productJsonLd(brand, products) {
  return {
    "@context": "https://schema.org",
    "@graph": products.map((product) => ({
      "@type": "Product",
      name: `${brand.name} ${product.name}`,
      description: product.description,
      brand: { "@type": "Brand", name: brand.name },
      offers: {
        "@type": "Offer",
        price: (product.priceCents / 100).toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: brand.siteUrl,
      },
    })),
  };
}

export function renderSeo(html, brand, products) {
  const values = {
    TITLE: `${brand.name} — ${brand.tagline}`,
    DESCRIPTION: brand.description,
    SITE_URL: brand.siteUrl,
    BRAND_NAME: brand.name,
  };
  const filled = html.replace(/%PITSTOP_(\w+)%/g, (match, key) =>
    key in values ? escapeHtml(values[key]) : match,
  );
  const json = JSON.stringify(productJsonLd(brand, products)).replace(/</g, "\\u003c");
  return filled.replace(
    "</head>",
    () => `  <script type="application/ld+json">${json}</script>\n  </head>`,
  );
}

export function seoPlugin(brand, products) {
  return {
    name: "pitstop-seo",
    // "pre" so placeholders are filled before Vite parses href/src URLs (a raw "%PI..." breaks decodeURI).
    transformIndexHtml: {
      order: "pre",
      handler: (html) => renderSeo(html, brand, products),
    },
  };
}
