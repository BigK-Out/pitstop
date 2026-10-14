import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const RED = new THREE.Color("#b3132b");
const STEM = new THREE.Color("#3f7d20");
const LEAF = new THREE.Color("#5aa12e");

function paint(geometry, color) {
  const count = geometry.getAttribute("position").count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) color.toArray(colors, i * 3);
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

const v = (x, y, z) => new THREE.Vector3(x, y, z);

// Two cherries, two stems and a leaf merged into one geometry: one draw call per cherry.
export function createCherryGeometry() {
  const parts = [
    paint(new THREE.SphereGeometry(0.5, 24, 16).translate(-0.45, -0.6, 0), RED),
    paint(new THREE.SphereGeometry(0.46, 24, 16).translate(0.5, -0.7, 0.1), RED),
    paint(
      new THREE.TubeGeometry(
        new THREE.QuadraticBezierCurve3(v(-0.45, -0.15, 0), v(-0.3, 0.6, 0), v(0.1, 1, 0)),
        16,
        0.04,
        6,
      ),
      STEM,
    ),
    paint(
      new THREE.TubeGeometry(
        new THREE.QuadraticBezierCurve3(v(0.5, -0.28, 0.1), v(0.45, 0.5, 0.05), v(0.1, 1, 0)),
        16,
        0.04,
        6,
      ),
      STEM,
    ),
    paint(
      new THREE.SphereGeometry(0.3, 12, 8)
        .scale(1, 0.15, 0.5)
        .rotateZ(-0.5)
        .translate(0.4, 1.05, 0),
      LEAF,
    ),
  ];
  const merged = mergeGeometries(parts);
  parts.forEach((part) => part.dispose());
  merged.center();
  return merged;
}
