require("dotenv").config();

const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);

// GET all tasks
app.get("/api/tasks", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT *
            FROM tasks
            ORDER BY id DESC
        `);

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to fetch tasks"
        });
    }
});

// ADD task
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

        console.error(error);

        res.status(500).json({
            error: "Failed to add task"
        });
    }
});

// UPDATE task
app.put("/api/tasks/:id", async (req, res) => {

    try {

        const id = Number(req.params.id);

        const { title, completed } = req.body;

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: "Invalid task ID"
            });
        }

        const existingResult = await db.query(
            "SELECT * FROM tasks WHERE id = $1",
            [id]
        );

        if (existingResult.rows.length === 0) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        const existingTask = existingResult.rows[0];

        const newTitle =
            title !== undefined
                ? String(title).trim()
                : existingTask.title;

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

        console.error(error);

        res.status(500).json({
            error: "Failed to update task"
        });
    }
});

// DELETE task
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

        console.error(error);

        res.status(500).json({
            error: "Failed to delete task"
        });
    }
});

// Start server locally
if (require.main === module) {

<<<<<<< HEAD
// ================================
// START SERVER
// ================================
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
=======
    app.listen(PORT, () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    });

}

module.exports = app;
>>>>>>> 4cd4ba7 (Migrate TaskFlow to Neon PostgreSQL)
