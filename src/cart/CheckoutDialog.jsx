import { useEffect, useRef, useState } from "react";
import { useAnnounce } from "../components/Announcer";
import Modal from "../components/Modal";
import { useCart } from "./CartContext";
import { formatPrice } from "./format";

export function makeOrderNumber(rand = Math.random) {
  return `PIT-${Math.floor(rand() * 900000) + 100000}`;
}

export default function CheckoutDialog({ open, onClose }) {
  const { lines, subtotalCents, clear } = useCart();
  const [orderNumber, setOrderNumber] = useState(null);
  const announce = useAnnounce();
  const successRef = useRef(null);

  // The focused "Place demo order" button unmounts; move focus to the confirmation and announce it.
  useEffect(() => {
    if (!orderNumber) return;
    successRef.current?.focus();
    announce(`Order placed: ${orderNumber}`);
  }, [orderNumber, announce]);

  const close = () => {
    setOrderNumber(null);
    onClose();
  };

  const placeOrder = () => {
    setOrderNumber(makeOrderNumber());
    clear();
  };

  let content;
  if (orderNumber) {
    content = (
      <>
        <h2 id="checkout-title" ref={successRef} tabIndex={-1}>
          Thanks, order placed!
        </h2>
        <p>Your demo order number is</p>
        <p className="order-number">{orderNumber}</p>
        <p className="note">No payment was taken and nothing will ship: this is a demo store.</p>
        <div className="actions">
          <button type="button" className="button" onClick={close}>
            Back to the shop
          </button>
        </div>
      </>
    );
  } else if (lines.length === 0) {
    content = (
      <>
        <h2 id="checkout-title">Nothing to check out</h2>
        <div className="actions">
          <button type="button" className="button" onClick={close}>
            Close
          </button>
        </div>
      </>
    );
  } else {
    content = (
      <>
        <h2 id="checkout-title">Checkout</h2>
        <ul className="summary">
          {lines.map(({ product, qty, totalCents }) => (
            <li key={product.id}>
              <span>
                {qty} × {product.name}
              </span>
              <span>{formatPrice(totalCents)}</span>
            </li>
          ))}
        </ul>
        <p className="subtotal">
          <span>Total</span>
          <span>{formatPrice(subtotalCents)}</span>
        </p>
        <p className="note">Demo store: no payment details needed and nothing will be charged.</p>
        <div className="actions">
          <button type="button" className="button button-ghost" onClick={close}>
            Back
          </button>
          <button type="button" className="button" onClick={placeOrder}>
            Place demo order
          </button>
        </div>
      </>
    );
  }

  return (
    <Modal open={open} onClose={close} className="checkout" labelledBy="checkout-title">
      <div className="checkout-inner">{content}</div>
    </Modal>
  );
}
