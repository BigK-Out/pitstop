import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "../../src/App";

vi.mock("../../src/scene/webgl", () => ({ hasWebGL: () => false }));

// getByText only reads an element's own text nodes, so copy split by <em> needs textContent.
const byFullText = (text) => (_, el) => el.tagName === "P" && el.textContent === text;

describe("App", () => {
  it("renders the editorial page structure", () => {
    const { container } = render(<App />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Cherries, slowly sun-dried." }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
    expect(screen.getByText(byFullText("We took the pit out."))).toBeInTheDocument();
    expect(screen.getByText(byFullText("Cherries. That's the list."))).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pick your pouch" })).toBeInTheDocument();
    expect(screen.getByText("4 pouches · from $8.99")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "From orchard to pouch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Good to know." })).toBeInTheDocument();
    expect(screen.getByText("Is this a real shop?")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Add to bag: / })).toHaveLength(4);
    expect(screen.getByText("Fig. 03")).toBeInTheDocument();
    for (const id of ["top", "shop", "orchard", "faq"]) {
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it("shows the static split-cherry art when WebGL is unavailable", () => {
    const { container } = render(<App />);
    const hero = container.querySelector("#top");
    expect(hero).toHaveClass("pitstop--static");
    expect(hero).toHaveAttribute("data-revealed");
    const art = hero.querySelector(".pitstop-canvas svg.pitstop-art");
    expect(art).not.toBeNull();
    expect(art).toHaveAttribute("aria-label", "A cherry split in half with its pit lifted out");
  });

  it("adding a product updates the bag and announces it", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole("button", { name: "Bag 0 items" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add to bag: Classic Dried" }));
    expect(screen.getByRole("button", { name: "Bag 1 item" })).toBeInTheDocument();
    expect(await screen.findByText("Added Classic Dried to bag")).toBeInTheDocument();
  });
});
