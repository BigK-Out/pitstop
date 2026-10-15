// All site copy, products and prices. Pure data: also imported by vite.config.js in Node.
// Emphasis is written as segments: { text } for plain words, { em } for italic cherry words.

export const brand = {
  name: "Pitstop",
  tagline: "Sun-dried cherries, nothing added.",
  description:
    "Pitstop makes small-batch dried cherry snacks from orchard-grown fruit. Shop Classic, Sour Punch, Dark Choc-Dipped and Mixed Bag.",
  // Public URL of the deployed site, with trailing slash. Used for canonical and share tags.
  siteUrl: "https://bigk-out.github.io/pitstop/",
  hero: {
    label: "Batch Nº 07 — Montmorency, 2026",
    headline: [{ text: "Cherries, " }, { em: "slowly" }, { text: " sun-dried." }],
    primaryCta: "Shop the harvest",
    secondaryCta: "Our orchard",
    reveal: [{ text: "We took the " }, { em: "pit" }, { text: " out." }],
  },
  statement: {
    label: "Ingredients",
    parts: [{ text: "Cherries. " }, { em: "That's the list." }],
  },
  shop: {
    label: "The harvest",
    title: "Pick your pouch",
  },
  orchard: {
    label: "The orchard",
    title: "From orchard to pouch",
    steps: [
      {
        title: "Picked ripe",
        body: "Family orchards, picked at peak ripeness and never early.",
      },
      {
        title: "Pitted by hand",
        body: "Checked one by one. The pit is the only thing we take out.",
      },
      {
        title: "Sun-dried slow",
        body: "Their own sugar does the work, then into a home-compostable pouch.",
      },
    ],
  },
  faq: {
    label: "Questions",
    heading: [{ text: "Good to " }, { em: "know." }],
    items: [
      {
        q: "Is this a real shop?",
        a: "No. Pitstop is a demo store. You can fill a bag and place a demo order, but nothing is charged and nothing ships.",
      },
      {
        q: "Are there pits in the cherries?",
        a: "Every cherry is pitted by machine and checked by hand, but the occasional pit fragment can slip through. Chew with care.",
      },
      {
        q: "How should I store them?",
        a: "Keep the pouch sealed in a cool, dry place. Once open, they are best within four weeks.",
      },
      {
        q: "Are they vegan?",
        a: "Yes, all four. The chocolate on Dark Choc-Dipped is dairy-free.",
      },
      {
        q: "Do you ship internationally?",
        a: "In this demo we ship everywhere and nowhere at once. A real store would list its shipping zones here.",
      },
    ],
  },
  social: [
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "TikTok", href: "https://www.tiktok.com/" },
  ],
};

export const products = [
  {
    id: "classic",
    name: "Classic Dried",
    description: "Plump, chewy sun-dried cherries. Our original, and just fruit.",
    priceCents: 899,
    art: "classic",
    artLabel: "Line drawing of two cherries joined at the stem",
  },
  {
    id: "sour",
    name: "Sour Punch",
    description: "Tart Montmorency cherries with a dusting of sour citrus. Pucker up.",
    priceCents: 949,
    art: "sour",
    artLabel: "Line drawing of two cherries dusted with sour sugar",
  },
  {
    id: "choc",
    name: "Dark Choc-Dipped",
    description: "Dried cherries half-dipped in 70% dark chocolate.",
    priceCents: 1199,
    art: "choc",
    artLabel: "Line drawing of two cherries half-dipped in chocolate",
  },
  {
    id: "mixed",
    name: "Mixed Bag",
    description: "Classic, sour and choc-dipped together in one 300 g pouch.",
    priceCents: 1499,
    art: "mixed",
    artLabel: "Line drawing of three cherries on one stem",
  },
];
