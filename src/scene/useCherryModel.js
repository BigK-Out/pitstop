import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MODEL_URL, normalizeFruit } from "./cherryModel";

// The cherry model's geometry (normalised) and material. Suspends while loading; shared by
// the hero and the floaters through useLoader's cache.
export function useCherryModel() {
  const gltf = useLoader(GLTFLoader, MODEL_URL);
  return useMemo(() => {
    let mesh = null;
    gltf.scene.traverse((object) => {
      if (!mesh && object.isMesh) mesh = object;
    });
    return { geometry: normalizeFruit(mesh.geometry), material: mesh.material };
  }, [gltf]);
}
