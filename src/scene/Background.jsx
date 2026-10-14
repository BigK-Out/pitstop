import { Canvas } from "@react-three/fiber";
import { DepthOfField, EffectComposer } from "@react-three/postprocessing";
import { Suspense, useEffect, useState } from "react";
import ErrorBoundary from "../components/ErrorBoundary";
import Cherry from "./Cherry";
import CherryModel, { MODEL_URL } from "./CherryModel";
import { modelExists } from "./modelExists";
import ProceduralCherry from "./ProceduralCherry";
import { useSceneTier } from "./sceneTier";

const DEPTH = 80;
// Camera sits at z = 20 looking down -z; cherries span NEAR_Z to NEAR_Z - DEPTH.
const NEAR_Z = 10;
const SCENE_BG = "#ffc9b0";

function Cherries({ count, children }) {
  return Array.from({ length: count }, (_, i) => (
    <Cherry key={i} index={i} count={count} depth={DEPTH} nearZ={NEAR_Z}>
      {children}
    </Cherry>
  ));
}

// True while the tab is visible and the hero is on screen.
function useSceneVisible() {
  const [tabVisible, setTabVisible] = useState(() => !document.hidden);
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const onChange = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting));
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return tabVisible && heroVisible;
}

export default function Background() {
  const tier = useSceneTier();
  const visible = useSceneVisible();
  // null while checking; the GLB is only requested once we know it exists.
  const [hasModel, setHasModel] = useState(null);
  useEffect(() => {
    let live = true;
    modelExists(MODEL_URL).then((ok) => live && setHasModel(ok));
    return () => {
      live = false;
    };
  }, []);
  const frameloop = !tier.animate ? "demand" : visible ? "always" : "never";

  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        frameloop={frameloop}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 20], fov: 30, near: 0.1, far: 110 }}
        gl={{ alpha: false }}
      >
        <color attach="background" args={[SCENE_BG]} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 10]} intensity={2.5} />

        {hasModel === false && (
          <Cherries count={tier.count}>
            <ProceduralCherry />
          </Cherries>
        )}
        {hasModel && (
          <ErrorBoundary
            fallback={
              <Cherries count={tier.count}>
                <ProceduralCherry />
              </Cherries>
            }
          >
            <Suspense fallback={null}>
              <Cherries count={tier.count}>
                <CherryModel />
              </Cherries>
            </Suspense>
          </ErrorBoundary>
        )}

        {tier.depthOfField && (
          <EffectComposer>
            <DepthOfField
              target={[0, 0, NEAR_Z - DEPTH / 2]}
              focalLength={0.5}
              bokehScale={11}
              height={700}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
