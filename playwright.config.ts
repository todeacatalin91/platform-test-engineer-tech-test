import { defineConfig } from "@playwright/test";

// Set in the GitHub Actions workflow (npm test env: CI: true).
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests",

  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },

  // In CI, accidentally committed test.only() must fail the build.
  forbidOnly: isCI,
  // One retry in CI (fewer duplicate folders in test-results); trace captured on that retry.
  retries: isCI ? 1 : 0,
  // Single worker avoids cross-test interference on one shared app instance.
  workers: 1,

  reporter: isCI
    ? [
        ["list"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
        ["junit", { outputFile: "test-results/junit.xml" }],
      ]
    : [
        ["list"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
      ],

  // Screenshots, traces, and attachments on failure are written here (uploaded in CI on failure).
  outputDir: "test-results",

  use: {
    // Use explicit IPv4 to avoid localhost -> ::1 issues on some machines.
    baseURL: "http://127.0.0.1:3000",
    trace: isCI ? "on-first-retry" : "off",
    screenshot: isCI ? "only-on-failure" : "off",
  },

  // Local: start app if needed. CI: reuse Docker (workflow already exposes :3000).
  webServer: isCI
    ? undefined
    : {
        command: "npm run app:start",
        url: "http://127.0.0.1:3000/health",
        reuseExistingServer: true,
        timeout: 10_000,
      },
});
