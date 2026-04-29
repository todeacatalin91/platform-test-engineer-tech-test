# TaskFlow — Test Requirements

This document describes the features of the TaskFlow application and the expected test coverage. Use it to understand what exists, what's tested, and what's missing.

---

## Application Overview

TaskFlow is a simple task management app with authentication. It runs as a Node.js server inside a Docker container.

**Default admin credentials:**

- Username: `admin` / Password: `admin123`

---

## Features

### Authentication

- Users must log in to access the application.
- Unauthenticated users are redirected to `/login`.
- The login form accepts a username and password.
- Invalid credentials show an error message on the login page.
- A valid login redirects the user to the main app (`/`).
- Users can log out, returning them to the login page.

### User Management

- New users can be created via API.
- Usernames must be unique - creating a user with an existing username should fail.
- Username and password are required fields.
- Each user has their own tasks - users should only be able to see and manage their own tasks.

### Task Management

- Authenticated users can add tasks with a title and priority (low, medium, high).
- Tasks appear in the list immediately after being added.
- Users can mark tasks as complete or incomplete using a checkbox.
- Users can delete tasks.
- The task count displays the number of active tasks out of the total.
- Tasks belong to the logged-in user — users only see their own tasks.

### Filtering

- Users can filter the task list by: All, Active, or Completed.
- The selected filter is visually highlighted.
- When no tasks match the filter, an empty state message is shown.

### API

The app exposes a REST API for task management:

| Method   | Endpoint         | Description                                                |
| -------- | ---------------- | ---------------------------------------------------------- |
| `POST`   | `/api/login`     | Authenticate (JSON body: `{ username, password }`)         |
| `POST`   | `/api/logout`    | End session                                                |
| `POST`   | `/api/users`     | Create a user (JSON body: `{ username, password, name? }`) |
| `GET`    | `/api/tasks`     | List tasks for the current user                            |
| `POST`   | `/api/tasks`     | Create a task (JSON body: `{ title, priority }`)           |
| `PATCH`  | `/api/tasks/:id` | Update a task (JSON body: `{ completed?, title? }`)        |
| `DELETE` | `/api/tasks/:id` | Delete a task                                              |
| `POST`   | `/api/reset`     | Clear all task and user data (for test cleanup)            |
| `GET`    | `/health`        | Health check                                               |

---

## Existing Test Coverage

The repo includes tests for:

- Authentication (redirect, login, invalid credentials)
- Adding a task
- Completing a task
- Deleting a task
- Task count
- Filtering (active and completed)

**Known issues with the existing tests which need to be addressed:**

- Some tests are failing - they need to be diagnosed and fixed
- There are some flaky and brittle tests
- Tests are slow which is causing friction amongst developers
- The test configuration has not been optimised for running in CI and is slowing down developer workflows
- There are some crucial test cases missing for regression
