const express = require('express');
const router = express.Router();

// 3. Cookie Injection / Reflection
router.get('/vulnerabilities/cookie-reflect', (req, res) => {
    const param = req.query.param;
    if (param) {
        // VULNERABLE: Reflects parameter into cookie value (Header Injection potential if not validated)
        res.cookie('vulnerable_cookie', param);
        res.render('layout', { page: 'vulnerability', content: 'Cookie set' });
    } else {
        res.render('layout', { page: 'vulnerability', content: 'Missing param' });
    }
});

module.exports = router;
