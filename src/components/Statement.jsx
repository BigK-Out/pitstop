import { brand } from "../content";
import Emph from "./Emph";

export default function Statement() {
  const { label, parts } = brand.statement;
  return (
    <section className="statement" aria-label={label}>
      <p className="label">{label}</p>
      <p className="statement-text">
        <Emph parts={parts} />
      </p>
    </section>
  );
}
