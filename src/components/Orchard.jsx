import { brand } from "../content";

export default function Orchard() {
  const { label, title, steps } = brand.orchard;

  return (
    <section className="section" id="orchard" aria-labelledby="orchard-title">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="label">{label}</p>
            <h2 id="orchard-title">{title}</h2>
          </div>
        </div>
        <ol className="steps">
          {steps.map((step, i) => (
            <li className="step" key={step.title}>
              <span className="step-num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
