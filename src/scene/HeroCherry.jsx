import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { pitStopTimeline } from "../pitstop/timeline";
import { createHeroCherryParts } from "./heroGeometry";

const { lerp } = THREE.MathUtils;
// Halves open toward the camera by this much at full split so the cut faces are visible.
const OPEN = 0.7;

export default function HeroCherry({ progressRef, animate, lite = false }) {
  const root = useRef();
  const left = useRef();
  const right = useRef();
  const pit = useRef();
  const parts = useMemo(() => createHeroCherryParts({ lite }), [lite]);
  const viewport = useThree((state) => state.viewport);
  // Side-by-side only on landscape screens; otherwise the cherry is centred and sized to fit.
  const wide = viewport.aspect >= 1.3;
  const halfW = viewport.width / 2;
  // Portrait tablets have the intro copy lower down, so the cherry starts further down and smaller.
  const tablet = viewport.aspect > 0.6;
  const startY = tablet ? -2 : -1.4;
  const startScale = tablet ? 0.85 : Math.min(1, halfW * 0.54);

  useFrame(({ clock }) => {
    const t = pitStopTimeline(progressRef.current);
    const sway = animate ? Math.sin(clock.elapsedTime * 0.6) * 0.08 : 0;

    root.current.position.set(
      wide ? lerp(Math.min(2.4, halfW - 1.3), 0, t.travel) : 0,
      wide ? 0 : lerp(startY, -0.3, t.travel),
      0,
    );
    root.current.rotation.y = t.turn + sway;
    // Narrow frames shrink the cherry as it splits so the halves (about ±2.1 units) stay inside.
    const fitted = lerp(startScale, Math.min(1.15, (halfW * 0.8) / 2.1), t.split);
    root.current.scale.setScalar(wide ? t.scale : fitted);

    left.current.position.x = -1.1 * t.split;
    left.current.rotation.set(0, -OPEN * t.split, 0.45 * t.split);
    right.current.position.x = 1.1 * t.split;
    right.current.rotation.set(0, OPEN * t.split, -0.45 * t.split);

    pit.current.position.y = 1.5 * t.pitLift;
    pit.current.rotation.y = Math.PI * t.pitLift;
  });

  return (
    <group ref={root}>
      <group ref={left}>
        <mesh geometry={parts.leftSkin} material={parts.skin} />
        <mesh geometry={parts.leftFace} material={parts.flesh} />
        <mesh geometry={parts.leftHollow} material={parts.hollow} />
        <mesh geometry={parts.stem} material={parts.stemMat} />
        <mesh geometry={parts.leaf} material={parts.leafMat} />
      </group>
      <group ref={right}>
        <mesh geometry={parts.rightSkin} material={parts.skin} />
        <mesh geometry={parts.rightFace} material={parts.flesh} />
        <mesh geometry={parts.rightHollow} material={parts.hollow} />
      </group>
      <mesh ref={pit} geometry={parts.pit} material={parts.pitMat} />
    </group>
  );
}
