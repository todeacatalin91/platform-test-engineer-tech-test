# Platform Test Engineer - Tech Test

## Overview

This repository contains **TaskFlow**, a simple task management web app, along with an existing test suite and an incomplete CI/CD pipeline.

The development team is frustrated that their tickets keep coming back as failed QA after they have merged their changes and have asked the test platform team to run the UI tests on Pull request. They do not always remember to run them manual and have also expressed their frustration that the tests take too long to run and keep failing intermittently.

Your task is to implement a working CICD workflow which runs the tests, provides clear feedback to the developer on why (if any) tests failed and make optimisations and fixes to the existing test suite.

This exercise is designed to take approximately **2–3 hours**.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- [Docker](https://www.docker.com/) and Docker Compose
- Git

### Setup

1. Click the **"Use this template"** button at the top of this repository to create your own copy.
2. **Clone** your new repository locally:
   ```bash
   git clone <your-repo-url>
   cd platform-test-engineer-tech-test
   ```
3. **Install dependencies**:
   ```bash
   npm install
   npx playwright install --with-deps chromium
   ```
4. **Start the app** using Docker:
   ```bash
   npm run docker:up
   npm run docker:wait
   ```
   Or run locally without Docker:
   ```bash
   npm run app:start
   ```
5. **Visit** `http://localhost:3000` to see the app running.
6. **Run the tests**:
   ```bash
   npm test
   ```

When finished, stop the app:

```bash
# If using Docker:
npm run docker:down

# If running locally, press Ctrl+C in the terminal
```

---

## What to Do

Read [`requirements.md`](requirements.md) for full details on the app and test coverage. Below is a summary of the tasks

### Task 1: Build a working CI Pipeline

The GitHub Actions workflow (`.github/workflows/test.yml`) is incomplete.
The workflow should:

- Run on pull requests
- Spin up required infrastructure
- Run the tests
- Output relevent reports and artefacts

### Task 2: Fix Broken Tests

Several existing tests are failing. Diagnose the root cause of each failure and fix them. The issues are in the tests, not the application.

### Task 3: Fix the Flaky Tests

There are some flaky and brittle tests. Identify these test(s) and make them more reliable.

### Task 4: Improve Test Configuration

The test runnger configuration is not optimised. Identify and implement ways to improve this to reduce development friction and increase feedback speed, while maintaining reliability.

### Task 5: Improve Test Execution Speed

Explore and implement ways of making the tests faster, think about data seeding and redundant UI commands.

### Task 6: Write New Tests

Add tests for missing coverage of requirements described in `requirements.md`:

---

## Submitting

1. Make the required changes and add any supporting documentation.
2. Commit everything to your repository.
3. Share the link to your repository with us.

---

## What We're Looking For

- **Diagnosis skills** - Can you identify why tests fail and fix the root cause, not just the symptom?
- **Infrastructure thinking** - Do your CI and config changes make the suite reliable, fast, and maintainable?
- **Test design** - Are your tests well-structured, readable, and appropriately scoped?
- **DX awareness** - Do you utilise utility functions and scripts to make life easier for engineers writing and running tests?

We're not looking for perfection - we want to see how you think about test infrastructure and how you approach problems.

We encourage you to use AI tooling to enhance your workflow - however - it is important that you understand what you have done, why you've made the decisions you have and are able to reason about your approach

---

## Time Guidance

This exercise is designed to take **2–3 hours**. If you run out of time, submit what you have and note what you would do next - we value a clear, well-reasoned partial submission over a rushed complete one.
