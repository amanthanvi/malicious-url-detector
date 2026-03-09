import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home page accessibility @smoke", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1_000);

  const devToolsButton = page.getByRole("button", {
    name: /open next\.js dev tools/i,
  });
  if ((await devToolsButton.count()) > 0) {
    await devToolsButton.evaluate((element) => {
      element.remove();
    });
  }

  const accessibilityReport = await new AxeBuilder({ page }).analyze();
  expect(accessibilityReport.violations).toEqual([]);
});

test("home page keyboard navigation @smoke", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1_000);

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: /skip to content/i });
  await expect(skipLink).toBeFocused();

  await page.keyboard.press("Tab");
  const themeToggle = page.getByRole("button", {
    name: /switch to light theme|switch to dark theme/i,
  });
  await expect(themeToggle).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: /open scanner/i })).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: /how it works/i })).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: /privacy/i })).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("tab", { name: /single scan/i })).toBeFocused();

  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /batch scan/i })).toBeFocused();
});
