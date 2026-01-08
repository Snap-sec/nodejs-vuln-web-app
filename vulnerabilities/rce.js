const express = require('express');
const router = express.Router();
const { exec } = require('child_process');

// 5. OS Command Injection
router.get('/vulnerabilities/ping', (req, res) => {
    const ip = req.query.ip;
    if (ip) {
        // VULNERABLE: Concatenating input directly into exec
        exec(`ping -c 1 ${ip}`, (error, stdout, stderr) => {
            if (error) {
                return res.send(`Error: ${error.message}`);
            }
            res.render('layout', { page: 'vulnerability', content: `<pre>${stdout}</pre>` });
        });
    } else {
        res.render('layout', { page: 'vulnerability', content: 'Missing ip parameter' });
    }
});

// 6. Python Code Injection
router.get('/vulnerabilities/pymath', (req, res) => {
    const code = req.query.code;
    if (code) {
        // VULNERABLE: Executing arbitrary Python code
        exec(`python3 -c "print(${code})"`, (error, stdout, stderr) => {
            if (error) {
                return res.send(`Error: ${stderr || error.message}`);
            }
            res.render('layout', { page: 'vulnerability', content: `<pre>Result: ${stdout}</pre>` });
        });
    } else {
        res.render('layout', { page: 'vulnerability', content: 'Missing code parameter (e.g., 2+2)' });
    }
});

// 13. Insecure Deserialization (Simulation)
router.get('/vulnerabilities/deserialize', (req, res) => {
    res.render('layout', {
        page: 'vulnerability',
        content: `
        <h1>Insecure Deserialization</h1>
        <p>Enter a JS payload to "deserialize" (execute):</p>
        <form method="POST" action="/vulnerabilities/deserialize">
            <textarea name="payload" rows="3" style="width: 100%;">console.log("Deserialized!")</textarea><br>
            <button type="submit">Deserialize</button>
        </form>
    `
    });
});

router.post('/vulnerabilities/deserialize', (req, res) => {
    const payload = req.body.payload;
    try {
        // VULNERABLE: Using eval() to simulate insecure deserialization of code/objects
        const result = eval(payload);
        res.render('layout', { page: 'vulnerability', content: `Object deserialized. Result: ${result}` });
    } catch (e) {
        res.render('layout', { page: 'vulnerability', content: `Deserialization error: ${e.message}` });
    }
});

module.exports = router;
