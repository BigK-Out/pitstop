import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { pitStopTimeline } from "../pitstop/timeline";
import { createHeroCherryParts } from "./heroGeometry";

const { lerp } = THREE.MathUtils;
// Halves open toward the camera by this much at full split so the cut faces are visible.
const OPEN = 0.7;

export default function HeroCherry({ progressRef, animate }) {
  const root = useRef();
  const left = useRef();
  const right = useRef();
  const pit = useRef();
  const parts = useMemo(createHeroCherryParts, []);
  const wide = useThree((state) => state.size.width >= 768);

  useFrame(({ clock }) => {
    const t = pitStopTimeline(progressRef.current);
    const sway = animate ? Math.sin(clock.elapsedTime * 0.6) * 0.08 : 0;

    root.current.position.set(
      wide ? lerp(2.4, 0, t.travel) : 0,
      wide ? 0 : lerp(-1.4, -0.3, t.travel),
      0,
    );
    root.current.rotation.y = t.turn + sway;
    // On phones the halves would leave the frame, so the cherry shrinks as it splits.
    root.current.scale.setScalar(wide ? t.scale : lerp(0.8, 0.52, t.split));

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
