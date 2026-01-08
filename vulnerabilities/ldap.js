const express = require('express');
const router = express.Router();

// LDAP Injection (Simulation)
router.get('/vulnerabilities/ldap', (req, res) => {
    const user = req.query.user || '';

    // VULNERABLE: LDAP Filter construction
    // Standard Query: (&(uid=USER)(objectClass=person))
    // Injection: user = *
    // Result: (&(uid=*)(objectClass=person)) -> Returns all
    const filter = `(&(uid=${user})(objectClass=person))`;

    let result = "No matching user found.";

    // Simulation Logic
    const users = ["alice", "bob", "admin"];

    if (user.includes("*")) {
        // Wildcard injection simulation
        result = `Found users: ${users.join(", ")}`;
    } else if (users.includes(user)) {
        result = `Found user: ${user}`;
    }

    res.render('layout', {
        page: 'vulnerability',
        content: `
            <h1>LDAP Injection</h1>
            <p>Authenticating against LDAP.</p>
            <code style="background:#eee; padding:5px;">Filter: ${filter}</code>
            <hr>
            <pre>${result}</pre>
            <p>Try injecting <code>*</code> to list all users.</p>
        `
    });
});

module.exports = router;
