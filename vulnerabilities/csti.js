const express = require('express');
const router = express.Router();

// 9. Angular Client-Side Template Injection (CSTI)
router.get('/vulnerabilities/csti', (req, res) => {
    // Serves a page with Angular 1.x (user input in template)
    const name = req.query.name || 'World';
    res.render('layout', {
        page: 'vulnerability',
        content: `
        <!DOCTYPE html>
        <html ng-app>
        <head>
            <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.min.js"></script>
        </head>
        <body>
            <h1>Hello ${name}</h1>
            <p>Try injecting {{7*7}} in the name parameter</p>
        </body>
        </html>
    `
    });
});

module.exports = router;
