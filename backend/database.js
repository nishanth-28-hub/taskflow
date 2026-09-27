require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test database connection
pool.query("SELECT NOW()")
    .then(() => {
        console.log(
            "PostgreSQL database connected successfully."
        );
    })
    .catch((error) => {
        console.error(
            "Database connection failed:",
            error.message
        );
    });

module.exports = pool;