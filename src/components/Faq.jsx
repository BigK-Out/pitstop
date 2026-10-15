import { brand } from "../content";
import Emph from "./Emph";

export default function Faq() {
  const { label, heading, items } = brand.faq;

  return (
    <section className="section" id="faq" aria-labelledby="faq-title">
      <div className="container faq-layout">
        <div>
          <p className="label">{label}</p>
          <h2 id="faq-title">
            <Emph parts={heading} />
          </h2>
        </div>
        <div className="faq-list">
          {items.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
