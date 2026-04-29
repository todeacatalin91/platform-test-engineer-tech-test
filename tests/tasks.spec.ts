import { test, expect } from "@playwright/test";
import { login, addTaskViaUI } from "./helpers/test-utils";

test.describe("Task Management", () => {
  test.beforeEach(async ({ page }) => {
    // Reset task data before each test
    await page.request.post("/api/reset");
    await login(page);
  });

  test("should add a new task", async ({ page }) => {
    await addTaskViaUI(page, "Buy groceries", "medium");

    const taskItem = page.locator("ul#task-list > li");
    await expect(taskItem).toHaveCount(1);
    await expect(taskItem.locator("span:nth-child(2)")).toHaveText("Buy groceries");
  });

  test("should mark a task as completed", async ({ page }) => {
    await addTaskViaUI(page, "Test task");

    await page.locator(".task-item input[type='checkbox']").click();
    expect(
      await page.locator(".task-item").getAttribute("class")
    ).toContain("completed");
  });

  test("should delete a task", async ({ page }) => {
    await addTaskViaUI(page, "Task to delete");
    await expect(page.locator("ul > li")).toHaveCount(1);

    await page.locator("ul > li > button:last-child").click();
    await expect(page.locator("ul > li")).toHaveCount(0);
  });

  test("should display correct task count", async ({ page }) => {
    await addTaskViaUI(page, "Task 1");
    await addTaskViaUI(page, "Task 2");
    await addTaskViaUI(page, "Task 3");

    await expect(page.locator("#task-count")).toHaveText(
      "3 of 3 tasks remaining"
    );
  });
});
