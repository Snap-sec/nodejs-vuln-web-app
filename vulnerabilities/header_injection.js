const express = require('express');
const router = express.Router();

// HTTP Header Injection
router.get('/vulnerabilities/header-injection', (req, res) => {
    const customHeader = req.query.header_val;

    if (customHeader) {
        // VULNERABLE: Writing arbitrary headers. 
        // Note: Node.js may block newlines (CRLF) in modern versions, but this demonstrates the logic flaw.
        try {
            res.setHeader('X-User-Input', customHeader);
            res.render('layout', {
                page: 'vulnerability',
                content: `
                    <h1>HTTP Header Injection</h1>
                    <p>Header <code>X-User-Input</code> was set to: ${customHeader}</p>
                    <p>Check your network tab.</p>
                `
            });
        } catch (e) {
            res.render('layout', { page: 'vulnerability', content: `Error setting header: ${e.message}` });
        }
    } else {
        res.render('layout', { page: 'vulnerability', content: 'Missing header_val parameter' });
    }
});

module.exports = router;
