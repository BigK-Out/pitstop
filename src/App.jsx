import { Suspense, lazy, useState } from "react";
import CartDrawer from "./cart/CartDrawer";
import { CartProvider } from "./cart/CartContext";
import CheckoutDialog from "./cart/CheckoutDialog";
import { AnnouncerProvider } from "./components/Announcer";
import ErrorBoundary from "./components/ErrorBoundary";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Products from "./components/Products";
import Story from "./components/Story";
import { products } from "./content";
import { hasWebGL } from "./scene/webgl";

// Loaded after the page renders so text and layout never wait on three.js.
const Background = lazy(() => import("./scene/Background"));

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [showScene] = useState(hasWebGL);

  return (
    <AnnouncerProvider>
      <CartProvider products={products}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {showScene && (
          <ErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <Background />
            </Suspense>
          </ErrorBoundary>
        )}
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
