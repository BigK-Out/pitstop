import { brand } from "../content";

export default function Faq() {
  return (
    <section className="section container" id="faq" aria-labelledby="faq-title">
      <div className="section-head">
        <h2 id="faq-title">{brand.faq.title}</h2>
      </div>
      <div className="faq-list">
        {brand.faq.items.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
