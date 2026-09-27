const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = 3000;

// Allow JSON data
app.use(express.json());

// Serve the frontend
app.use(express.static(path.join(__dirname, "../frontend")));


// ================================
// GET ALL TASKS
// ================================

app.get("/api/tasks", (req, res) => {
    try {
        const tasks = db.prepare(`
            SELECT *
            FROM tasks
            ORDER BY id DESC
        `).all();

        res.json(tasks);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch tasks"
        });
    }
});


// ================================
// ADD TASK
// ================================

app.post("/api/tasks", (req, res) => {
    try {
        const { title } = req.body;

        if (!title || title.trim() === "") {
            return res.status(400).json({
                error: "Task title is required"
            });
        }

        const result = db.prepare(`
            INSERT INTO tasks (title)
            VALUES (?)
        `).run(title.trim());

        const task = db.prepare(`
            SELECT *
            FROM tasks
            WHERE id = ?
        `).get(result.lastInsertRowid);

        res.status(201).json(task);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to add task"
        });
    }
});


// ================================
// UPDATE TASK
// ================================

app.put("/api/tasks/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        const { completed } = req.body;

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: "Invalid task ID"
            });
        }

        const result = db.prepare(`
            UPDATE tasks
            SET completed = ?
            WHERE id = ?
        `).run(completed ? 1 : 0, id);

        if (result.changes === 0) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        const task = db.prepare(`
            SELECT *
            FROM tasks
            WHERE id = ?
        `).get(id);

        res.json(task);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to update task"
        });
    }
});


// ================================
// DELETE TASK
// ================================

app.delete("/api/tasks/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: "Invalid task ID"
            });
        }

        const result = db.prepare(`
            DELETE FROM tasks
            WHERE id = ?
        `).run(id);

        if (result.changes === 0) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to delete task"
        });
    }
});


// ================================
// START SERVER
// ================================
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
