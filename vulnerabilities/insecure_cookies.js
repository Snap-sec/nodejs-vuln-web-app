const express = require('express');
const router = express.Router();

// 17. Insecure Cookies Endpoint
router.get('/vulnerabilities/insecure-cookies', (req, res) => {
    // VULNERABLE: Setting cookies with missing security flags
    res.cookie('vuln_cookie', 'exploitable_value', {
        httpOnly: false, // VIOLATION: Missing HttpOnly flag
        secure: false    // VIOLATION: Missing Secure flag
        // VIOLATION: Missing SameSite attribute (defaults to browser policy)
    });
    res.render('layout', {
        page: 'vulnerability',
        content: `
        <h1>Insecure Cookies Set</h1>
        <p>The server has set a cookie named <code>vuln_cookie</code> with the following insecure configuration:</p>
        <ul>
            <li><strong>HttpOnly:</strong> Missing (False) - <em>Accessible via JavaScript</em></li>
            <li><strong>Secure:</strong> Missing (False) - <em>Sent over unencrypted HTTP</em></li>
            <li><strong>SameSite:</strong> Missing - <em>Vulnerable to CSRF</em></li>
        </ul>
        <p><a href="/dashboard">Return to Dashboard</a></p>
    `
    });
});

module.exports = router;
