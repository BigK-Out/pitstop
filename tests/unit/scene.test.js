import { describe, expect, it } from "vitest";
import { createCherryGeometry } from "../../src/scene/cherryGeometry";
import { pickTier } from "../../src/scene/sceneTier";
import { modelExists } from "../../src/scene/modelExists";

describe("pickTier", () => {
  it("uses the full scene on capable desktops", () => {
    expect(pickTier({ width: 1440, cores: 8, reducedMotion: false })).toEqual({
      count: 100,
      depthOfField: true,
      animate: true,
    });
  });

  it("uses the light scene on narrow screens or few cores", () => {
    const light = { count: 40, depthOfField: false, animate: true };
    expect(pickTier({ width: 375, cores: 8, reducedMotion: false })).toEqual(light);
    expect(pickTier({ width: 1440, cores: 4, reducedMotion: false })).toEqual(light);
  });

  it("assumes a capable device when core count is unknown", () => {
    expect(pickTier({ width: 1440, cores: undefined, reducedMotion: false }).count).toBe(100);
  });

  it("stops animation for reduced motion", () => {
    expect(pickTier({ width: 1440, cores: 8, reducedMotion: true }).animate).toBe(false);
  });
});

describe("createCherryGeometry", () => {
  it("builds one centred geometry with vertex colours", () => {
    const geometry = createCherryGeometry();
    expect(geometry).not.toBeNull();
    expect(geometry.getAttribute("position").count).toBeGreaterThan(0);
    expect(geometry.getAttribute("color").count).toBe(geometry.getAttribute("position").count);
    geometry.computeBoundingBox();
    const center = geometry.boundingBox.getCenter(geometry.boundingBox.min.clone());
    expect(center.length()).toBeLessThan(1e-6);
  });
});

describe("modelExists", () => {
  const reply = (ok, type) => async () => ({ ok, headers: new Headers({ "content-type": type }) });

  it("accepts a real model response", async () => {
    expect(await modelExists("x", reply(true, "model/gltf-binary"))).toBe(true);
  });

  it("treats 404 and html fallbacks as missing", async () => {
    expect(await modelExists("x", reply(false, "text/plain"))).toBe(false);
    expect(await modelExists("x", reply(true, "text/html; charset=utf-8"))).toBe(false);
  });

  it("treats network errors as missing", async () => {
    const boom = async () => {
      throw new Error("offline");
    };
    expect(await modelExists("x", boom)).toBe(false);
  });
});
