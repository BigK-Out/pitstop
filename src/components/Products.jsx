import { brand, products } from "../content";
import ProductCard from "./ProductCard";

export default function Products() {
  return (
    <section className="section container" id="shop" aria-labelledby="shop-title">
      <div className="section-head">
        <h2 id="shop-title">{brand.shop.title}</h2>
        <p>{brand.shop.intro}</p>
      </div>
      <ul className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>
    </section>
  );
}
