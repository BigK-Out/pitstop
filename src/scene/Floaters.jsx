import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useCherryModel } from "./useCherryModel";

const rand = (min, max) => min + Math.random() * (max - min);
const TAN = Math.tan(THREE.MathUtils.degToRad(15)); // camera fov 30 at distance 12 - z
const CAMERA_Z = 12;
const { smoothstep } = THREE.MathUtils;

// Floaters keep out of the copy: the left column on landscape screens, the bottom reveal band always.
const bandFade = (ny) => smoothstep(ny, -0.55, -0.3);

// Portrait frames put the copy in the top ~45%, so floaters fade out there too.
const topFade = (ny) => 1 - smoothstep(ny, 0.1, 0.35);

// Small cherries (the same model as the hero) drifting upward behind the hero cherry; fog fades the distant ones.
// Positions are stored in screen-normalised units so any aspect ratio gets the same spread.
export default function Floaters({ count, animate }) {
  const refs = useRef([]);
  const { geometry, material } = useCherryModel();
  const aspect = useThree((state) => state.viewport.aspect);
  const wide = aspect >= 1.3;
  const items = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        nx: rand(-0.95, 0.95),
        ny: rand(-1.1, 1.1),
        z: wide ? rand(-16, -5) : rand(-18, -10), // portrait: copy overlaps, so keep floaters deep in the fog
        scale: rand(0.22, 0.42),
        rotation: [rand(0, Math.PI * 2), rand(0, Math.PI * 2), rand(0, Math.PI * 2)],
        spin: [rand(-0.3, 0.3), rand(-0.3, 0.3), rand(-0.3, 0.3)],
        drift: rand(0.03, 0.08),
      })),
    [count, wide],
  );

  const place = (item, group, time) => {
    const halfH = (CAMERA_Z - item.z) * TAN;
    const ny = THREE.MathUtils.euclideanModulo(item.ny + time * item.drift + 1.1, 2.2) - 1.1;
    const nx = wide ? -0.1 + ((item.nx + 0.95) / 1.9) * 1.05 : item.nx;
    group.position.set(nx * halfH * aspect, ny * halfH, item.z);
    group.scale.setScalar(item.scale * bandFade(ny) * (wide ? 1 : topFade(ny)));
  };

  useFrame(({ clock }, delta) => {
    items.forEach((item, i) => {
      const group = refs.current[i];
      if (!group) return;
      place(item, group, animate ? clock.elapsedTime : 0);
      if (!animate) return;
      group.rotation.x += item.spin[0] * delta;
      group.rotation.y += item.spin[1] * delta;
      group.rotation.z += item.spin[2] * delta;
    });
  });

  return items.map((item, i) => (
    <group key={i} ref={(el) => (refs.current[i] = el)} rotation={item.rotation} scale={0}>
      <mesh geometry={geometry} material={material} />
    </group>
  ));
}
