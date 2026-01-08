const express = require('express');
const router = express.Router();
const db = require('../database');

// 11. IDOR (Insecure Direct Object Reference)
router.get('/vulnerabilities/idor/user', (req, res) => {
    const id = req.query.id;
    if (!id) return res.render('layout', { page: 'vulnerability', content: "Missing id parameter" });

    // VULNERABLE: No check if the requested ID matches the logged-in user
    db.get(`SELECT * FROM users WHERE id = ${id}`, (err, row) => {
        if (err) return res.render('layout', { page: 'vulnerability', content: "Database error" });
        if (!row) return res.render('layout', { page: 'vulnerability', content: "User not found" });
        res.render('layout', {
            page: 'vulnerability',
            content: `
            <h1>User Profile (IDOR Demo)</h1>
            <p><strong>ID:</strong> ${row.id}</p>
            <p><strong>Username:</strong> ${row.username}</p>
            <p><strong>Password:</strong> ${row.password} (Sensitive Data Exposed!)</p>
            <p><strong>Is Admin:</strong> ${row.isAdmin}</p>
        `
        });
    });
});

module.exports = router;
