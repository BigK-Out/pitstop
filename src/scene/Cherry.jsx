import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

// One floating cherry: drifts upward, wraps from top to bottom, spins slowly.
export default function Cherry({ index, count, depth, nearZ, children }) {
  const ref = useRef();
  const { viewport, camera } = useThree();
  const z = nearZ - (index / count) * depth;

  // Visible area at this cherry's depth; recomputed when the window resizes.
  const vp = useMemo(
    () => viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, z)),
    [viewport, camera, z],
  );

  const [data] = useState(() => ({
    x: THREE.MathUtils.randFloatSpread(vp.width),
    y: THREE.MathUtils.randFloatSpread(vp.height),
    rx: Math.random() * Math.PI * 2,
    ry: Math.random() * Math.PI * 2,
    rz: Math.random() * Math.PI * 2,
    s: Math.random() * 0.5 + 0.35,
    // Radians per second
    spinX: (Math.random() - 0.5) * 1.2,
    spinY: (Math.random() - 0.5) * 1.2,
    spinZ: (Math.random() - 0.5) * 1.2,
  }));

  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 0.8;
    const h = vp.height / 1.5;
    ref.current.position.y = THREE.MathUtils.euclideanModulo(data.y + t + h, 2 * h) - h;
    ref.current.rotation.x += data.spinX * delta;
    ref.current.rotation.y += data.spinY * delta;
    ref.current.rotation.z += data.spinZ * delta;
  });

  return (
    <group
      ref={ref}
      position={[data.x, data.y, z]}
      rotation={[data.rx, data.ry, data.rz]}
      scale={data.s}
    >
      {children}
    </group>
  );
}
