import { expect, test } from "@playwright/test";

test("single scan flow @smoke", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1_000);

  await expect(
    page.getByRole("heading", { name: /scan links in layers/i }),
  ).toBeVisible();
  const singleUrlInput = page.getByRole("textbox", { name: /url to inspect/i });
  await expect(async () => {
    await singleUrlInput.fill("example.com");
    await expect(singleUrlInput).toHaveValue("example.com");
  }).toPass();
  await page.getByRole("button", { name: /analyze url/i }).click();

  await expect(page.getByText(/example\.com/i).first()).toBeVisible();
  await expect(
    page.getByText(
      /Signal cards will populate independently|No strong malicious indicators|risk based on/i,
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /indexeddb scan archive/i }),
  ).toBeVisible();
});

test("batch scan flow @smoke", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1_000);

  await page.getByRole("button", { name: /batch scan/i }).click();
  const batchInput = page.getByRole("textbox", { name: /one url per line/i });
  await expect(async () => {
    await batchInput.fill("example.com\nhttps://example.org");
    await expect(batchInput).toHaveValue("example.com\nhttps://example.org");
  }).toPass();
  await page.getByRole("button", { name: /start batch/i }).click();

  await expect(
    page.getByRole("heading", { name: /per-url completion status/i }),
  ).toBeVisible();
  await expect(page.getByText(/example\.com/i).first()).toBeVisible();
});
