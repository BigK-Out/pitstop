import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "../../src/App";

vi.mock("../../src/scene/webgl", () => ({ hasWebGL: () => false }));

describe("App", () => {
  it("renders the page structure", () => {
    render(<App />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
    expect(screen.getByRole("heading", { name: "Pick your pouch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "From orchard to pouch" })).toBeInTheDocument();
    expect(screen.getByText("Is this a real shop?")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Add to cart: / })).toHaveLength(4);
  });

  it("adding a product updates the badge and announces it", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole("button", { name: "Cart, 0 items" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add to cart: Classic Dried" }));
    expect(screen.getByRole("button", { name: "Cart, 1 item" })).toBeInTheDocument();
    expect(await screen.findByText("Added Classic Dried to cart")).toBeInTheDocument();
  });
});
