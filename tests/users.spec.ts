import { test, expect } from "@playwright/test";
import { resetApp } from "./helpers/test-utils";

const baseURL = "http://127.0.0.1:3000";

test.describe("User Management API", () => {
  test.beforeEach(async ({ request }) => {
    await resetApp(request);
  });

  test("should create a user", async ({ request }) => {
    const response = await request.post("/api/users", {
      data: { username: "testuser", password: "secret123", name: "Test User" },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.user.username).toBe("testuser");
  });

  test("should reject duplicate username", async ({ request }) => {
    await request.post("/api/users", {
      data: { username: "dupuser", password: "pass1" },
    });
    const response = await request.post("/api/users", {
      data: { username: "dupuser", password: "pass2" },
    });
    expect(response.status()).toBe(409);
    const body = await response.json();
    expect(body.error).toMatch(/exists/i);
  });

  test("should require username and password", async ({ request }) => {
    const response = await request.post("/api/users", {
      data: { username: "missingpass" },
    });
    expect(response.status()).toBe(400);
  });
});

test.describe("User task isolation", () => {
  test.beforeEach(async ({ request }) => {
    await resetApp(request);
  });

  test("users should only see their own tasks", async ({ playwright, request }) => {
    const createUser = await request.post("/api/users", {
      data: { username: "userb", password: "passb" },
    });
    expect(createUser.ok()).toBeTruthy();

    const admin = await playwright.request.newContext({ baseURL });
    await admin.post("/api/login", {
      data: { username: "admin", password: "admin123" },
    });
    await admin.post("/api/tasks", {
      data: { title: "Admin only", priority: "low" },
    });

    const userB = await playwright.request.newContext({ baseURL });
    await userB.post("/api/login", {
      data: { username: "userb", password: "passb" },
    });

    expect(await (await userB.get("/api/tasks")).json()).toEqual([]);

    await userB.post("/api/tasks", {
      data: { title: "User B task", priority: "high" },
    });
    const userBTasks = await (await userB.get("/api/tasks")).json();
    expect(userBTasks).toHaveLength(1);
    expect(userBTasks[0].title).toBe("User B task");

    const adminTasks = await (await admin.get("/api/tasks")).json();
    expect(adminTasks).toHaveLength(1);
    expect(adminTasks[0].title).toBe("Admin only");

    await admin.dispose();
    await userB.dispose();
  });
});
