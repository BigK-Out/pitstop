import { describe, expect, it } from "vitest";
import { progressFor } from "../../src/pitstop/progress";
import { easeInOutCubic, pitStopTimeline, seg } from "../../src/pitstop/timeline";

describe("progressFor", () => {
  it("maps the section's scroll range to 0..1", () => {
    expect(progressFor(0, 3000, 1000)).toBe(0);
    expect(progressFor(-1000, 3000, 1000)).toBe(0.5);
    expect(progressFor(-2000, 3000, 1000)).toBe(1);
  });

  it("clamps before and after the section", () => {
    expect(progressFor(400, 3000, 1000)).toBe(0);
    expect(progressFor(-9000, 3000, 1000)).toBe(1);
  });

  it("returns 0 when the section is not taller than the viewport", () => {
    expect(progressFor(-50, 800, 1000)).toBe(0);
    expect(progressFor(0, 1000, 1000)).toBe(0);
  });
});

describe("seg and easing", () => {
  it("normalises and clamps a segment", () => {
    expect(seg(0.2, 0.3, 0.5)).toBe(0);
    expect(seg(0.4, 0.3, 0.5)).toBeCloseTo(0.5);
    expect(seg(0.9, 0.3, 0.5)).toBe(1);
  });

  it("eases in and out symmetrically", () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(0.5)).toBe(0.5);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.25)).toBeCloseTo(1 - easeInOutCubic(0.75));
  });
});

describe("pitStopTimeline", () => {
  it("starts with the intro visible and the cherry whole", () => {
    expect(pitStopTimeline(0)).toEqual({
      introOpacity: 1,
      introShift: 0,
      travel: 0,
      turn: 0.6,
      scale: 1,
      split: 0,
      pitLift: 0,
      revealOpacity: 0,
      revealVisible: false,
    });
  });

  it("has finished the approach at 0.3", () => {
    const t = pitStopTimeline(0.3);
    expect(t.introOpacity).toBe(0);
    expect(t.introShift).toBe(40);
    expect(t.travel).toBe(1);
    expect(t.turn).toBe(0);
    expect(t.scale).toBeCloseTo(1.15);
    expect(t.split).toBe(0);
  });

  it("is half split at 0.475 and fully open with the pit out at 0.75", () => {
    expect(pitStopTimeline(0.475).split).toBeCloseTo(0.5);
    const t = pitStopTimeline(0.75);
    expect(t.split).toBe(1);
    expect(t.pitLift).toBe(1);
    expect(t.revealVisible).toBe(true);
    expect(t.revealOpacity).toBeCloseTo(1 / 3);
  });

  it("reveals the line from 0.7 and fully by 0.85", () => {
    expect(pitStopTimeline(0.69).revealVisible).toBe(false);
    expect(pitStopTimeline(0.7).revealVisible).toBe(true);
    expect(pitStopTimeline(1).revealOpacity).toBe(1);
  });

  it("never runs split or pitLift backwards as p increases", () => {
    let prev = pitStopTimeline(0);
    for (let i = 1; i <= 100; i++) {
      const next = pitStopTimeline(i / 100);
      expect(next.split).toBeGreaterThanOrEqual(prev.split);
      expect(next.pitLift).toBeGreaterThanOrEqual(prev.pitLift);
      prev = next;
    }
  });
});
