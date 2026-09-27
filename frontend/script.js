const API_URL = "/api/tasks";


// =====================================
// GET HTML ELEMENTS
// =====================================

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

const emptyState = document.getElementById("emptyState");
const message = document.getElementById("message");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");

const taskCountText = document.getElementById("taskCountText");

const searchInput = document.getElementById("searchInput");

const filterButtons = document.querySelectorAll(".filter-button");

const themeButton = document.getElementById("themeButton");
const themeIcon = document.getElementById("themeIcon");

const currentDate = document.getElementById("currentDate");


// =====================================
// VARIABLES
// =====================================

let tasks = [];

let currentFilter = "all";


// =====================================
// SHOW CURRENT DATE
// =====================================

function showCurrentDate() {

    const date = new Date();

    currentDate.textContent = date.toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}

showCurrentDate();


// =====================================
// SHOW MESSAGE
// =====================================

function showMessage(text) {

    message.textContent = text;

    message.classList.add("show");

    setTimeout(() => {
        message.classList.remove("show");
    }, 3000);
}


// =====================================
// LOAD TASKS
// =====================================

async function loadTasks() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load tasks");
        }

        tasks = await response.json();

        renderTasks();

    } catch (error) {

        console.error(error);

        showMessage(
            "Could not connect to the server."
        );
    }
}


// =====================================
// RENDER TASKS
// =====================================

function renderTasks() {

    const searchText =
        searchInput.value.toLowerCase().trim();


    let filteredTasks = tasks.filter(task => {

        const matchesSearch =
            task.title
                .toLowerCase()
                .includes(searchText);


        if (currentFilter === "active") {
            return task.completed === 0 && matchesSearch;
        }


        if (currentFilter === "completed") {
            return task.completed === 1 && matchesSearch;
        }


        return matchesSearch;
    });


    taskList.innerHTML = "";


    // Empty state
    if (filteredTasks.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";
    }


    // Create task cards
    filteredTasks.forEach(task => {

        const card = document.createElement("div");

        card.className = "task-card";

        if (task.completed === 1) {
            card.classList.add("completed");
        }


        const checkbox =
            document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.className = "task-checkbox";

        checkbox.checked =
            task.completed === 1;


        checkbox.addEventListener(
            "change",
            () => toggleTask(task)
        );


        const title =
            document.createElement("div");

        title.className = "task-title";

        title.textContent = task.title;


        const actions =
            document.createElement("div");

        actions.className = "task-actions";


        // Edit button
        const editButton =
            document.createElement("button");

        editButton.className =
            "action-button";

        editButton.textContent = "✏️";

        editButton.title = "Edit task";

        editButton.addEventListener(
            "click",
            () => editTask(task)
        );


        // Delete button
        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "action-button delete-button";

        deleteButton.textContent = "🗑️";

        deleteButton.title = "Delete task";

        deleteButton.addEventListener(
            "click",
            () => deleteTask(task.id)
        );


        actions.appendChild(editButton);

        actions.appendChild(deleteButton);


        card.appendChild(checkbox);

        card.appendChild(title);

        card.appendChild(actions);


        taskList.appendChild(card);

    });


    updateStatistics();
}


// =====================================
// UPDATE STATISTICS
// =====================================

function updateStatistics() {

    const total = tasks.length;

    const completed =
        tasks.filter(
            task => task.completed === 1
        ).length;

    const pending =
        total - completed;


    totalTasks.textContent = total;

    completedTasks.textContent = completed;

    pendingTasks.textContent = pending;


    taskCountText.textContent =
        `${total} ${total === 1 ? "task" : "tasks"}`;
}


// =====================================
// ADD TASK
// =====================================

taskForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const title =
            taskInput.value.trim();


        if (!title) {
            return;
        }


        try {

            const response = await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        title: title
                    })
                }
            );


            if (!response.ok) {
                throw new Error(
                    "Failed to add task"
                );
            }


            const newTask =
                await response.json();


            tasks.unshift(newTask);


            taskInput.value = "";


            renderTasks();

        } catch (error) {

            console.error(error);

            showMessage(
                "Could not add the task."
            );
        }
    }
);


// =====================================
// TOGGLE TASK
// =====================================

async function toggleTask(task) {

    try {

        const newStatus =
            task.completed === 1 ? 0 : 1;


        const response = await fetch(
            `${API_URL}/${task.id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    completed: newStatus
                })
            }
        );


        if (!response.ok) {
            throw new Error(
                "Failed to update task"
            );
        }


        const updatedTask =
            await response.json();


        const index =
            tasks.findIndex(
                item => item.id === task.id
            );


        if (index !== -1) {
            tasks[index] = updatedTask;
        }


        renderTasks();

    } catch (error) {

        console.error(error);

        showMessage(
            "Could not update the task."
        );

    }
}


// =====================================
// EDIT TASK
// =====================================

async function editTask(task) {

    const newTitle =
        prompt(
            "Edit your task:",
            task.title
        );


    if (
        newTitle === null ||
        newTitle.trim() === ""
    ) {
        return;
    }


    try {

        /*
         * Our current backend PUT route
         * handles the completed field.
         *
         * We'll improve the backend later
         * to support editing titles properly.
         */

        showMessage(
            "Edit feature will be connected in the next step."
        );

    } catch (error) {

        console.error(error);

    }
}


// =====================================
// DELETE TASK
// =====================================

async function deleteTask(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {
            throw new Error(
                "Failed to delete task"
            );
        }


        tasks =
            tasks.filter(
                task => task.id !== id
            );


        renderTasks();

    } catch (error) {

        console.error(error);

        showMessage(
            "Could not delete the task."
        );
    }
}


// =====================================
// SEARCH
// =====================================

searchInput.addEventListener(
    "input",
    renderTasks
);


// =====================================
// FILTERS
// =====================================

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(
                item =>
                    item.classList.remove("active")
            );


            button.classList.add("active");


            currentFilter =
                button.dataset.filter;


            renderTasks();

        }
    );

});


// =====================================
// DARK MODE
// =====================================

themeButton.addEventListener(
    "click",
    () => {

        document.body.classList.toggle("dark");


        const darkMode =
            document.body.classList.contains("dark");


        if (darkMode) {

            themeIcon.textContent = "☀";

            themeButton.lastElementChild.textContent =
                "Light Mode";

        } else {

            themeIcon.textContent = "☾";

            themeButton.lastElementChild.textContent =
                "Dark Mode";
        }

    }
);


// =====================================
// START APPLICATION
// =====================================

loadTasks();