import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App";

vi.mock("../../src/scene/webgl", () => ({ hasWebGL: () => true }));

const mockMatchMedia = (reduce) =>
  vi.stubGlobal("matchMedia", (query) => ({
    matches: reduce && query.includes("reduce"),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }));

afterEach(() => vi.unstubAllGlobals());

describe("Hero motion modes", () => {
  it("pins and scrubs when motion is allowed", () => {
    mockMatchMedia(false);
    const { container } = render(<App />);
    const hero = container.querySelector("#top");
    expect(hero).not.toHaveClass("pitstop--static");
    expect(hero).not.toHaveAttribute("data-revealed");
  });

  it("reduced motion shows the final frame without pinning", () => {
    mockMatchMedia(true);
    const { container } = render(<App />);
    const hero = container.querySelector("#top");
    expect(hero).toHaveClass("pitstop--static");
    expect(hero).toHaveAttribute("data-revealed");
  });
});
