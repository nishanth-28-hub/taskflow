const Database = require("better-sqlite3");
const path = require("path");

// Location of the SQLite database file
const dbPath = path.join(__dirname, "todo.db");

// Create or open the database
const db = new Database(dbPath);

// Create the tasks table if it doesn't exist
db.prepare(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

console.log("Database connected successfully.");

module.exports = db;