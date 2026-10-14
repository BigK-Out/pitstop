import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Component, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const MODEL_URL = "/banana.glb";

// Uses the first mesh found in the model, so it works whatever the
// mesh/material are named inside the .glb.
function BananaModel(props) {
  const { scene } = useGLTF(MODEL_URL);
  const mesh = useMemo(() => {
    let found = null;
    scene.traverse((o) => {
      if (!found && o.isMesh) found = o;
    });
    return found;
  }, [scene]);

  if (!mesh) return null;

  return (
    <group {...props} dispose={null}>
      <mesh geometry={mesh.geometry} material={mesh.material} />
    </group>
  );
}

// Yellow capsule shown while public/banana.glb is missing or fails to load.
function PlaceholderModel(props) {
  return (
    <mesh {...props} rotation-z={Math.PI / 4}>
      <capsuleGeometry args={[0.4, 1.6, 8, 16]} />
      <meshStandardMaterial color="#f5d142" />
    </mesh>
  );
}

class ModelBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

useGLTF.preload(MODEL_URL);

export default function Banana({ index, count, depth, nearZ }) {
  const ref = useRef();
  const { viewport, camera } = useThree();
  const z = nearZ - (index / count) * depth;

  // Visible area at this banana's depth; recomputed when the window resizes.
  const vp = useMemo(
    () => viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, z)),
    [viewport, camera, z]
  );

  // Initialize with random data
  const [data] = useState(() => ({
    x: THREE.MathUtils.randFloatSpread(vp.width),
    y: THREE.MathUtils.randFloatSpread(vp.height),
    rx: Math.random() * Math.PI * 2,
    ry: Math.random() * Math.PI * 2,
    rz: Math.random() * Math.PI * 2,
    s: Math.random() * 0.5 + 0.25,
    // Radians per second
    rotationSpeedX: (Math.random() - 0.5) * 1.2,
    rotationSpeedY: (Math.random() - 0.5) * 1.2,
    rotationSpeedZ: (Math.random() - 0.5) * 1.2,
  }));

  useFrame(({ clock }, delta) => {
    if (!ref.current) return;

    const t = clock.elapsedTime * 0.8; // Speed of upward motion
    const h = vp.height / 1.5;

    // Upward motion, wrapping from top (+h) back to bottom (-h)
    ref.current.position.y = THREE.MathUtils.euclideanModulo(data.y + t + h, 2 * h) - h;

    // Continuous spinning, independent of frame rate
    ref.current.rotation.x += data.rotationSpeedX * delta;
    ref.current.rotation.y += data.rotationSpeedY * delta;
    ref.current.rotation.z += data.rotationSpeedZ * delta;
  });

  return (
    <group
      ref={ref}
      position={[data.x, data.y, z]}
      rotation={[data.rx, data.ry, data.rz]}
      scale={data.s}
    >
      <ModelBoundary fallback={<PlaceholderModel scale={0.5} />}>
        <BananaModel scale={0.5} />
      </ModelBoundary>
    </group>
  );
}
