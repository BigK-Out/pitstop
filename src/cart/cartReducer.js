export const MAX_QTY = 99;
export const initialCart = { items: {} };

function withQty(state, id, qty) {
  const n = Math.floor(Number(qty));
  if (Number.isNaN(n)) return state;
  const items = { ...state.items };
  if (n <= 0) delete items[id];
  else items[id] = Math.min(n, MAX_QTY);
  return { items };
}

export function cartReducer(state, action) {
  switch (action.type) {
    case "add":
      return withQty(state, action.id, (state.items[action.id] ?? 0) + 1);
    case "setQty":
      return withQty(state, action.id, action.qty);
    case "remove":
      return withQty(state, action.id, 0);
    case "clear":
      return initialCart;
    case "replace":
      return action.cart;
    default:
      return state;
  }
}
