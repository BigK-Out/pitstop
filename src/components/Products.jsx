import { formatPrice } from "../cart/format";
import { brand, products } from "../content";
import ProductCard from "./ProductCard";

export default function Products() {
  const from = Math.min(...products.map((product) => product.priceCents));

  return (
    <section className="section" id="shop" aria-labelledby="shop-title">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="label">{brand.shop.label}</p>
            <h2 id="shop-title">{brand.shop.title}</h2>
          </div>
          <p className="section-note">
            {products.length} pouches · from {formatPrice(from)}
          </p>
        </div>
        <ul className="product-grid">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </ul>
      </div>
    </section>
  );
}
