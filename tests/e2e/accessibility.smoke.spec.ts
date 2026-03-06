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
  await expect(
    page.getByRole("button", { name: /toggle theme/i }),
  ).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: /^single scan$/i }),
  ).toBeFocused();
});
