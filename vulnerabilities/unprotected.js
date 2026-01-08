const express = require('express');
const router = express.Router();
const db = require('../database');

// 16. Unprotected API (Dedicated Endpoint)
router.get('/vulnerabilities/api/users', (req, res) => {
    // VULNERABLE: Exposing all user data without auth check
    db.all("SELECT * FROM users", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;
