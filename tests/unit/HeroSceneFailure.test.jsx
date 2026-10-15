import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "../../src/App";

vi.mock("../../src/scene/webgl", () => ({ hasWebGL: () => true }));
vi.mock("../../src/scene/PitStopScene", () => ({
  default: () => {
    throw new Error("WebGL context lost");
  },
}));

describe("Hero when the 3D scene fails", () => {
  it("keeps the static art and the shop", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(<App />);
    await waitFor(() => expect(logged).toHaveBeenCalled());
    expect(container.querySelector(".pitstop-canvas svg.pitstop-art")).not.toBeNull();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to bag: Classic Dried" })).toBeInTheDocument();
  });
});
