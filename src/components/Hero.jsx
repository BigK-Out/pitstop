import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { brand } from "../content";
import { useReducedMotion } from "../pitstop/useReducedMotion";
import { useScrollProgress } from "../pitstop/useScrollProgress";
import { hasWebGL } from "../scene/webgl";
import Emph from "./Emph";
import ErrorBoundary from "./ErrorBoundary";
import SplitCherryArt from "./SplitCherryArt";

// three.js loads after the page renders; the static art covers loading and failures.
const PitStopScene = lazy(() => import("../scene/PitStopScene"));

export default function Hero() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [webgl] = useState(hasWebGL);
  const [sceneFailed, setSceneFailed] = useState(false);
  const isStatic = reduced || !webgl || sceneFailed;
  const [sceneReady, setSceneReady] = useState(false);

  // Mount the 3D scene once the browser is idle so it never competes with first paint.
  useEffect(() => {
    if (!webgl || reduced) return;
    const ready = () => setSceneReady(true);
    if (window.requestIdleCallback) {
      const id = window.requestIdleCallback(ready, { timeout: 2000 });
      return () => window.cancelIdleCallback?.(id);
    }
    const id = setTimeout(ready, 1200);
    return () => clearTimeout(id);
  }, [webgl, reduced]);
  const progressRef = useScrollProgress(ref, !isStatic);
  const { hero } = brand;
  // The pinned scrub starts on a whole cherry, so its placeholder must not spoil the split.
  const art = <SplitCherryArt whole={!isStatic} className="pitstop-art" />;

  return (
    <section
      id="top"
      ref={ref}
      className={isStatic ? "pitstop pitstop--static" : "pitstop"}
      aria-labelledby="hero-title"
    >
      <div className="pitstop-stage">
        <div className="pitstop-canvas" aria-hidden="true">
          {webgl && !reduced && sceneReady ? (
            <ErrorBoundary fallback={art} onError={() => setSceneFailed(true)}>
              <Suspense fallback={art}>
                <PitStopScene progressRef={progressRef} />
              </Suspense>
            </ErrorBoundary>
          ) : (
            art
          )}
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
