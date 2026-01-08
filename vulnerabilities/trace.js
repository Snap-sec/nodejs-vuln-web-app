const express = require('express');
const router = express.Router();

// 10. ASP.NET Trace (Simulation)
router.get('/trace.axd', (req, res) => {
    res.type('text/plain');
    res.render('layout', {
        page: 'vulnerability',
        content: `
<pre>
Application Trace

Requests:
1. GET /login (200 OK)
2. POST /login (302 Found)
...
</pre>
    `
    });
});

module.exports = router;
