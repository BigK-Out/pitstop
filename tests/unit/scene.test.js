import { describe, expect, it } from "vitest";
import { createCherryGeometry } from "../../src/scene/cherryGeometry";
import { createHeroCherryParts } from "../../src/scene/heroGeometry";
import { pickTier } from "../../src/scene/sceneTier";

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

describe("createCherryGeometry", () => {
  it("builds one centred geometry with vertex colours", () => {
    const geometry = createCherryGeometry();
    expect(geometry.getAttribute("color").count).toBe(geometry.getAttribute("position").count);
    geometry.computeBoundingBox();
    const center = geometry.boundingBox.getCenter(geometry.boundingBox.min.clone());
    expect(center.length()).toBeLessThan(1e-6);
  });
});

describe("createHeroCherryParts", () => {
  const parts = createHeroCherryParts();

  it("builds every geometry and material", () => {
    for (const key of [
      "leftSkin",
      "rightSkin",
      "leftFace",
      "rightFace",
      "leftHollow",
      "rightHollow",
      "pit",
      "stem",
      "leaf",
    ]) {
      expect(parts[key].getAttribute("position").count, key).toBeGreaterThan(0);
    }
    for (const key of ["skin", "flesh", "hollow", "pitMat", "stemMat", "leafMat"]) {
      expect(parts[key].isMaterial, key).toBe(true);
    }
  });

  it("splits the skin on the vertical plane: left half x ≤ 0, right half x ≥ 0", () => {
    parts.leftSkin.computeBoundingBox();
    parts.rightSkin.computeBoundingBox();
    expect(parts.leftSkin.boundingBox.max.x).toBeLessThan(1e-6);
    expect(parts.rightSkin.boundingBox.min.x).toBeGreaterThan(-1e-6);
  });

  it("faces the cut surfaces outward along x", () => {
    const leftNormal = parts.leftFace.getAttribute("normal");
    const rightNormal = parts.rightFace.getAttribute("normal");
    expect(leftNormal.getX(0)).toBeCloseTo(1);
    expect(rightNormal.getX(0)).toBeCloseTo(-1);
  });
});
