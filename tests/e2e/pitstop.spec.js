import { expect, test } from "@playwright/test";

const revealLine = (page) => page.getByText("We took the pit out.");

test("scrolling through the hero reveals the Pit Stop line", async ({ page }) => {
  await page.goto("/");
  await expect(revealLine(page)).toBeHidden();
  await page.evaluate(() => {
    const hero = document.getElementById("top");
    window.scrollTo(0, hero.offsetHeight - window.innerHeight);
  });
  await expect(revealLine(page)).toBeVisible();
  await expect(page.locator("#top")).toHaveAttribute("data-revealed", "");
});

test("scrolling back up hides it again", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const hero = document.getElementById("top");
    window.scrollTo(0, hero.offsetHeight - window.innerHeight);
  });
  await expect(revealLine(page)).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(revealLine(page)).toBeHidden();
});

test("reduced motion shows the final frame without scrolling", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(revealLine(page)).toBeVisible();
  await expect(page.locator("#top")).toHaveClass(/pitstop--static/);
  await context.close();
});

test("hidden reveal button is not tabbable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Our orchard" }).focus();
  await page.keyboard.press("Tab");
  // Next stop after the hero CTAs is the first product button, not the hidden reveal link.
  await expect(page.getByRole("button", { name: "Add to bag: Classic Dried" })).toBeFocused();
});
