const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./vuln-db.sqlite');

db.serialize(() => {
    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT, -- Storing plaintext passwords intentionally for vulnerability
        isAdmin INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS guestbook (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Seed Admin User
    db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
        if (!row) {
            db.run("INSERT INTO users (username, password, isAdmin) VALUES ('admin', 'admin', 1)");
            console.log("Admin user created (admin/admin)");
        }
    });
});

module.exports = db;
