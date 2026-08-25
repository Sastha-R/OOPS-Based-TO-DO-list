class Task {
  constructor(taskId,userId,title,description,dueDate,createdDate,status,deleted,id,) {
    this.taskId = taskId;
    this.userId = userId;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.createdDate = createdDate;
    this.status = status;
    this.deleted = deleted;
    this.id = id;
  }

  async addTask() {
    var response = await fetch(taskUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(this),
    });

    await response.json();
  }

  async updateTask() {
    var updatedTask = {
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      status: this.status,
    };

    var response = await fetch(taskUrl + "/" + this.id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTask),
    });

    await response.json();
  }

  async deleteTask() {
    var response = await fetch(taskUrl + "/" + this.id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deleted: true,
      }),
    });

    await response.json();
  }

  async restoreTask() {
    var response = await fetch(taskUrl + "/" + this.id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deleted: false,
      }),
    });

    await response.json();
  }

  isDeleted() {
    return this.deleted == true;
  }

  isCompleted() {
    return this.status == "Completed";
  }

  isOverdue(today) {
    return (
      this.dueDate < today && this.status != "Completed" && this.deleted != true
    );
  }

  getStatusClass() {
    if (this.status == "Completed") {
      return "success";
    } else if (this.status == "Pending") {
      return "warning";
    }

    return "secondary";
  }

  getRowClass(today) {
    if (this.isOverdue(today)) {
      return "table-danger overdue-row";
    }

    return "";
  }

  getCreatedDate() {
    var date = new Date(this.createdDate);

    if (isNaN(date)) {
      return this.createdDate;
    }

    var day = String(date.getDate()).padStart(2, "0");
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var year = date.getFullYear();

    return day + "/" + month + "/" + year;
  }

  getDueDate() {
    var dateParts = this.dueDate.split("-");

    return dateParts[2] + "/" + dateParts[1] + "/" + dateParts[0];
  }
}