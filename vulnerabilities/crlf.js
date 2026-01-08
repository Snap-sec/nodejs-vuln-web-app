const express = require('express');
const router = express.Router();

// 4. CRLF Injection
router.get('/vulnerabilities/crlf', (req, res) => {
    const input = req.query.input;
    if (input) {
        // VULNERABLE: Injecting input into a custom header
        res.setHeader('X-Custom-Header', input);
        res.render('layout', { page: 'vulnerability', content: 'Header set' });
    } else {
        res.render('layout', { page: 'vulnerability', content: 'Missing input' });
    }
});

module.exports = router;
