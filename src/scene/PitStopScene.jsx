import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import Floaters from "./Floaters";
import HeroCherry from "./HeroCherry";
import { useSceneTier } from "./sceneTier";

const PAPER = "#f4ede3";

// Soft studio reflections for the glossy skin, without loading an HDR file.
function StudioEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = texture;
    return () => {
      scene.environment = null;
      texture.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

// True while the tab is visible and the hero is on screen.
function useStageVisible() {
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

export default function PitStopScene({ progressRef }) {
  const tier = useSceneTier();
  const visible = useStageVisible();
  const frameloop = !tier.animate ? "demand" : visible ? "always" : "never";

  return (
    <Canvas
      flat
      frameloop={frameloop}
      dpr={tier.dpr}
      camera={{ position: [0, 0, 12], fov: 30, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={[PAPER]} />
      <fog attach="fog" args={[PAPER, 10, 30]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[-4, 6, 6]} intensity={2.2} color="#fff1e0" />
      <directionalLight position={[5, -2, -6]} intensity={1.2} color="#ffd6e0" />
      <StudioEnvironment />
      <HeroCherry progressRef={progressRef} animate={tier.animate} />
      <Floaters count={tier.floaters} animate={tier.animate} />
    </Canvas>
  );
}
