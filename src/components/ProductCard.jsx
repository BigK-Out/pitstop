import { useCart } from "../cart/CartContext";
import { formatPrice } from "../cart/format";
import { useAnnounce } from "./Announcer";
import CherryArt from "./CherryArt";

export default function ProductCard({ product }) {
  const { add } = useCart();
  const announce = useAnnounce();

  const handleAdd = () => {
    add(product.id);
    announce(`Added ${product.name} to cart`);
  };

  return (
    <li className="card">
      <CherryArt variant={product.art} label={product.artLabel} />
      <div className="card-body">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="card-foot">
          <span className="price">{formatPrice(product.priceCents)}</span>
          <button
            type="button"
            className="button"
            onClick={handleAdd}
            aria-label={`Add to cart: ${product.name}`}
          >
            Add to cart
          </button>
        </div>
      </div>
    </li>
  );
}
