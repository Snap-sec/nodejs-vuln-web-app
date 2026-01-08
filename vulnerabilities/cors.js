const express = require('express');
const router = express.Router();

// CORS Vulnerabilities Index
router.get('/vulnerabilities/cors', (req, res) => {
    res.render('layout', {
        page: 'vulnerability',
        content: `
        <h1>CORS Vulnerabilities</h1>
        <p>Select a scenario to test Cross-Origin Resource Sharing misconfigurations:</p>
        <div style="display: grid; gap: 10px;">
            <a href="/vulnerabilities/cors/wildcard" class="btn btn-outline" target="_blank">1. Wildcard with Credentials</a>
            <a href="/vulnerabilities/cors/subdomain" class="btn btn-outline" target="_blank">2. Trusted Subdomains (Bypass)</a>
            <a href="/vulnerabilities/cors/reflection" class="btn btn-outline" target="_blank">3. Arbitrary Origin Reflection</a>
            <a href="/vulnerabilities/cors/regex" class="btn btn-outline" target="_blank">4. Origin Regex Bypass</a>
            <a href="/vulnerabilities/cors/null" class="btn btn-outline" target="_blank">5. Null Origin Trust</a>
        </div>
        <hr>
        <p><a href="/dashboard">Return to Dashboard</a></p>
    `
    });
});

// 1. Wildcard with Credentials
router.get('/vulnerabilities/cors/wildcard', (req, res) => {
    // VULNERABLE: Combining wildcard origin with credentials (browser will likely block this, but server config is invalid/dangerous)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.json({ secret: "Wildcard + Creds", user: "admin" });
});

// 2. Trusted Subdomains (Logic Flaw)
router.get('/vulnerabilities/cors/subdomain', (req, res) => {
    const origin = req.headers.origin;
    if (origin) {
        // VULNERABLE: Checks if it ENDS with the trusted domain, allowing "evil-example.com"
        if (origin.endsWith('example.com')) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            return res.json({ secret: "Subdomain Bypass", info: "Origin ended with example.com" });
        }
    }
    res.json({ error: "Origin not trusted" });
});

// 3. Arbitrary Origin Reflection
router.get('/vulnerabilities/cors/reflection', (req, res) => {
    const origin = req.headers.origin;
    // VULNERABLE: Blindly reflecting the Origin header
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.json({ secret: "Reflection", info: `You came from: ${origin}` });
});

// 4. Origin Regex Bypass
router.get('/vulnerabilities/cors/regex', (req, res) => {
    const origin = req.headers.origin;
    // VULNERABLE: Weak regex that matches the string anywhere, or unescaped dots
    // e.g., /example.com/ matches "exampleocom.evil.net"
    if (origin && /example.com/.test(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        return res.json({ secret: "Regex Bypass", info: "Matched /example.com/" });
    }
    res.json({ error: "Origin did not match regex" });
});

// 5. Null Origin Trust
router.get('/vulnerabilities/cors/null', (req, res) => {
    const origin = req.headers.origin;
    // VULNERABLE: Explicitly trusting "null" (often from sandboxed iframes)
    if (origin === 'null') {
        res.setHeader('Access-Control-Allow-Origin', 'null');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        return res.json({ secret: "Null Origin Trusted" });
    }
    res.json({ error: "Origin was not null" });
});

module.exports = router;
