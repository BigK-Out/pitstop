import { brand } from "../content";

export default function Hero() {
  const { eyebrow, headline, lead, cta } = brand.hero;

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-card">
        <p className="eyebrow">{eyebrow}</p>
        <h1 id="hero-title">{headline}</h1>
        <p className="lead">{lead}</p>
        <a className="button" href="#shop">
          {cta}
        </a>
      </div>
    </section>
  );
}
