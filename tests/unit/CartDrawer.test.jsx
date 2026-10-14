import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../../src/App";
import { STORAGE_KEY } from "../../src/cart/CartContext";
import { makeOrderNumber } from "../../src/cart/CheckoutDialog";

async function openCartWith(user, ...names) {
  for (const name of names) {
    await user.click(screen.getByRole("button", { name: `Add to cart: ${name}` }));
  }
  await user.click(screen.getByRole("button", { name: /^Cart, / }));
  return screen.getByRole("dialog", { name: "Your cart" });
}

describe("cart drawer", () => {
  it("shows lines and updates totals", async () => {
    const user = userEvent.setup();
    render(<App />);
    const drawer = await openCartWith(user, "Classic Dried", "Sour Punch");
    expect(drawer).toHaveAttribute("open");
    await user.click(within(drawer).getByRole("button", { name: "Increase Classic Dried" }));
    expect(within(drawer).getByText("$17.98")).toBeInTheDocument();
    expect(within(drawer).getByText("$27.47")).toBeInTheDocument();
  });

  it("decreasing the last unit removes the line and keeps focus in the drawer", async () => {
    const user = userEvent.setup();
    render(<App />);
    const drawer = await openCartWith(user, "Classic Dried");
    await user.click(within(drawer).getByRole("button", { name: "Decrease Classic Dried" }));
    expect(within(drawer).getByText("Your cart is empty.")).toBeInTheDocument();
    expect(within(drawer).getByRole("heading", { name: "Your cart" })).toHaveFocus();
  });

  it("removes a line with the remove button", async () => {
    const user = userEvent.setup();
    render(<App />);
    const drawer = await openCartWith(user, "Classic Dried", "Sour Punch");
    await user.click(within(drawer).getByRole("button", { name: "Remove Sour Punch" }));
    expect(within(drawer).queryByText("Sour Punch")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cart, 1 item" })).toBeInTheDocument();
  });

  it("disables increase at 99", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: { classic: 99 } }));
    const user = userEvent.setup();
    render(<App />);
    const drawer = await openCartWith(user);
    expect(within(drawer).getByRole("button", { name: "Increase Classic Dried" })).toBeDisabled();
  });

  it("closes with the close button", async () => {
    const user = userEvent.setup();
    render(<App />);
    const drawer = await openCartWith(user, "Classic Dried");
    await user.click(within(drawer).getByRole("button", { name: "Close cart" }));
    expect(drawer).not.toHaveAttribute("open");
  });
});

describe("checkout", () => {
  it("places a demo order and empties the cart", async () => {
    const user = userEvent.setup();
    render(<App />);
    const drawer = await openCartWith(user, "Dark Choc-Dipped");
    await user.click(within(drawer).getByRole("button", { name: "Checkout" }));
    const checkout = screen.getByRole("dialog", { name: "Checkout" });
    expect(within(checkout).getByText("1 × Dark Choc-Dipped")).toBeInTheDocument();
    await user.click(within(checkout).getByRole("button", { name: "Place demo order" }));
    expect(within(checkout).getByRole("heading", { name: /order placed/ })).toBeInTheDocument();
    expect(within(checkout).getByText(/^PIT-\d{6}$/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cart, 0 items" })).toBeInTheDocument();
    await user.click(within(checkout).getByRole("button", { name: "Back to the shop" }));
    expect(checkout).not.toHaveAttribute("open");
  });

  it("makes six-digit order numbers", () => {
    expect(makeOrderNumber(() => 0)).toBe("PIT-100000");
    expect(makeOrderNumber(() => 0.999999)).toBe("PIT-999999");
  });
});
