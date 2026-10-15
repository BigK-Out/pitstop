import * as THREE from "three";

const v = (x, y, z) => new THREE.Vector3(x, y, z);
const SQUASH = 0.92;

// SphereGeometry's phi runs around Y with x = -cos(phi): phi in [-π/2, π/2] is the x ≤ 0 half.
const skinHalf = (phiStart) =>
  new THREE.SphereGeometry(1, 64, 48, phiStart, Math.PI).scale(1, SQUASH, 1);

// A disc in the YZ plane; rotateY(+π/2) faces +x, rotateY(-π/2) faces -x.
const disc = (radius, yScale, angle, offsetX) =>
  new THREE.CircleGeometry(radius, 64).scale(1, yScale, 1).rotateY(angle).translate(offsetX, 0, 0);

// Geometries and materials for the splitting hero cherry. Built once per scene.
export function createHeroCherryParts() {
  return {
    leftSkin: skinHalf(-Math.PI / 2),
    rightSkin: skinHalf(Math.PI / 2),
    leftFace: disc(1, SQUASH, Math.PI / 2, 0),
    rightFace: disc(1, SQUASH, -Math.PI / 2, 0),
    leftHollow: disc(0.42, 1.3, Math.PI / 2, 0.004),
    rightHollow: disc(0.42, 1.3, -Math.PI / 2, -0.004),
    pit: new THREE.SphereGeometry(1, 32, 24).scale(0.42, 0.55, 0.42),
    stem: new THREE.TubeGeometry(
      new THREE.QuadraticBezierCurve3(v(0, 0.8, 0), v(0.05, 1.5, 0), v(0.3, 2.05, 0)),
      24,
      0.04,
      8,
    ),
    leaf: new THREE.SphereGeometry(0.32, 16, 12)
      .scale(1, 0.14, 0.5)
      .rotateZ(-0.5)
      .translate(0.62, 2.05, 0),
    skin: new THREE.MeshPhysicalMaterial({
      color: "#c3142f",
      roughness: 0.28,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
    }),
    flesh: new THREE.MeshStandardMaterial({
      color: "#7a0b1f",
      roughness: 0.7,
      side: THREE.DoubleSide,
    }),
    hollow: new THREE.MeshStandardMaterial({
      color: "#4a0a14",
      roughness: 0.9,
      side: THREE.DoubleSide,
    }),
    pitMat: new THREE.MeshStandardMaterial({ color: "#c9a777", roughness: 0.6 }),
    stemMat: new THREE.MeshStandardMaterial({ color: "#6b8f3a", roughness: 0.7 }),
    leafMat: new THREE.MeshStandardMaterial({
      color: "#7cb553",
      roughness: 0.6,
      side: THREE.DoubleSide,
    }),
  };
}
