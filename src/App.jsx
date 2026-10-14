import { useState } from "react";
import { CartProvider } from "./cart/CartContext";
import { AnnouncerProvider } from "./components/Announcer";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Products from "./components/Products";
import Story from "./components/Story";
import { products } from "./content";

export default function App() {
  const [, setCartOpen] = useState(false);

  return (
    <AnnouncerProvider>
      <CartProvider products={products}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header onOpenCart={() => setCartOpen(true)} />
        <main id="main">
          <Hero />
          <div className="sheet">
            <Products />
            <Story />
            <Faq />
          </div>
        </main>
        <Footer />
      </CartProvider>
    </AnnouncerProvider>
  );
}
