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
  // In CI, retry flaky tests up to twice before marking the job failed.
  retries: isCI ? 2 : 0,
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
    baseURL: "http://localhost:3000",
    trace: isCI ? "on-first-retry" : "off",
    screenshot: isCI ? "only-on-failure" : "off",
  },
});
