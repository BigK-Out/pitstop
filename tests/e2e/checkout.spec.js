import { expect, test } from "@playwright/test";

test("add to cart, change quantity, check out", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add to cart: Classic Dried" }).click();
  await page.getByRole("button", { name: "Add to cart: Sour Punch" }).click();
  await page.getByRole("button", { name: "Cart 2 items" }).click();

  const drawer = page.getByRole("dialog", { name: "Your cart" });
  await drawer.getByRole("button", { name: "Increase Classic Dried" }).click();
  await expect(drawer.getByText("$27.47")).toBeVisible();
  await drawer.getByRole("button", { name: "Checkout" }).click();

  const checkout = page.getByRole("dialog", { name: "Checkout" });
  await checkout.getByRole("button", { name: "Place demo order" }).click();
  await expect(page.getByRole("heading", { name: "Thanks, order placed!" })).toBeVisible();
  await expect(page.getByText(/^PIT-\d{6}$/)).toBeVisible();
  await page.getByRole("button", { name: "Back to the shop" }).click();
  await expect(page.getByRole("button", { name: "Cart 0 items" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: "Cart 0 items" })).toBeVisible();
});

test("cart survives a reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add to cart: Mixed Bag" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Cart 1 item" })).toBeVisible();
});

test("Esc closes the cart and returns focus to the cart button", async ({ page }) => {
  await page.goto("/");
  const cartButton = page.getByRole("button", { name: "Cart 0 items" });
  await cartButton.click();
  await expect(page.getByRole("dialog", { name: "Your cart" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Your cart" })).toBeHidden();
  await expect(cartButton).toBeFocused();
});

test("page works without cherry.glb and logs no unexpected errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.waitForTimeout(1500);
  // Allowlist: the optional model file is expected to be missing (404).
  const unexpected = errors.filter(
    (message) => !message.includes("cherry.glb") && !message.includes("Failed to load resource"),
  );
  expect(unexpected).toEqual([]);
});
