import { expect, test } from "@playwright/test";

test("single scan flow @smoke", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1_000);

  await expect(
    page.getByRole("heading", {
      name: /check any url against browser-protection lists/i,
    }),
  ).toBeVisible();
  await expect(page.getByText(/signal coverage/i)).toBeVisible();
  await expect(page.getByText(/^idle$/i)).toBeVisible();
  await expect(page.getByText(/awaiting scan/i).first()).toBeVisible();

  const singleUrlInput = page.getByRole("textbox", {
    name: /url to analyze/i,
  });
  await expect(async () => {
    await singleUrlInput.fill("example.com");
    await expect(singleUrlInput).toHaveValue("example.com");
  }).toPass();
  await page.getByRole("button", { name: /^analyze$/i }).click();

  await expect(page.getByText(/example\.com/i).first()).toBeVisible();
  await expect(page.getByLabel(/VirusTotal signal:/i)).toBeVisible();
  await expect(
    page.getByRole("banner").getByText(/8\/8 signals/i),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: /scan history/i }),
  ).toBeVisible();
});

test("batch scan flow @smoke", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1_000);

  await page.getByRole("tab", { name: /batch scan/i }).click();
  const batchInput = page.getByRole("textbox", {
    name: /urls to analyze/i,
  });
  await expect(async () => {
    await batchInput.fill("example.com\nhttps://example.org");
    await expect(batchInput).toHaveValue("example.com\nhttps://example.org");
  }).toPass();
  await page.getByRole("button", { name: /start batch/i }).click();

  await expect(page.getByText(/example\.com/i).first()).toBeVisible();
});

test("history clear can be undone @smoke", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1_000);

  const singleUrlInput = page.getByRole("textbox", {
    name: /url to analyze/i,
  });
  await singleUrlInput.fill("example.com");
  await page.getByRole("button", { name: /^analyze$/i }).click();

  const historyRegion = page.getByRole("region", { name: /scan history/i });
  await expect(historyRegion.getByText(/example\.com/i).first()).toBeVisible();

  await historyRegion
    .getByRole("button", { name: /clear all history/i })
    .click();
  await historyRegion
    .getByRole("button", { name: /confirm clear all history/i })
    .click();

  await expect(
    historyRegion.getByText(/history cleared locally/i),
  ).toBeVisible();
  await historyRegion.getByRole("button", { name: /undo clear/i }).click();
  await expect(historyRegion.getByText(/example\.com/i).first()).toBeVisible();
});
