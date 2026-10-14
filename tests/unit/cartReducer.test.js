import { describe, expect, it } from "vitest";
import { MAX_QTY, cartReducer, initialCart } from "../../src/cart/cartReducer";

const run = (...actions) => actions.reduce(cartReducer, initialCart);

describe("cartReducer", () => {
  it("adds items and increments quantity", () => {
    expect(run({ type: "add", id: "classic" }, { type: "add", id: "classic" })).toEqual({
      items: { classic: 2 },
    });
  });

  it("sets quantity, and removes the item at 0 or below", () => {
    expect(run({ type: "add", id: "sour" }, { type: "setQty", id: "sour", qty: 5 })).toEqual({
      items: { sour: 5 },
    });
    expect(run({ type: "add", id: "sour" }, { type: "setQty", id: "sour", qty: 0 })).toEqual({
      items: {},
    });
    expect(run({ type: "add", id: "sour" }, { type: "setQty", id: "sour", qty: -3 })).toEqual({
      items: {},
    });
  });

  it("caps quantity at 99", () => {
    expect(MAX_QTY).toBe(99);
    expect(run({ type: "setQty", id: "choc", qty: 500 })).toEqual({ items: { choc: 99 } });
    const atMax = run({ type: "setQty", id: "choc", qty: 99 });
    expect(cartReducer(atMax, { type: "add", id: "choc" })).toEqual({ items: { choc: 99 } });
  });

  it("floors fractional quantities and ignores non-numeric ones", () => {
    expect(run({ type: "setQty", id: "mixed", qty: 2.7 })).toEqual({ items: { mixed: 2 } });
    const state = run({ type: "add", id: "mixed" });
    expect(cartReducer(state, { type: "setQty", id: "mixed", qty: "lots" })).toBe(state);
  });

  it("removes, clears and replaces", () => {
    const state = run({ type: "add", id: "classic" }, { type: "add", id: "sour" });
    expect(cartReducer(state, { type: "remove", id: "classic" })).toEqual({ items: { sour: 1 } });
    expect(cartReducer(state, { type: "clear" })).toEqual({ items: {} });
    const other = { items: { choc: 3 } };
    expect(cartReducer(state, { type: "replace", cart: other })).toBe(other);
  });

  it("does not mutate the previous state", () => {
    const state = run({ type: "add", id: "classic" });
    cartReducer(state, { type: "add", id: "classic" });
    expect(state).toEqual({ items: { classic: 1 } });
  });

  it("returns the same state for unknown actions", () => {
    expect(cartReducer(initialCart, { type: "nope" })).toBe(initialCart);
  });
});
