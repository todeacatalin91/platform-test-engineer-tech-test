import { Page } from "@playwright/test";

/**
 * Logs in via the UI.
 * Used by all tests to authenticate before running.
 */
export async function login(page: Page) {
  await page.goto("/login");
  await page.fill("#username", "admin");
  await page.fill("#password", "admin123");
  await page.click("#login-btn");
  await page.waitForURL("/");
}

/**
 * Adds a task via the UI.
 */
export async function addTaskViaUI(
  page: Page,
  title: string,
  priority: string = "low",
) {
  await page.fill(".form-row > input:first-child", title);
  await page.selectOption(".form-row > select", priority);
  await page.click(".form-row > button");
  await page.waitForTimeout(1000);
}
