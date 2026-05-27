import { test, expect } from "@playwright/test";
import {
  login,
  addTaskViaUI,
  clickTaskCheckbox,
  countTasks,
  taskItem,
  taskItems,
} from "./helpers/test-utils";

test.describe("Task Management", () => {
  test.beforeEach(async ({ page }) => {
    // Reset task data before each test
    await page.request.post("/api/reset");
    await login(page);
  });

  test("should add a new task", async ({ page }) => {
    const countBefore = await countTasks(page);

    await addTaskViaUI(page, "Buy groceries", "medium");

    await expect(taskItems(page)).toHaveCount(countBefore + 1);
    await expect(
      taskItem(page, "Buy groceries").locator(".priority-badge.medium"),
    ).toHaveText("medium");
  });

  test("should mark a task as completed", async ({ page }) => {
    await addTaskViaUI(page, "Test task");
    await clickTaskCheckbox(page, "Test task");
    await expect(taskItem(page, "Test task")).toHaveClass(/completed/);
  });

  test("should delete a task", async ({ page }) => {
    const countBefore = await countTasks(page);

    await addTaskViaUI(page, "Task to delete");
    
    await expect(taskItems(page)).toHaveCount(countBefore + 1);

    await page.locator(".task-item .delete-btn").last().click();

    await expect(taskItems(page)).toHaveCount(countBefore);
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
