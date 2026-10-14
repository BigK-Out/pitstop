import { useRef } from "react";
import Modal from "../components/Modal";
import { MAX_QTY } from "./cartReducer";
import { useCart } from "./CartContext";
import { formatPrice } from "./format";

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { lines, subtotalCents, setQty, remove } = useCart();
  const headingRef = useRef(null);

  // When a line disappears its buttons go with it; keep focus inside the drawer.
  const focusHeading = () => headingRef.current?.focus();

  const changeQty = (id, qty, event) => {
    if (qty <= 0) focusHeading();
    // "+" disables itself at the cap; hand focus to the line's "-" so it isn't dropped.
    if (qty >= MAX_QTY) event.currentTarget.parentElement.querySelector("button").focus();
    setQty(id, qty);
  };

  const removeLine = (id) => {
    focusHeading();
    remove(id);
  };

  return (
    <Modal open={open} onClose={onClose} className="drawer" labelledBy="cart-title">
      <div className="drawer-inner">
        <div className="drawer-head">
          <h2 id="cart-title" ref={headingRef} tabIndex={-1}>
            Your cart
          </h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close cart">
            ×
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="empty">
            <p>Your cart is empty.</p>
            <a className="button" href="#shop" onClick={onClose}>
              Browse cherries
            </a>
          </div>
        ) : (
          <>
            <ul className="lines">
              {lines.map(({ product, qty, totalCents }) => (
                <li key={product.id} className="line">
                  <span className="line-name">{product.name}</span>
                  <span className="line-total">{formatPrice(totalCents)}</span>
                  <div className="stepper" role="group" aria-label={`${product.name} quantity`}>
                    <button
                      type="button"
                      onClick={(e) => changeQty(product.id, qty - 1, e)}
                      aria-label={`Decrease ${product.name}`}
                    >
                      −
                    </button>
                    <span>{qty}</span>
                    <button
                      type="button"
                      onClick={(e) => changeQty(product.id, qty + 1, e)}
                      aria-label={`Increase ${product.name}`}
                      disabled={qty >= MAX_QTY}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => removeLine(product.id)}
                  >
                    Remove<span className="visually-hidden"> {product.name}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="drawer-foot">
              <p className="subtotal">
                <span>Subtotal</span>
                <span>{formatPrice(subtotalCents)}</span>
              </p>
              <button type="button" className="button button-block" onClick={onCheckout}>
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
