import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { pitStopTimeline } from "../pitstop/timeline";
import { SPLIT_X, halfClipPlanes } from "./cherryModel";
import { createCutParts } from "./heroGeometry";
import { useCherryModel } from "./useCherryModel";

const { lerp } = THREE.MathUtils;
// Halves open toward the camera by this much at full split so the cut faces are visible.
const OPEN = 0.7;

// Each half renders the whole model with its own clipping plane, which follows the half as it moves.
function useClippedHalf(material, localPlane) {
  return useMemo(() => {
    const world = localPlane.clone();
    const halfMaterial = material.clone();
    halfMaterial.clippingPlanes = [world];
    return { local: localPlane, world, material: halfMaterial };
  }, [material, localPlane]);
}

export default function HeroCherry({ progressRef, animate }) {
  const root = useRef();
  const left = useRef();
  const right = useRef();
  const pit = useRef();
  const leftCut = useRef();
  const rightCut = useRef();
  const { geometry, material } = useCherryModel();
  const cut = useMemo(createCutParts, []);
  const planes = useMemo(() => halfClipPlanes(), []);
  const leftHalf = useClippedHalf(material, planes.left);
  const rightHalf = useClippedHalf(material, planes.right);
  const viewport = useThree((state) => state.viewport);
  const size = useThree((state) => state.size);
  // Side-by-side only on landscape screens; otherwise the cherry is centred and sized to fit.
  const wide = viewport.aspect >= 1.3;
  const halfW = viewport.width / 2;
  // Stacked layouts: fit the whole cherry (stem tip to body bottom ≈ 3.4 units at scale 1)
  // into the space below the intro copy, measured from the page so any phone height works.
  const { startY, startScale } = useMemo(() => {
    const introBottom =
      document.querySelector(".pitstop-intro")?.getBoundingClientRect().bottom ??
      size.height * 0.55;
    const freeUnits = Math.max(
      0,
      ((size.height - introBottom - 16) / size.height) * viewport.height,
    );
    const scale = Math.max(
      0.35,
      Math.min(viewport.aspect > 0.6 ? 0.8 : 1, halfW * 0.54, (freeUnits - 0.2) / 3.4),
    );
    return { startScale: scale, startY: -viewport.height / 2 + 0.2 + 0.9 * scale };
  }, [size.height, viewport.height, viewport.aspect, halfW]);

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

    pit.current.position.set(SPLIT_X, 1.5 * t.pitLift, 0);
    // The cut faces only exist once the cherry opens; while whole they would poke through the skin.
    leftCut.current.visible = rightCut.current.visible = t.split > 0.01;
    pit.current.rotation.y = Math.PI * t.pitLift;

    // Clipping planes live in world space: move them with their halves.
    root.current.updateMatrixWorld();
    leftHalf.world.copy(leftHalf.local).applyMatrix4(left.current.matrixWorld);
    rightHalf.world.copy(rightHalf.local).applyMatrix4(right.current.matrixWorld);
  });

  return (
    <group ref={root}>
      <group ref={left}>
        <mesh geometry={geometry} material={leftHalf.material} />
        <group ref={leftCut}>
          <mesh geometry={cut.leftFace} material={cut.flesh} />
          <mesh geometry={cut.leftHollow} material={cut.hollow} />
        </group>
      </group>
      <group ref={right}>
        <mesh geometry={geometry} material={rightHalf.material} />
        <group ref={rightCut}>
          <mesh geometry={cut.rightFace} material={cut.flesh} />
          <mesh geometry={cut.rightHollow} material={cut.hollow} />
        </group>
      </group>
      <mesh ref={pit} geometry={cut.pit} material={cut.pitMat} />
    </group>
  );
}
