import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Banana from "./Banana";
import { DepthOfField, EffectComposer } from "@react-three/postprocessing";
import "./App.css";

// Camera sits at z = 20 looking down -z. Bananas are spread from
// z = NEAR_Z (closest) to NEAR_Z - depth (farthest), all in front of the camera.
const NEAR_Z = 10;

function Scene({ count, depth }) {
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <Banana key={i} index={i} count={count} depth={depth} nearZ={NEAR_Z} />
      ))}

      <EffectComposer>
        <DepthOfField
          target={[0, 0, NEAR_Z - depth / 2]}
          focalLength={0.5}
          bokehScale={11}
          height={700}
        />
      </EffectComposer>
    </group>
  );
}

export default function App() {
  const count = 100;
  const depth = 80;

  return (
    <Canvas
      camera={{ position: [0, 0, 20], fov: 30, near: 0.1, far: 110 }}
      gl={{ alpha: false }}
    >
      <color attach="background" args={["#FDB750"]} />

      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 10]} intensity={2.5} />

      <Suspense fallback={null}>
        <Scene count={count} depth={depth} />
      </Suspense>
    </Canvas>
  );
}
