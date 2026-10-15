export const itemCount = (cart) => Object.values(cart.items).reduce((sum, qty) => sum + qty, 0);

export function lineItems(cart, products) {
  return products
    .filter((product) => cart.items[product.id])
    .map((product) => {
      const qty = cart.items[product.id];
      return { product, qty, totalCents: product.priceCents * qty };
    });
}

export const subtotalCents = (cart, products) =>
  lineItems(cart, products).reduce((sum, line) => sum + line.totalCents, 0);
