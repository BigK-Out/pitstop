import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "../../src/App";

vi.mock("../../src/scene/webgl", () => ({ hasWebGL: () => true }));
vi.mock("../../src/scene/Background", () => ({
  default: () => {
    throw new Error("chunk failed");
  },
}));

describe("App when the 3D background fails", () => {
  it("still renders the shop", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<App />);
    // The lazy background resolves and throws after the first paint; wait for that.
    await waitFor(() => expect(logged).toHaveBeenCalled());
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Add to cart: Classic Dried/ })).toBeInTheDocument();
  });
});
