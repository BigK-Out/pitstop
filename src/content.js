// All site copy, products and prices. Pure data: also imported by vite.config.js in Node.

export const brand = {
  name: "Pitstop",
  tagline: "Sun-dried cherries, nothing added.",
  description:
    "Pitstop makes small-batch dried cherry snacks from orchard-grown fruit. Shop Classic, Sour Punch, Dark Choc-Dipped and Mixed Bag.",
  // Public URL of the deployed site, with trailing slash. Used for canonical and share tags.
  siteUrl: "https://bigk-out.github.io/pitstop/",
  hero: {
    eyebrow: "Small-batch dried cherries",
    headline: "Cherries, slowed down.",
    lead: "We pick ripe orchard cherries, pit them by hand and dry them slowly in the sun. Chewy, tart-sweet, and nothing else in the bag.",
    cta: "Shop cherries",
  },
  shop: {
    title: "Pick your pouch",
    intro: "Four ways to snack on a cherry. Every pouch is 150 g unless it says otherwise.",
  },
  story: {
    title: "From orchard to pouch",
    items: [
      {
        title: "Orchard grown",
        body: "Our cherries come from family orchards and are picked at peak ripeness, never early.",
      },
      {
        title: "No added sugar",
        body: "Our Classic pouch has one ingredient: cherries. Dried slowly so their own sugar does the work.",
      },
      {
        title: "Compostable pouch",
        body: "Every pouch is home-compostable, so the only leftover is the pit, and we already took that out.",
      },
    ],
  },
  faq: {
    title: "Questions",
    items: [
      {
        q: "Is this a real shop?",
        a: "No. Pitstop is a demo store. You can fill a cart and place a demo order, but nothing is charged and nothing ships.",
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
    artLabel: "Two deep red cherries joined at the stem",
  },
  {
    id: "sour",
    name: "Sour Punch",
    description: "Tart Montmorency cherries with a dusting of sour citrus. Pucker up.",
    priceCents: 949,
    art: "sour",
    artLabel: "Two bright red cherries dusted with sour sugar",
  },
  {
    id: "choc",
    name: "Dark Choc-Dipped",
    description: "Dried cherries half-dipped in 70% dark chocolate.",
    priceCents: 1199,
    art: "choc",
    artLabel: "Two cherries half-dipped in dark chocolate",
  },
  {
    id: "mixed",
    name: "Mixed Bag",
    description: "Classic, sour and choc-dipped together in one 300 g pouch.",
    priceCents: 1499,
    art: "mixed",
    artLabel: "Three cherries in different shades of red",
  },
];
