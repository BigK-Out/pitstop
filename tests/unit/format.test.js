import { describe, expect, it } from "vitest";
import { formatPrice } from "../../src/cart/format";

describe("formatPrice", () => {
  it("formats cents as US dollars", () => {
    expect(formatPrice(899)).toBe("$8.99");
    expect(formatPrice(0)).toBe("$0.00");
    expect(formatPrice(123456)).toBe("$1,234.56");
  });
});
