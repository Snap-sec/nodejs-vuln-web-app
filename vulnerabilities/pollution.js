const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

// 14. Prototype Pollution
router.get('/vulnerabilities/pollution', (req, res) => {
    res.render('layout', {
        page: 'vulnerability',
        content: `
        <h1>Prototype Pollution</h1>
        <p>Send a JSON payload to merge into the server configuration.</p>
        <p>Current Admin Status check: ${global.isAdmin ? "TRUE" : "FALSE"}</p>
        <form method="POST" action="/vulnerabilities/pollution" enctype="application/json">
            <textarea name="json" rows="5" style="width: 300px;">{"__proto__": {"isAdmin": true}}</textarea><br>
            <button type="submit" onclick="event.preventDefault(); fetch('/vulnerabilities/pollution', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: document.querySelector('textarea').value}).then(r => r.text()).then(t => document.body.innerHTML += t)">Pollute</button>
        </form>
    `
    });
});

const merge = (target, source) => {
    for (let key in source) {
        if (typeof source[key] === 'object' && source[key] !== null) {
            if (!target[key]) target[key] = {};
            merge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
};

// Use bodyParser only for this router if not global, but it is global in app.js
// However, specific pollution route might need ensure json
router.post('/vulnerabilities/pollution', bodyParser.json(), (req, res) => {
    let payload = req.body;
    let config = {};

    // VULNERABLE: Recursive merge without key validation
    merge(config, payload);

    res.render('layout', { page: 'vulnerability', content: `<br>Config merged. Check if global Object prototype is polluted. <br> admin check: ${config.isAdmin || ({}).isAdmin}` });
});

module.exports = router;
