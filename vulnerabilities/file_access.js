const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');

// 7. Local File Inclusion (LFI)
router.get('/vulnerabilities/lfi', (req, res) => {
    const file = req.query.file;
    if (file) {
        // VULNERABLE: Reading arbitrary file path
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) return res.send("Error reading file: " + err.message);
            res.render('layout', { page: 'vulnerability', content: `<pre>${data}</pre>` });
        });
    } else {
        res.render('layout', { page: 'vulnerability', content: 'Missing file parameter' });
    }
});

// 8. Server-Side Request Forgery (SSRF) / Remote File Inclusion (RFI) simulation
router.get('/vulnerabilities/ssrf', (req, res) => {
    const url = req.query.url;
    if (url) {
        // VULNERABLE: Fetching arbitrary URL (basic simulation using curl via exec for simplicity)
        exec(`curl ${url}`, (error, stdout, stderr) => {
            if (error) return res.send("Error fetching URL");
            res.render('layout', { page: 'vulnerability', content: `<pre>${stdout}</pre>` });
        });
    } else {
        res.render('layout', { page: 'vulnerability', content: 'Missing url parameter' });
    }
});

module.exports = router;
