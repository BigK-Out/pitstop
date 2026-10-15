import * as THREE from "three";
import { createCherryGeometry } from "./cherryGeometry";

let shared;
function getShared() {
  shared ??= {
    geometry: createCherryGeometry(),
    material: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35 }),
  };
  return shared;
}

// Small floating cherry: one merged geometry and material shared by every instance.
export default function ProceduralCherry(props) {
  const { geometry, material } = getShared();
  return <mesh {...props} geometry={geometry} material={material} dispose={null} />;
}
