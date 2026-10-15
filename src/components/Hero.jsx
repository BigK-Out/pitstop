import { useRef, useState } from "react";
import { brand } from "../content";
import { useReducedMotion } from "../pitstop/useReducedMotion";
import { useScrollProgress } from "../pitstop/useScrollProgress";
import { hasWebGL } from "../scene/webgl";
import Emph from "./Emph";
import SplitCherryArt from "./SplitCherryArt";

export default function Hero() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [webgl] = useState(hasWebGL);
  const isStatic = reduced || !webgl;
  useScrollProgress(ref, !isStatic);
  const { hero } = brand;

  return (
    <section
      id="top"
      ref={ref}
      className={isStatic ? "pitstop pitstop--static" : "pitstop"}
      aria-labelledby="hero-title"
    >
      <div className="pitstop-stage">
        <div className="pitstop-canvas" aria-hidden="true">
          <SplitCherryArt className="pitstop-art" />
        </div>
        <div className="pitstop-intro">
          <p className="label">{hero.label}</p>
          <h1 id="hero-title">
            <Emph parts={hero.headline} />
          </h1>
          <div className="pitstop-ctas">
            <a className="button" href="#shop">
              {hero.primaryCta} <span aria-hidden="true">→</span>
            </a>
            <a className="button button-outline" href="#orchard">
              {hero.secondaryCta}
            </a>
          </div>
        </div>
        <div className="pitstop-reveal">
          <p className="pitstop-reveal-line">
            <Emph parts={hero.reveal} />
          </p>
          <a className="button" href="#shop">
            {hero.primaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
