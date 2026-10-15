import { useState } from "react";
import CartDrawer from "./cart/CartDrawer";
import { CartProvider } from "./cart/CartContext";
import CheckoutDialog from "./cart/CheckoutDialog";
import { AnnouncerProvider } from "./components/Announcer";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Orchard from "./components/Orchard";
import Products from "./components/Products";
import Statement from "./components/Statement";
import { products } from "./content";

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <AnnouncerProvider>
      <CartProvider products={products}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header onOpenCart={() => setCartOpen(true)} />
        <main id="main">
          <Hero />
          <Statement />
          <Products />
          <Orchard />
          <Faq />
        </main>
        <Footer />
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          onCheckout={() => {
            setCartOpen(false);
            setCheckoutOpen(true);
          }}
        />
        <CheckoutDialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      </CartProvider>
    </AnnouncerProvider>
  );
}
