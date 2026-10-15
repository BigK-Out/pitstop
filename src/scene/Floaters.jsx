import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import ProceduralCherry from "./ProceduralCherry";

const rand = (min, max) => min + Math.random() * (max - min);

// Small cherries drifting upward behind the hero cherry; fog fades the distant ones.
export default function Floaters({ count, animate }) {
  const refs = useRef([]);
  const items = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: rand(-7, 7),
        y: rand(-4.5, 4.5),
        z: rand(-14, -2),
        scale: rand(0.22, 0.42),
        rotation: [rand(0, Math.PI * 2), rand(0, Math.PI * 2), rand(0, Math.PI * 2)],
        spin: [rand(-0.3, 0.3), rand(-0.3, 0.3), rand(-0.3, 0.3)],
        drift: rand(0.08, 0.2),
      })),
    [count],
  );

  useFrame(({ clock }, delta) => {
    if (!animate) return;
    items.forEach((item, i) => {
      const group = refs.current[i];
      if (!group) return;
      group.position.y =
        THREE.MathUtils.euclideanModulo(item.y + clock.elapsedTime * item.drift + 5, 10) - 5;
      group.rotation.x += item.spin[0] * delta;
      group.rotation.y += item.spin[1] * delta;
      group.rotation.z += item.spin[2] * delta;
    });
  });

  return items.map((item, i) => (
    <group
      key={i}
      ref={(el) => (refs.current[i] = el)}
      position={[item.x, item.y, item.z]}
      rotation={item.rotation}
      scale={item.scale}
    >
      <ProceduralCherry />
    </group>
  ));
}
