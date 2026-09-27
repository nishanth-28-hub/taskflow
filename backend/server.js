const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = 3000;

// ================================
// MIDDLEWARE
// ================================

app.use(express.json());

// ================================
// SERVE FRONTEND
// ================================

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);

// ================================
// GET ALL TASKS
// ================================

app.get("/api/tasks", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT *
            FROM tasks
            ORDER BY id DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("GET /api/tasks error:", error);

        res.status(500).json({
            error: "Failed to fetch tasks"
        });
    }
});

// ================================
// ADD TASK
// ================================

app.post("/api/tasks", async (req, res) => {
    try {
        const { title } = req.body;

        if (!title || title.trim() === "") {
            return res.status(400).json({
                error: "Task title is required"
            });
        }

        const result = await db.query(
            `
            INSERT INTO tasks (title)
            VALUES ($1)
            RETURNING *
            `,
            [title.trim()]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("POST /api/tasks error:", error);

        res.status(500).json({
            error: "Failed to add task"
        });
    }
});

// ================================
// UPDATE TASK
// ================================

app.put("/api/tasks/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { title, completed } = req.body;

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: "Invalid task ID"
            });
        }

        // Find the existing task
        const existingResult = await db.query(
            `
            SELECT *
            FROM tasks
            WHERE id = $1
            `,
            [id]
        );

        if (existingResult.rows.length === 0) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        const existingTask = existingResult.rows[0];

        // Keep existing title if title was not supplied
        const newTitle =
            title !== undefined
                ? String(title).trim()
                : existingTask.title;

        // Keep existing completion status if not supplied
        const newCompleted =
            completed !== undefined
                ? (completed ? 1 : 0)
                : existingTask.completed;

        if (!newTitle) {
            return res.status(400).json({
                error: "Task title is required"
            });
        }

        const result = await db.query(
            `
            UPDATE tasks
            SET title = $1,
                completed = $2
            WHERE id = $3
            RETURNING *
            `,
            [newTitle, newCompleted, id]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error("PUT /api/tasks/:id error:", error);

        res.status(500).json({
            error: "Failed to update task"
        });
    }
});

// ================================
// DELETE TASK
// ================================

app.delete("/api/tasks/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: "Invalid task ID"
            });
        }

        const result = await db.query(
            `
            DELETE FROM tasks
            WHERE id = $1
            RETURNING id
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        console.error("DELETE /api/tasks/:id error:", error);

        res.status(500).json({
            error: "Failed to delete task"
        });
    }
});

// ================================
// START SERVER LOCALLY
// ================================

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(
            `Server running at http://localhost:${PORT}`
        );
    });
}

// ================================
// EXPORT FOR VERCEL
// ================================

module.exports = app;