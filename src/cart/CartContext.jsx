import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { cartReducer, initialCart } from "./cartReducer";
import { itemCount, lineItems, subtotalCents } from "./selectors";

export const STORAGE_KEY = "pitstop-cart-v1";

const CartContext = createContext(null);

// Turn whatever is stored into a valid cart; unknown ids and bad quantities are dropped.
export function parseCart(raw, products) {
  try {
    const items = JSON.parse(raw)?.items;
    if (!items || typeof items !== "object" || Array.isArray(items)) return initialCart;
    const known = new Set(products.map((p) => p.id));
    return Object.entries(items).reduce(
      (cart, [id, qty]) => (known.has(id) ? cartReducer(cart, { type: "setQty", id, qty }) : cart),
      initialCart,
    );
  } catch {
    return initialCart;
  }
}

function readStorage() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStorage(cart) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Storage unavailable (private mode, quota): the cart still works for this session.
  }
}

export function CartProvider({ products, children }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, () =>
    parseCart(readStorage(), products),
  );

  useEffect(() => writeStorage(cart), [cart]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== null && event.key !== STORAGE_KEY) return;
      dispatch({ type: "replace", cart: parseCart(event.newValue, products) });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [products]);

  const value = useMemo(
    () => ({
      cart,
      products,
      count: itemCount(cart),
      lines: lineItems(cart, products),
      subtotalCents: subtotalCents(cart, products),
      add: (id) => dispatch({ type: "add", id }),
      setQty: (id, qty) => dispatch({ type: "setQty", id, qty }),
      remove: (id) => dispatch({ type: "remove", id }),
      clear: () => dispatch({ type: "clear" }),
    }),
    [cart, products],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
