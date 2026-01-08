const express = require('express');
const router = express.Router();
const db = require('../database');

// 1. Reflected XSS
router.get('/vulnerabilities/xss', (req, res) => {
    const input = req.query.input || '';
    // VULNERABLE: Reflects input directly without escaping
    res.render('layout', {
        page: 'vulnerability',
        content: `<h1>XSS Demo</h1><p>You said: ${input}</p>`
    });
});

// 12. Stored XSS (Guestbook)
router.get('/vulnerabilities/stored-xss', (req, res) => {
    db.all("SELECT * FROM guestbook ORDER BY created_at DESC", (err, rows) => {
        if (err) return res.send("DB Error");
        let html = `<h1>Guestbook (Stored XSS)</h1>
        <form method="POST" action="/vulnerabilities/stored-xss">
            <textarea name="message" placeholder="Leave a message..." rows="3" style="width: 300px;"></textarea><br>
            <button type="submit">Sign Guestbook</button>
        </form>
        <hr>
        <h3>Messages:</h3>`;

        rows.forEach(row => {
            // VULNERABLE: Outputting stored content directly without escaping
            html += `<div style="border:1px solid #ccc; padding:10px; margin:5px;">
                <small>${row.created_at}</small><br>
                ${row.message} 
            </div>`;
        });
        res.render('layout', {
            page: 'vulnerability',
            content: html
        });
    });
});

router.post('/vulnerabilities/stored-xss', (req, res) => {
    const message = req.body.message;
    // VULNERABLE: Storing input directly without sanitization
    db.run(`INSERT INTO guestbook(message) VALUES(?)`, [message], (err) => {
        if (err) return res.send("Error saving message");
        res.redirect('/vulnerabilities/stored-xss');
    });
});

module.exports = router;
