import { test, expect } from "@playwright/test";
import {
  clickTaskCheckbox,
  countTasks,
  seedFilterTasks,
  waitForTasksList,
  taskItem,
  taskItems,
} from "./helpers/test-utils";

test.describe("Task Filtering", () => {
  test.beforeEach(async ({ page }) => {
    await seedFilterTasks(page);
  });

  test("should filter active tasks", async ({ page }) => {
    let reload = waitForTasksList(page);
    await page.locator('[data-filter="active"]').click();
    await reload;
    const countActiveBefore = await countTasks(page);

    reload = waitForTasksList(page);
    await page.locator('[data-filter="all"]').click();
    await reload;

    const reloadAfterToggle = waitForTasksList(page);
    await clickTaskCheckbox(page, "Active task 1");
    expect((await reloadAfterToggle).status()).toBe(200);

    const reloadAfterFilter = waitForTasksList(page);
    await page.locator('[data-filter="active"]').click();
    expect((await reloadAfterFilter).status()).toBe(200);

    await expect(taskItems(page)).toHaveCount(countActiveBefore - 1);
    await expect(page.locator(".task-title").first()).toHaveText("Active task 2");
  });

  test("should filter completed tasks", async ({ page }) => {
    let reload = waitForTasksList(page);
    await page.locator('[data-filter="completed"]').click();
    await reload;
    await expect(taskItems(page)).toHaveCount(0);
    await expect(page.locator(".empty-state")).toHaveText(
      "No tasks to display.",
    );

    reload = waitForTasksList(page);
    await page.locator('[data-filter="all"]').click();
    await reload;

    const reloadAfterToggle = waitForTasksList(page);
    await clickTaskCheckbox(page, "Active task 2");
    expect((await reloadAfterToggle).status()).toBe(200);

    const reloadAfterFilter = waitForTasksList(page);
    await page.locator('[data-filter="completed"]').click();
    expect((await reloadAfterFilter).status()).toBe(200);

    await expect(taskItems(page)).toHaveCount(1);
    await expect(taskItem(page, "Active task 2")).toBeVisible();
  });

  test("should highlight the selected filter", async ({ page }) => {
    await expect(page.locator('[data-filter="all"]')).toHaveClass(/active/);

    const reload = waitForTasksList(page);
    await page.locator('[data-filter="active"]').click();
    await reload;

    await expect(page.locator('[data-filter="active"]')).toHaveClass(/active/);
    await expect(page.locator('[data-filter="all"]')).not.toHaveClass(/active/);
  });

  test("should display priority badges on the correct tasks", async ({
    page,
  }) => {
    await expect(
      taskItem(page, "Active task 1").locator(".priority-badge.low"),
    ).toHaveText("low");
    await expect(
      taskItem(page, "Active task 2").locator(".priority-badge.high"),
    ).toHaveText("high");
    await expect(
      taskItem(page, "Active task 3").locator(".priority-badge.medium"),
    ).toHaveText("medium");
  });
});
