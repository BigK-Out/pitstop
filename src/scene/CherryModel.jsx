import { Clone, useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

export const MODEL_URL = `${import.meta.env.BASE_URL}cherry.glb`;
const TARGET_SIZE = 2;

// Renders the user's cherry.glb, scaled so its largest side is TARGET_SIZE and centred,
// whatever units or pivot the file was exported with. Geometry/materials are shared.
export default function CherryModel(props) {
  const { scene } = useGLTF(MODEL_URL);

  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    return {
      scale: TARGET_SIZE / Math.max(size.x, size.y, size.z, 1e-6),
      offset: center.multiplyScalar(-1),
    };
  }, [scene]);

  return (
    <group {...props} scale={scale}>
      <Clone object={scene} position={offset} />
    </group>
  );
}
