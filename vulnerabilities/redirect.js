const express = require('express');
const router = express.Router();

// 2. Open Redirect
router.get('/vulnerabilities/redirect', (req, res) => {
    const url = req.query.url;
    // VULNERABLE: Redirects to arbitrary URL
    if (url) {
        res.redirect(url);
    } else {
        res.render('layout', { page: 'vulnerability', content: 'Missing url parameter' });
    }
});

module.exports = router;
