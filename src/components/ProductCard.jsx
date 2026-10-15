import { useCart } from "../cart/CartContext";
import { formatPrice } from "../cart/format";
import { useAnnounce } from "./Announcer";
import CherryArt from "./CherryArt";

export default function ProductCard({ product, index }) {
  const { add } = useCart();
  const announce = useAnnounce();

  const handleAdd = () => {
    add(product.id);
    announce(`Added ${product.name} to bag`);
  };

  return (
    <li className="product">
      <div className={`plate plate--${product.art}`}>
        <span className="plate-fig">Fig. {String(index + 1).padStart(2, "0")}</span>
        <CherryArt variant={product.art} label={product.artLabel} />
      </div>
      <div className="product-head">
        <h3>{product.name}</h3>
        <span className="price">{formatPrice(product.priceCents)}</span>
      </div>
      <p className="product-desc">{product.description}</p>
      <button
        type="button"
        className="button button-outline"
        onClick={handleAdd}
        aria-label={`Add to bag: ${product.name}`}
      >
        Add to bag <span aria-hidden="true">+</span>
      </button>
    </li>
  );
}
