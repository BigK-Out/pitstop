import * as THREE from "three";

export const MODEL_URL = `${import.meta.env.BASE_URL}cherry.glb`;

// Measured from public/cherry.glb (model units): centre of the fruit body, excluding the stem.
export const FRUIT_CENTER = [0.005, 0.565, 0.02];
// Brings the body to roughly unit radius, the size the scene was laid out for.
export const FRUIT_SCALE = 1.55;
// Cut plane (normalised units), just left of the stem so the stem stays whole on the right half.
export const SPLIT_X = -0.12 * FRUIT_SCALE;
// Half-height and half-depth of the cut faces: just inside the fruit's cross-section at the cut.
export const CUT_RY = 0.54 * FRUIT_SCALE;
export const CUT_RZ = 0.5 * FRUIT_SCALE;

// Copy of the model geometry with the fruit body centred on the origin and scaled.
export function normalizeFruit(geometry) {
  return geometry
    .clone()
    .translate(-FRUIT_CENTER[0], -FRUIT_CENTER[1], -FRUIT_CENTER[2])
    .scale(FRUIT_SCALE, FRUIT_SCALE, FRUIT_SCALE);
}

// Local-space planes for the two halves. three.js discards fragments with negative distance,
// so the left plane keeps x ≤ splitX and the right plane keeps x ≥ splitX.
export function halfClipPlanes(splitX = SPLIT_X) {
  return {
    left: new THREE.Plane(new THREE.Vector3(-1, 0, 0), splitX),
    right: new THREE.Plane(new THREE.Vector3(1, 0, 0), -splitX),
  };
}
