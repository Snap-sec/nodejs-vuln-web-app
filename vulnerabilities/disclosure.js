const express = require('express');
const router = express.Router();
const fs = require('fs');

// 1. Internal IP Disclosure
router.get('/internal-ip', (req, res) => {
    // VULNERABLE: Exposing internal network details
    res.json({
        internal_ip: "10.0.0.15",
        subnet: "10.0.0.0/24",
        gateway: "10.0.0.1"
    });
});

// 2. Software Version Disclosure
router.get('/version', (req, res) => {
    // VULNERABLE: Giving attackers precise version info to look up CVEs
    res.set('X-Powered-By', 'Express/4.17.1'); // Normally redundant if already set, but purely explicit here
    res.json({
        app: "VulnApp 1.0.0-dev",
        runtime: "Node.js v14.17.0",
        framework: "Express v4.17.1",
        database: "SQLite 3.32.3"
    });
});

// 3. Environment Variable Exposure
router.get('/env', (req, res) => {
    // VULNERABLE: Dumping process environment
    res.json(process.env);
});

// 4. Backup Files Exposed
router.get('/config.js.bak', (req, res) => {
    // VULNERABLE: Serving backup file
    res.type('text/javascript');
    res.send(`
// BACKUP DATE: 2025-01-01
const config = {
    db_host: "localhost",
    db_user: "admin",
    db_pass: "SuperSecretPassword123!" // HARDCODED SECRET
};
module.exports = config;
    `);
});

// 5. .git Folder Exposure
router.get('/.git/HEAD', (req, res) => {
    // VULNERABLE: Git repository exposed
    res.type('text/plain');
    res.send("ref: refs/heads/main");
});
router.get('/.git/config', (req, res) => {
    res.type('text/plain');
    res.send(`
[core]
	repositoryformatversion = 0
	filemode = true
	bare = false
	logallrefupdates = true
[remote "origin"]
	url = https://github.com/imran/vuln-crm.git
	fetch = +refs/heads/*:refs/remotes/origin/*
    `);
});

// 6. .env File Exposure
router.get('/.env', (req, res) => {
    // VULNERABLE: Dotfile exposure
    res.type('text/plain');
    res.send(`
PORT=3000
DB_PASSWORD=production_secret_key_change_me
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
    `);
});

// 7. Swagger/OpenAPI Publicly Accessible
router.get('/swagger.json', (req, res) => {
    // VULNERABLE: Full API documentation exposed
    res.json({
        swagger: "2.0",
        info: { title: "Vulnerable API", version: "1.0.0" },
        paths: {
            "/login": { post: { summary: "Login" } },
            "/admin/users": { get: { summary: "List Users (Admin Only)" } }
        }
    });
});

// 8. Directory Listing Enabled (Simulation)
router.get('/vulnerabilities/directory-listing', (req, res) => {
    // VULNERABLE: Simulating an open directory listing
    res.render('layout', {
        page: 'vulnerability',
        content: `
            <h1>Index of /uploads/</h1>
            <hr>
            <table>
                <tr><th>Name</th><th>Last modified</th><th>Size</th></tr>
                <tr><td><a href="#">Parent Directory/</a></td><td>-</td><td>-</td></tr>
                <tr><td><a href="/config.js.bak">config.js.bak</a></td><td>2025-01-01 12:00</td><td>1024</td></tr>
                <tr><td><a href="/.env">.env</a></td><td>2025-02-15 08:30</td><td>512</td></tr>
                <tr><td><a href="/images/logo.png">logo.png</a></td><td>2024-11-20 09:15</td><td>20480</td></tr>
                <tr><td><a href="#">user_exports.csv</a></td><td>2025-03-10 14:22</td><td>5MB</td></tr>
            </table>
            <hr>
            <address>Apache/2.4.1 (Unix) Server at localhost Port 3000</address>
        `
    });
});

// Dashboard Card helper for Info Leaks
router.get('/vulnerabilities/disclosure', (req, res) => {
    res.render('layout', {
        page: 'vulnerability',
        content: `
            <h1>Information Disclosure</h1>
            <p>Various endpoints leaking sensitive operational data:</p>
            <ul>
                <li><a href="/internal-ip" target="_blank">Internal IP Disclosure</a></li>
                <li><a href="/version" target="_blank">Software Version Disclosure</a></li>
                <li><a href="/env" target="_blank">Environment Variables (DANGER)</a></li>
                <li><a href="/config.js.bak" target="_blank">Backup File (.bak)</a></li>
                <li><a href="/.git/HEAD" target="_blank">.git Folder Exposure</a></li>
                <li><a href="/.env" target="_blank">.env File Exposure</a></li>
                <li><a href="/swagger.json" target="_blank">Swagger/OpenAPI Definition</a></li>
                <li><a href="/vulnerabilities/directory-listing" target="_blank">Directory Listing</a></li>
            </ul>
        `
    });
});

module.exports = router;
