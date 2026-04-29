import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should redirect to login page when not authenticated", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("header")).toContainText(
      "Please log in to continue",
    );
  });

  test("should log in with valid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill("div.form-group:nth-child(1) > input", "admin");
    await page.fill("div.form-group:nth-child(2) > input", "admin123");
    await page.click("form#login-form > button");
    await expect(page).toHaveURL("/");
  });

  test("should show error with invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#username", "wronguser");
    await page.fill("#password", "wrongpass");
    await page.click("#login-btn");
    await expect(page.locator("#error")).toBeVisible();
  });
});
