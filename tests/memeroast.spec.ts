import { expect, test } from "@playwright/test";

test("desktop generate flow shows preview and wallet toast", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("MemeRoast Console")).toBeVisible();
  await page.getByRole("button", { name: /Meme Lord/i }).click();
  await page.getByRole("button", { exact: true, name: "Generate" }).click();
  await expect(
    page.getByRole("heading", { name: /Feed the agent/i }),
  ).toBeVisible();
  await page.getByLabel("Prompt").fill("Roast my wallet");
  await page.getByRole("button", { name: /Generate Preview/i }).click();

  await expect(page.getByText("Preview Result")).toBeVisible();
  await expect(page.getByTestId("preview-result")).toContainText(
    /wallet|address|transaction|chain|block explorer/i,
  );
  await expect(page.getByTestId("preview-result")).not.toContainText(
    /ghosts its own transactions|empty portfolio|asks for gas/i,
  );

  await page.getByRole("button", { name: /Pay 0.05 USDC/i }).click();
  await expect(page.getByText("Roast blocked")).toBeVisible();
  await expect(
    page.getByRole("status").getByText(/Connect wallet first/i),
  ).toBeVisible();
});

test("history and leaderboard render on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: /My History/i }).click();
  await expect(page.getByText(/meme vault is tragically unemployed/i)).toBeVisible();

  await page.getByRole("button", { name: /Leaderboard/i }).click();
  await expect(
    page.getByText(/Top memes currently terrorizing the timeline/i),
  ).toBeVisible();
  await expect(page.getByText("#1")).toBeVisible();
});
