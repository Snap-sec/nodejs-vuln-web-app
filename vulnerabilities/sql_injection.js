const express = require('express');
const router = express.Router();
const db = require('../database');

// 15. SQL Injection (Dedicated Endpoint)
router.get('/vulnerabilities/sqli', (req, res) => {
    const search = req.query.search;
    let sql = "SELECT * FROM users WHERE 1=1";
    if (search) {
        // VULNERABLE: SQL Injection via direct concatenation
        sql += ` AND username LIKE '%${search}%'`;
    }

    db.all(sql, (err, rows) => {
        if (err) return res.send("DB Error: " + err.message);
        if (req.query.json) {
            res.json(rows);
        } else {
            res.render('layout', {
                page: 'vulnerability',
                content: `
                <h1>SQL Injection Demo</h1>
                <p>Searching users table.</p>
                <code style="background:#eee; padding:5px;">${sql}</code>
                <hr>
                <pre>${JSON.stringify(rows, null, 2)}</pre>
            `
            });
        }
    });
});

module.exports = router;
