import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CartProvider, STORAGE_KEY, parseCart, useCart } from "../../src/cart/CartContext";

const products = [
  { id: "classic", name: "Classic", priceCents: 899 },
  { id: "sour", name: "Sour", priceCents: 949 },
];

const wrapper = ({ children }) => <CartProvider products={products}>{children}</CartProvider>;
const renderCart = () => renderHook(() => useCart(), { wrapper });

describe("CartContext", () => {
  it("exposes count, lines and subtotal", () => {
    const { result } = renderCart();
    act(() => result.current.add("classic"));
    act(() => result.current.setQty("sour", 2));
    expect(result.current.count).toBe(3);
    expect(result.current.lines.map((l) => l.product.id)).toEqual(["classic", "sour"]);
    expect(result.current.subtotalCents).toBe(899 + 2 * 949);
  });

  it("persists changes to localStorage", () => {
    const { result } = renderCart();
    act(() => result.current.add("classic"));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual({ items: { classic: 1 } });
  });

  it("restores the cart on mount", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: { sour: 4 } }));
    const { result } = renderCart();
    expect(result.current.count).toBe(4);
  });

  it("sanitizes corrupt storage", () => {
    expect(parseCart("not json", products)).toEqual({ items: {} });
    expect(parseCart(null, products)).toEqual({ items: {} });
    expect(parseCart(JSON.stringify({ items: "abc" }), products)).toEqual({ items: {} });
    expect(parseCart(JSON.stringify(null), products)).toEqual({ items: {} });
    expect(
      parseCart(JSON.stringify({ items: { classic: -5, ghost: 3, sour: 1000, x: "y" } }), products),
    ).toEqual({ items: { sour: 99 } });
  });

  it("works when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const { result } = renderCart();
    act(() => result.current.add("classic"));
    expect(result.current.count).toBe(1);
  });

  it("syncs from storage events (another tab)", () => {
    const { result } = renderCart();
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: STORAGE_KEY,
          newValue: JSON.stringify({ items: { classic: 2 } }),
        }),
      );
    });
    expect(result.current.count).toBe(2);
  });

  it("throws a clear error outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useCart())).toThrow("useCart must be used inside <CartProvider>");
  });
});
