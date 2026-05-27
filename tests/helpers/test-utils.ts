import { APIRequestContext, expect, Locator, Page } from "@playwright/test";

const ADMIN = { username: "admin", password: "admin123" };

/** Locator for all task rows in the list. */
export function taskItems(page: Page): Locator {
  return page.locator(".task-item");
}

/** Returns how many tasks are currently shown in the list. */
export async function countTasks(page: Page): Promise<number> {
  return taskItems(page).count();
}

/** Locator for a single task row matching the given title text. */
export function taskItem(page: Page, title: string): Locator {
  return taskItems(page).filter({ hasText: title });
}

/** Resolves when the task list is reloaded via GET /api/tasks (2xx). */
export function waitForTasksList(page: Page) {
  return page.waitForResponse((resp) => {
    return (
      resp.request().method() === "GET" &&
      resp.url().endsWith("/api/tasks") &&
      resp.ok()
    );
  });
}

/**
 * Toggles completion via the task's checkbox (waits for PATCH /api/tasks/:id).
 */
export async function clickTaskCheckbox(page: Page, title: string) {
  const patchTask = page.waitForResponse((resp) => {
    return (
      resp.url().includes("/api/tasks/") &&
      resp.request().method() === "PATCH" &&
      resp.ok()
    );
  });

  await Promise.all([
    patchTask,
    taskItem(page, title).locator("input[type='checkbox']").click(),
  ]);
}

/**
 * Logs in via the UI.
 * Used by all tests to authenticate before running.
 */
export async function login(page: Page) {
  await page.goto("/login");
  await page.fill("#username", ADMIN.username);
  await page.fill("#password", ADMIN.password);
  await page.click("#login-btn");
  await page.waitForURL("/");
}

export async function resetApp(request: APIRequestContext) {
  await request.post("/api/reset");
}

export async function loginViaApi(
  request: APIRequestContext,
  username: string = ADMIN.username,
  password: string = ADMIN.password,
) {
  const response = await request.post("/api/login", {
    data: { username, password },
  });
  expect(response.ok()).toBeTruthy();
}

export async function createTaskViaApi(
  request: APIRequestContext,
  title: string,
  priority: string,
) {
  const response = await request.post("/api/tasks", {
    data: { title, priority },
  });
  expect(response.ok()).toBeTruthy();
}

/** Seeds the three tasks used by filter specs (faster than UI). */
export async function seedFilterTasks(page: Page) {
  await resetApp(page.request);
  await loginViaApi(page.request);
  await createTaskViaApi(page.request, "Active task 1", "low");
  await createTaskViaApi(page.request, "Active task 2", "high");
  await createTaskViaApi(page.request, "Active task 3", "medium");
  await page.goto("/");
}

/**
 * Adds a task via the UI.
 */
export async function addTaskViaUI(
  page: Page,
  title: string,
  priority: string = "low",
) {
  await page.fill("#task-input", title);
  await page.selectOption("#priority-select", priority);

  // Simple API check: ensure task creation (POST /api/tasks) succeeds.
  const postCreateTask = page.waitForResponse((resp) => {
    return (
      resp.url().includes("/api/tasks") &&
      resp.request().method() === "POST" &&
      resp.ok()
    );
  });

  await Promise.all([postCreateTask, page.click("#add-btn")]);

  // Confirm the UI updated.
  await expect(page.locator(".task-title", { hasText: title }).last()).toBeVisible();
}
