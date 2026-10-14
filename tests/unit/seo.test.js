import { describe, expect, it } from "vitest";
import { productJsonLd, renderSeo } from "../../build/seo";

const brand = {
  name: "Pitstop",
  tagline: "Tag & line",
  description: 'Say "hi" <b>',
  siteUrl: "https://example.com/pitstop/",
};
const products = [{ id: "a", name: "A</script>", description: "d", priceCents: 899 }];

describe("seo", () => {
  it("builds Product JSON-LD", () => {
    const data = productJsonLd(brand, products);
    expect(data["@graph"][0]).toMatchObject({
      "@type": "Product",
      name: "Pitstop A</script>",
      offers: { "@type": "Offer", price: "8.99", priceCurrency: "USD" },
    });
  });

  it("fills escaped placeholders and injects JSON-LD before </head>", () => {
    const html =
      '<head><title>%PITSTOP_TITLE%</title><meta content="%PITSTOP_DESCRIPTION%"><link href="%PITSTOP_SITE_URL%og.png"><x>%PITSTOP_UNKNOWN%</x></head>';
    const out = renderSeo(html, brand, products);
    expect(out).toContain("<title>Pitstop — Tag &amp; line</title>");
    expect(out).toContain('content="Say &quot;hi&quot; &lt;b&gt;"');
    expect(out).toContain('href="https://example.com/pitstop/og.png"');
    expect(out).toContain("%PITSTOP_UNKNOWN%");
    expect(out).toMatch(/<script type="application\/ld\+json">.*<\/script>\s*<\/head>/s);
    // "</script>" inside data must not close the tag early
    expect(out).toContain("A\\u003c/script>");
  });
});
