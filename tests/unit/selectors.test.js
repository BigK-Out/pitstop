import { describe, expect, it } from "vitest";
import { itemCount, lineItems, subtotalCents } from "../../src/cart/selectors";

const products = [
  { id: "a", name: "A", priceCents: 100 },
  { id: "b", name: "B", priceCents: 250 },
];

describe("cart selectors", () => {
  const cart = { items: { b: 2, a: 1 } };

  it("counts all units", () => {
    expect(itemCount(cart)).toBe(3);
    expect(itemCount({ items: {} })).toBe(0);
  });

  it("builds line items in product order and skips unknown ids", () => {
    const lines = lineItems({ items: { ...cart.items, ghost: 4 } }, products);
    expect(lines).toEqual([
      { product: products[0], qty: 1, totalCents: 100 },
      { product: products[1], qty: 2, totalCents: 500 },
    ]);
  });

  it("sums the subtotal", () => {
    expect(subtotalCents(cart, products)).toBe(600);
  });
});
