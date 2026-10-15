import * as THREE from "three";
import { CUT_RY, CUT_RZ, SPLIT_X } from "./cherryModel";

// A flat ellipse in the YZ plane at x = offsetX. rotateY(+π/2) faces +x, rotateY(-π/2) faces -x.
const cut = (rz, ry, angle, offsetX) =>
  new THREE.CircleGeometry(1, 64).scale(rz, ry, 1).rotateY(angle).translate(offsetX, 0, 0);

// The inside of the split cherry: cut faces, the hollow left by the pit, and the pit itself.
// The skin is the cherry model, clipped into two halves in HeroCherry.
export function createCutParts() {
  return {
    leftFace: cut(CUT_RZ, CUT_RY, Math.PI / 2, SPLIT_X),
    rightFace: cut(CUT_RZ, CUT_RY, -Math.PI / 2, SPLIT_X),
    leftHollow: cut(CUT_RZ * 0.42, CUT_RY * 0.55, Math.PI / 2, SPLIT_X + 0.004),
    rightHollow: cut(CUT_RZ * 0.42, CUT_RY * 0.55, -Math.PI / 2, SPLIT_X - 0.004),
    pit: new THREE.SphereGeometry(1, 32, 24).scale(0.36, 0.48, 0.36),
    flesh: new THREE.MeshStandardMaterial({
      color: "#7e1022",
      roughness: 0.8,
      envMapIntensity: 0.25,
      side: THREE.DoubleSide,
    }),
    hollow: new THREE.MeshStandardMaterial({
      color: "#3a0610",
      roughness: 0.9,
      envMapIntensity: 0.2,
      side: THREE.DoubleSide,
    }),
    pitMat: new THREE.MeshStandardMaterial({
      color: "#a8804f",
      roughness: 0.75,
      envMapIntensity: 0.4,
    }),
  };
}
