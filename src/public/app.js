(function () {
  "use strict";

  var currentFilter = "all";

  var taskForm = document.getElementById("task-form");
  var taskInput = document.getElementById("task-input");
  var prioritySelect = document.getElementById("priority-select");
  var taskList = document.getElementById("task-list");
  var taskCount = document.getElementById("task-count");
  var filterButtons = document.querySelectorAll(".filter-btn");
  var logoutBtn = document.getElementById("logout-btn");

  function init() {
    bindEvents();
    loadTasks();
  }

  function bindEvents() {
    taskForm.addEventListener("submit", handleAddTask);

    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        currentFilter = btn.dataset.filter;
        filterButtons.forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
        loadTasks();
      });
    });

    logoutBtn.addEventListener("click", handleLogout);
  }

  function handleAddTask(e) {
    e.preventDefault();

    var title = taskInput.value.trim();
    if (!title) return;

    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title,
        priority: prioritySelect.value,
      }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to add task");
        return res.json();
      })
      .then(function () {
        taskInput.value = "";
        taskInput.focus();
        loadTasks();
      })
      .catch(function (err) {
        console.error("Error adding task:", err);
      });
  }

  function loadTasks() {
    fetch("/api/tasks")
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load tasks");
        return res.json();
      })
      .then(function (tasks) {
        renderTasks(tasks);
      })
      .catch(function (err) {
        console.error("Error loading tasks:", err);
      });
  }

  function renderTasks(tasks) {
    taskList.innerHTML = "";

    var filtered = filterTasks(tasks);

    if (filtered.length === 0) {
      var emptyEl = document.createElement("li");
      emptyEl.className = "empty-state";
      emptyEl.textContent = "No tasks to display.";
      taskList.appendChild(emptyEl);
    }

    filtered.forEach(function (task) {
      var li = document.createElement("li");
      li.className = "task-item" + (task.completed ? " completed" : "");
      li.dataset.id = task.id;

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.addEventListener("change", function () {
        toggleTask(task.id, !task.completed);
      });

      var titleSpan = document.createElement("span");
      titleSpan.className = "task-title";
      titleSpan.textContent = task.title;

      var badge = document.createElement("span");
      badge.className = "priority-badge " + task.priority;
      badge.textContent = task.priority;

      var deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.setAttribute("aria-label", "Delete task");
      deleteBtn.innerHTML = "&times;";
      deleteBtn.addEventListener("click", function () {
        deleteTask(task.id);
      });

      li.appendChild(checkbox);
      li.appendChild(titleSpan);
      li.appendChild(badge);
      li.appendChild(deleteBtn);
      taskList.appendChild(li);
    });

    updateCount(tasks);
  }

  function filterTasks(tasks) {
    if (currentFilter === "active") {
      return tasks.filter(function (t) {
        return !t.completed;
      });
    }
    if (currentFilter === "completed") {
      return tasks.filter(function (t) {
        return t.completed;
      });
    }
    return tasks;
  }

  function toggleTask(id, completed) {
    fetch("/api/tasks/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: completed }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to update task");
        loadTasks();
      })
      .catch(function (err) {
        console.error("Error toggling task:", err);
      });
  }

  function deleteTask(id) {
    fetch("/api/tasks/" + id, { method: "DELETE" })
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to delete task");
        loadTasks();
      })
      .catch(function (err) {
        console.error("Error deleting task:", err);
      });
  }

  function updateCount(tasks) {
    var active = tasks.filter(function (t) {
      return !t.completed;
    }).length;
    var total = tasks.length;
    taskCount.textContent = active + " of " + total + " tasks remaining";
  }

  function handleLogout() {
    fetch("/api/logout", { method: "POST" }).then(function () {
      window.location.href = "/login";
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
