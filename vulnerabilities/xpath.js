const express = require('express');
const router = express.Router();

// XPath Injection (Simulation)
router.get('/vulnerabilities/xpath', (req, res) => {
    const username = req.query.username;

    // Simulated XML Database
    const xmlDb = `
        <users>
            <user id="1"><name>admin</name><secret>SuperSecretAdminData</secret></user>
            <user id="2"><name>guest</name><secret>GuestData</secret></user>
        </users>
    `;

    if (username) {
        // VULNERABLE: Constructing XPath query with direct string concatenation
        // Attacker input: admin' or '1'='1
        // Resulting Query: //user[name/text()='admin' or '1'='1']
        const query = `//user[name/text()='${username}']`;

        let result = "No match found";

        // Simulation logic for demonstration (nodejs doesn't have native XPath in standard lib easily accessible without extensive setup, simulating the logical flaw)
        if (username.includes("' or '1'='1") || username === "admin") {
            result = "Found: <name>admin</name><secret>SuperSecretAdminData</secret>";
        } else if (username === "guest") {
            result = "Found: <name>guest</name><secret>GuestData</secret>";
        }

        res.render('layout', {
            page: 'vulnerability',
            content: `
                <h1>XPath Injection</h1>
                <p>Querying XML user database.</p>
                <code style="background:#eee; padding:5px;">${query}</code>
                <hr>
                <pre>${result}</pre>
            `
        });
    } else {
        res.render('layout', { page: 'vulnerability', content: 'Missing username parameter' });
    }
});

module.exports = router;
