import { test, expect } from "@playwright/test";
import { login } from "./helpers/test-utils";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
      // Reset task data before each test
    await page.request.post("/api/reset");
    await page.goto("/");
    });

  test("should redirect unauthenticated users to login", async ({ page }) => {
    await expect(page.locator("#login-form")).toBeVisible();
  });

  test("should log in with valid credentials and logout", async ({ page }) => {
    await login(page);
    await expect(page.locator("#task-form")).toBeVisible();
    await page.click("#logout-btn");
    await expect(page.locator("#login-form")).toBeVisible();
  });

  test("should show error with invalid credentials", async ({ page }) => {
    await page.fill("#username", "admin");
    await page.fill("#password", "wrongpass");
    await page.click("#login-btn");
    await expect(page.locator("#error-message")).toBeVisible();
    await expect(page.locator("#error-message")).toHaveText(
      "Invalid username or password."
    );

    await page.fill("#username", "wronguser");
    await page.fill("#password", "admin123");
    await page.click("#login-btn");
    await expect(page.locator("#error-message")).toBeVisible();
  });
});
