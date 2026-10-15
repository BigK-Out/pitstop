import { brand } from "../content";
import { useCart } from "../cart/CartContext";

export default function Header({ onOpenCart }) {
  const { count } = useCart();

  return (
    <header className="site-header">
      <a className="wordmark" href="#top">
        {brand.name}
      </a>
      <nav className="site-nav" aria-label="Main">
        <ul>
          <li>
            <a href="#shop">Shop</a>
          </li>
          <li>
            <a href="#orchard">Orchard</a>
          </li>
          <li>
            <a href="#faq">FAQ</a>
          </li>
        </ul>
      </nav>
      <button type="button" className="bag-button" onClick={onOpenCart}>
        Bag <span className="bag-count">{count}</span>
        <span className="visually-hidden"> {count === 1 ? "item" : "items"}</span>
      </button>
    </header>
  );
}
