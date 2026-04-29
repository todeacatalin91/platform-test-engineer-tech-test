import { test, expect } from "@playwright/test";
import { login, addTaskViaUI } from "./helpers/test-utils";

test.describe("Task Filtering", () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post("/api/reset");
    await login(page);

    await addTaskViaUI(page, "Active task 1", "low");
    await addTaskViaUI(page, "Active task 2", "high");
  });

  test("should filter active tasks", async ({ page }) => {
    // Complete one task first
    await page
      .locator(".task-item", { hasText: "Active task 1" })
      .locator("input[type='checkbox']")
      .click();
    await page.waitForTimeout(500);

    await page.locator('[data-filter="active"]').click();
    await page.waitForTimeout(500);

    await expect(page.locator(".task-item")).toHaveCount(1);
    await expect(page.locator(".task-title")).toHaveText("Active task 2");
  });

  test("should filter completed tasks", async ({ page }) => {
    // Complete one task
    await page
      .locator(".task-item:nth-child(1) input[type='checkbox']")
      .click();
    await page.waitForTimeout(500);

    await page.locator('[data-filter="completed"]').click();
    await page.waitForTimeout(500);

    const completedTasks = page.locator(".task-item");
    await expect(completedTasks).toHaveCount(1);
    await expect(completedTasks.locator(".task-title")).toHaveText(
      "Active task 1"
    );
  });
});
