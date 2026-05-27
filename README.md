# TaskFlow

TaskFlow is a small task management web application with login, per-user task lists, priorities, and filters. This repository contains the Node.js server, the browser UI, and an automated end-to-end test suite (Playwright).

## Features

- **Authentication** — Sign in to use the app; unauthenticated visits to the home page show the login screen. Sign out returns you to login.
- **Tasks** — Create tasks with a title and priority (`low`, `medium`, `high`). Mark tasks complete, delete them, and see a count of active tasks vs total.
- **Filtering** — View all tasks, only active, or only completed. The active filter is highlighted; an empty list shows a clear message when nothing matches.
- **Multi-user** — Each user has their own tasks. Additional users can be created via the REST API (see below).

### Default account

| Field    | Value      |
| -------- | ---------- |
| Username | `admin`    |
| Password | `admin123` |

Open the app at [http://localhost:3000](http://localhost:3000) after starting the server (see below).

## Tech stack

- **Backend:** Express, session-based auth, in-memory data store
- **Frontend:** Static HTML/CSS/JS (`src/views`, `src/public`)
- **Tests:** Playwright (Chromium)
- **CI:** GitHub Actions — Docker app + Playwright on pull requests and pushes to `main`

For a full feature list, API table, and testing notes, see [`requirements.md`](requirements.md).

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Docker](https://www.docker.com/) and Docker Compose (optional, recommended for parity with CI)
- Git

### Install

```bash
git clone <your-repo-url>
cd platform-test-engineer-tech-test
npm install
npx playwright install --with-deps chromium
```

### Run the application

**With Docker:**

```bash
npm run docker:up
npm run docker:wait
```

**Without Docker:**

```bash
npm run app:start
```

The server listens on port **3000**. Health check: `GET http://127.0.0.1:3000/health`.

**Stop Docker:**

```bash
npm run docker:down
```

For a local `npm run app:start` process, stop it with Ctrl+C in the terminal.

### Run tests

Playwright uses `http://127.0.0.1:3000` as `baseURL`. Locally, if nothing is listening yet, the config can start the app via `npm run app:start`. In CI, the workflow starts the app in Docker first.

```bash
npm test
```

Run one area of the suite:

```bash
npm run test-auth
npm run test-tasks
npm run test-filters
npm run test-users
```

| Script            | Spec file              |
| ----------------- | ---------------------- |
| `npm run test-auth`    | `tests/auth.spec.ts`    |
| `npm run test-tasks`   | `tests/tasks.spec.ts`   |
| `npm run test-filters` | `tests/filters.spec.ts` |
| `npm run test-users`   | `tests/users.spec.ts`   |

Shared helpers live in `tests/helpers/test-utils.ts` (login, API seeding, task locators, waiting for list reloads).

## REST API (summary)

| Method   | Endpoint           | Description                          |
| -------- | ------------------ | ------------------------------------ |
| `POST`   | `/api/login`       | Authenticate                         |
| `POST`   | `/api/logout`      | End session                          |
| `POST`   | `/api/users`       | Create a user                        |
| `GET`    | `/api/tasks`       | List current user's tasks            |
| `POST`   | `/api/tasks`       | Create a task                        |
| `PATCH`  | `/api/tasks/:id`   | Update a task (e.g. completed)       |
| `DELETE` | `/api/tasks/:id`   | Delete a task                        |
| `POST`   | `/api/reset`       | Reset tasks and non-admin users (tests) |
| `GET`    | `/health`          | Health check                         |

## Project layout

```
src/
  server.js          # Express app and API
  views/             # login.html, index.html
  public/            # app.js, styles.css
tests/
  auth.spec.ts
  tasks.spec.ts
  filters.spec.ts
  users.spec.ts
  helpers/test-utils.ts
.github/workflows/test.yml
playwright.config.ts
docker-compose.yml
```

## Continuous integration

On pull requests and pushes to `main`, the workflow installs dependencies, starts TaskFlow in Docker, waits for `/health`, runs `npm test` with `CI=true`, and uploads HTML reports and failure artifacts when tests fail.
