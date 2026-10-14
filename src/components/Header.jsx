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
            <a href="#story">Story</a>
          </li>
          <li>
            <a href="#faq">FAQ</a>
          </li>
        </ul>
      </nav>
      <button type="button" className="button button-ghost" onClick={onOpenCart}>
        Cart <span className="badge">{count}</span>
        <span className="visually-hidden"> {count === 1 ? "item" : "items"}</span>
      </button>
    </header>
  );
}
