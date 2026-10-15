import { afterEach, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import {
  CUT_RY,
  CUT_RZ,
  FRUIT_CENTER,
  FRUIT_SCALE,
  SPLIT_X,
  halfClipPlanes,
  normalizeFruit,
} from "../../src/scene/cherryModel";
import { createCutParts } from "../../src/scene/heroGeometry";
import { pickTier } from "../../src/scene/sceneTier";
import { isSoftwareRenderer } from "../../src/scene/webgl";

describe("pickTier", () => {
  it("uses the full scene on capable desktops", () => {
    expect(pickTier({ width: 1440, cores: 8, reducedMotion: false })).toEqual({
      floaters: 24,
      dpr: [1, 1.75],
      animate: true,
    });
  });

  it("uses the light scene on narrow screens or few cores", () => {
    const light = { floaters: 12, dpr: [1, 1.5], animate: true };
    expect(pickTier({ width: 375, cores: 8, reducedMotion: false })).toEqual(light);
    expect(pickTier({ width: 1440, cores: 4, reducedMotion: false })).toEqual(light);
  });

  it("assumes a capable device when core count is unknown", () => {
    expect(pickTier({ width: 1440, cores: undefined, reducedMotion: false }).floaters).toBe(24);
  });

  it("stops animation for reduced motion", () => {
    expect(pickTier({ width: 1440, cores: 8, reducedMotion: true }).animate).toBe(false);
  });
});

describe("pickTier software renderer", () => {
  it("renders the lite tier on demand", () => {
    expect(pickTier({ width: 1440, cores: 8, reducedMotion: false, software: true })).toEqual({
      floaters: 12,
      dpr: [1, 1],
      animate: false,
    });
  });
});

describe("isSoftwareRenderer", () => {
  afterEach(() => vi.restoreAllMocks());

  const stub = (renderer) =>
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      getExtension: (n) =>
        n === "WEBGL_debug_renderer_info" ? { UNMASKED_RENDERER_WEBGL: 1 } : { loseContext() {} },
      getParameter: () => renderer,
      RENDERER: 2,
    });

  it("detects SwiftShader", () => {
    stub("ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)))");
    expect(isSoftwareRenderer()).toBe(true);
  });

  it("accepts a hardware GPU", () => {
    stub("ANGLE (NVIDIA GeForce RTX 3060)");
    expect(isSoftwareRenderer()).toBe(false);
  });

  it("returns false without WebGL", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(isSoftwareRenderer()).toBe(false);
  });
});

describe("normalizeFruit", () => {
  it("centres the fruit body on the origin and scales it, leaving the source untouched", () => {
    const source = new THREE.BoxGeometry(1, 1, 1).translate(...FRUIT_CENTER);
    const fruit = normalizeFruit(source);
    fruit.computeBoundingBox();
    const center = fruit.boundingBox.getCenter(new THREE.Vector3());
    const size = fruit.boundingBox.getSize(new THREE.Vector3());
    expect(center.length()).toBeLessThan(1e-6);
    expect(size.x).toBeCloseTo(FRUIT_SCALE);
    source.computeBoundingBox();
    expect(source.boundingBox.getCenter(new THREE.Vector3()).y).toBeCloseTo(FRUIT_CENTER[1]);
  });
});

describe("halfClipPlanes", () => {
  const { left, right } = halfClipPlanes();
  const at = (x) => new THREE.Vector3(x, 0.3, -0.2);

  it("keeps x ≤ SPLIT_X on the left half and x ≥ SPLIT_X on the right half", () => {
    // three.js clips points whose signed distance is negative.
    expect(left.distanceToPoint(at(SPLIT_X - 0.5))).toBeGreaterThan(0);
    expect(left.distanceToPoint(at(SPLIT_X + 0.5))).toBeLessThan(0);
    expect(right.distanceToPoint(at(SPLIT_X + 0.5))).toBeGreaterThan(0);
    expect(right.distanceToPoint(at(SPLIT_X - 0.5))).toBeLessThan(0);
    expect(left.distanceToPoint(at(SPLIT_X))).toBeCloseTo(0);
  });
});

describe("createCutParts", () => {
  const parts = createCutParts();

  it("places both cut faces on the split plane, facing outward along x", () => {
    for (const [key, sign] of [
      ["leftFace", 1],
      ["rightFace", -1],
    ]) {
      const face = parts[key];
      face.computeBoundingBox();
      expect(face.boundingBox.min.x, key).toBeCloseTo(SPLIT_X);
      expect(face.boundingBox.max.x, key).toBeCloseTo(SPLIT_X);
      expect(face.getAttribute("normal").getX(0), key).toBeCloseTo(sign);
    }
  });

  it("sizes the faces to the fruit's cross-section", () => {
    parts.leftFace.computeBoundingBox();
    const size = parts.leftFace.boundingBox.getSize(new THREE.Vector3());
    expect(size.y).toBeCloseTo(2 * CUT_RY, 2);
    expect(size.z).toBeCloseTo(2 * CUT_RZ, 2);
  });

  it("builds the pit and every material", () => {
    expect(parts.pit.getAttribute("position").count).toBeGreaterThan(0);
    for (const key of ["flesh", "hollow", "pitMat"]) {
      expect(parts[key].isMaterial, key).toBe(true);
    }
  });
});
