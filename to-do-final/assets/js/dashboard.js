var taskUrl = "http://localhost:3000/tasks";
var loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
var currentFilter = "All";



if (loggedUser == null) {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("userName").innerText = loggedUser.username;
  document.getElementById("navUserName").innerText = loggedUser.username;
  document.getElementById("dueDate").setAttribute("min", getTodayDate());
  document.getElementById("taskForm").addEventListener("submit", saveTask);
  document
    .getElementById("addTaskBtn")
    .addEventListener("click", openAddTaskForm);
  document.getElementById("logoutBtn").addEventListener("click", logoutUser);
  document.getElementById("cancelBtn").addEventListener("click", clearForm);
  document
    .getElementById("dateRangeBtn")
    .addEventListener("click", showDateRangeFields);
  document
    .getElementById("fromDateFilter")
    .addEventListener("change", showTasks);
  document.getElementById("toDateFilter").addEventListener("change", showTasks);

  var filterButtons = document.querySelectorAll(".filter-btn");

  for (var i = 0; i < filterButtons.length; i++) {
    filterButtons[i].addEventListener("click", function () {
      currentFilter = this.getAttribute("data-filter");
      hideDateRangeFields();
      showTasks();
    });
  }

  showTasks().then(function () {
    if (sessionStorage.getItem("loginSuccess") === "true") {
      showToast("Login successful", "success", 3000);
      sessionStorage.removeItem("loginSuccess");
    }
  });
});

function openAddTaskForm() {
  resetTaskForm();
  document.getElementById("cancelBtn").style.display = "inline-block";
  showTaskForm();
}

function showTaskForm() {
  var formCard = document.getElementById("taskFormCard");

  var taskFormCollapse = bootstrap.Collapse.getOrCreateInstance(formCard, {
    toggle: false,
  });

  taskFormCollapse.show();
}

function hideTaskForm() {
  var formCard = document.getElementById("taskFormCard");

  var taskFormCollapse = bootstrap.Collapse.getOrCreateInstance(formCard, {
    toggle: false,
  });

  taskFormCollapse.hide();
}

function showDateRangeFields() {
  currentFilter = "Date Range";

  document.getElementById("dateRangeFields").classList.remove("d-none");
  document.getElementById("dateRangeFields").classList.add("d-block");

  showTasks();
}

function hideDateRangeFields() {
  document.getElementById("dateRangeFields").classList.add("d-none");
  document.getElementById("dateRangeFields").classList.remove("d-block");
  document.getElementById("fromDateFilter").value = "";
  document.getElementById("toDateFilter").value = "";
}

async function logoutUser() {
  var result = await Swal.fire({
    title: "Logout?",
    text: "Are you sure you want to logout?",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "logout",
  });

  if (!result.isConfirmed) {
    return;
  }

  localStorage.removeItem("loggedUser");
  window.location.href = "login.html";
}

async function saveTask(event) {
  event.preventDefault();

  var editId = document.getElementById("editId").value;
  var title = document.getElementById("title").value.trim();
  var description = document.getElementById("description").value.trim();
  var dueDate = document.getElementById("dueDate").value;
  var status = document.getElementById("status").value;

  if (title == "" || description == "" || dueDate == "") {
    alert("Please fill all task fields");
    return;
  }

  if (editId == "") {
    var response = await fetch(taskUrl);
    var tasks = await response.json();

    var task = new Task(
      tasks.length + 1,
      loggedUser.id,
      title,
      description,
      dueDate,
      new Date().toLocaleString(),
      status,
      false,
    );

    await task.addTask();

    clearForm();
    await showTasks();
    showToast("Task added successfully", "success", 3000);
  } else {
    var result = await Swal.fire({
      title: "Update task?",
      text: "Do you want to save these changes?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0d6efd",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, update",
    });

    if (result.isConfirmed) {
      var task = new Task(
        0,
        loggedUser.id,
        title,
        description,
        dueDate,
        "",
        status,
        false,
        editId,
      );

      await task.updateTask();

      clearForm();
      await showTasks();
    }
  }
}

async function showTasks() {
  var response = await fetch(taskUrl + "?userId=" + loggedUser.id);
  var tasks = await response.json();

  var taskObjects = [];

  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];

    var taskObject = new Task(
      task.taskId,
      task.userId,
      task.title,
      task.description,
      task.dueDate,
      task.createdDate,
      task.status,
      task.deleted,
      task.id,
    );

    taskObjects.push(taskObject);
  }

  var filteredTasks = filterTasks(taskObjects);

  displayTasks(filteredTasks);

  document.getElementById("filterTitle").innerText = currentFilter + " Tasks";
}

function filterTasks(tasks) {
  var result = [];
  var today = getTodayDate();

  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];

    if (currentFilter == "Deleted") {
      if (task.isDeleted()) {
        result.push(task);
      }
    } else if (task.deleted != true) {
      if (currentFilter == "All") {
        result.push(task);
      } else if (currentFilter == "Due Date") {
        result.push(task);
      } else if (currentFilter == "Overdue") {
        if (task.isOverdue(today)) {
          result.push(task);
        }
      } else if (currentFilter == "Date Range") {
        var fromDate = document.getElementById("fromDateFilter").value;

        var toDate = document.getElementById("toDateFilter").value;

        var createdDate = new Date(task.createdDate);

        var createdDateValue = !isNaN(createdDate)
          ? createdDate.toISOString().slice(0, 10)
          : "";

        if (
          createdDateValue &&
          (fromDate == "" || createdDateValue >= fromDate) &&
          (toDate == "" || createdDateValue <= toDate)
        ) {
          result.push(task);
        }
      } else if (task.status == currentFilter) {
        result.push(task);
      }
    }
  }

  if (currentFilter == "Due Date") {
    result.sort(function (a, b) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }

  return result;
}

function displayTasks(tasks) {
  var taskList = document.getElementById("taskList");
  var html = "";
  var today = getTodayDate();

  if (tasks.length == 0) {
    taskList.innerHTML =
      "<tr><td colspan='6' class='text-center text-muted'>No tasks found</td></tr>";
    return;
  }

  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];

    var rowClass = task.getRowClass(today);
    var statusClass = task.getStatusClass();

    html += "<tr class='" + rowClass + "'>";
    html += "<td>" + task.title + "</td>";
    html += "<td>" + task.description + "</td>";
    html += "<td>" + task.getCreatedDate() + "</td>";
    html += "<td>" + task.getDueDate() + "</td>";

    html +=
      "<td><span class='badge bg-" +
      statusClass +
      "'>" +
      task.status +
      "</span></td>";

    html += "<td>";

    if (task.isDeleted()) {
      html +=
        "<button class='btn btn-success btn-sm' onclick='restoreTask(\"" +
        task.id +
        "\")'><i class='bi bi-arrow-counterclockwise me-1'></i>Restore</button>";
    } else {
      html +=
        "<button class='btn btn-primary btn-sm icon-action-btn me-1' onclick='editTask(\"" +
        task.id +
        "\")' title='Edit task'><i class='bi bi-pencil-square'></i></button>";

      html +=
        "<button class='btn btn-danger btn-sm icon-action-btn' onclick='deleteTask(\"" +
        task.id +
        "\")' title='Delete task'><i class='bi bi-trash'></i></button>";
    }

    html += "</td>";
    html += "</tr>";
  }

  taskList.innerHTML = html;
}

async function editTask(id) {
  var response = await fetch(taskUrl + "/" + id);
  var taskData = await response.json();

  var task = new Task(
    taskData.taskId,
    taskData.userId,
    taskData.title,
    taskData.description,
    taskData.dueDate,
    taskData.createdDate,
    taskData.status,
    taskData.deleted,
    taskData.id,
  );

  document.getElementById("editId").value = task.id;
  document.getElementById("title").value = task.title;
  document.getElementById("description").value = task.description;
  document.getElementById("dueDate").value = task.dueDate;
  document.getElementById("status").value = task.status;
  document.getElementById("status").disabled = false;
  document.getElementById("formTitle").innerText = "Update Task";
  document.getElementById("saveBtn").innerHTML = "EDIT TASK";
  document.getElementById("saveBtn").setAttribute("title", "Update task");
  document.getElementById("cancelBtn").style.display = "inline-block";

  showTaskForm();
}

async function deleteTask(id) {
  var result = await Swal.fire({
    title: "Delete task?",
    text: "This task will move to deleted tasks.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, delete",
  });

  if (!result.isConfirmed) {
    return;
  }

  var task = new Task(0, loggedUser.id, "", "", "", "", "", false, id);

  await task.deleteTask();
  await showTasks();
}

async function restoreTask(id) {
  var result = await Swal.fire({
    title: "Restore task?",
    text: "This task will move back to active tasks.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#198754",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Restore",
  });

  if (!result.isConfirmed) {
    return;
  }

  var task = new Task(0, loggedUser.id, "", "", "", "", "", false, id);

  await task.restoreTask();
  await showTasks();
}

function clearForm() {
  resetTaskForm();
  hideTaskForm();
}

function resetTaskForm() {
  document.getElementById("taskForm").reset();
  document.getElementById("editId").value = "";
  document.getElementById("formTitle").innerText = "Add Task";
  document.getElementById("saveBtn").innerHTML = "save task";
  document.getElementById("saveBtn").setAttribute("title", "Add task");
  document.getElementById("cancelBtn").style.display = "none";
  document.getElementById("status").value = "Not Started";
  document.getElementById("status").disabled = true;
}

function getTodayDate() {
  var today = new Date();

  var year = today.getFullYear();
  var month = String(today.getMonth() + 1).padStart(2, "0");
  var day = String(today.getDate()).padStart(2, "0");

  return year + "-" + month + "-" + day;
}

function formatDisplayDate(dateValue) {
  var dateParts = dateValue.split("-");

  return dateParts[2] + "/" + dateParts[1] + "/" + dateParts[0];
}

function formatCreatedDate(createdDate) {
  var date = new Date(createdDate);

  if (isNaN(date)) {
    return createdDate;
  }

  var day = String(date.getDate()).padStart(2, "0");
  var month = String(date.getMonth() + 1).padStart(2, "0");
  var year = date.getFullYear();

  return day + "/" + month + "/" + year;
}

function showToast(message, variant, delay) {
  var toastEl = document.getElementById("dashboardToast");

  if (!toastEl) return;

  var toastBody = toastEl.querySelector(".toast-body");
  toastBody.textContent = message;

  toastEl.classList.remove(
    "text-bg-success",
    "text-bg-danger",
    "text-bg-warning",
    "text-bg-info",
  );

  toastEl.classList.add(
    variant === "success"
      ? "text-bg-success"
      : variant === "error"
        ? "text-bg-danger"
        : "text-bg-info",
  );

  var toast = bootstrap.Toast.getOrCreateInstance(toastEl, {
    delay: delay,
  });

  toast.show();
}
