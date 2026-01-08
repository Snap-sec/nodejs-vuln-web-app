const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

// Mass Assignment
router.get('/vulnerabilities/mass-assignment', (req, res) => {
    res.render('layout', {
        page: 'vulnerability',
        content: `
            <h1>Mass Assignment</h1>
            <p>Update your profile. The backend blindly copies JSON fields to the user object.</p>
            <p>Current Role: <strong>Guest</strong></p>
            <form id="maForm">
                <label>Username:</label> <input type="text" name="username" value="guest"><br>
                <label>Email:</label> <input type="email" name="email" value="guest@example.com"><br>
                <button type="button" onclick="submitProfile()">Update Profile</button>
            </form>
            <p>Try sending <code>"role": "admin"</code> in the JSON body.</p>
            <pre id="maResult"></pre>
            <script>
                function submitProfile() {
                    const data = {
                        username: document.querySelector('[name=username]').value,
                        email: document.querySelector('[name=email]').value
                    };
                    // Attacker could modify this data object in console or proxy
                    
                    fetch('/vulnerabilities/mass-assignment', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(data)
                    })
                    .then(r => r.json())
                    .then(res => {
                        document.getElementById('maResult').innerText = JSON.stringify(res, null, 2);
                    });
                }
            </script>
        `
    });
});

router.post('/vulnerabilities/mass-assignment', bodyParser.json(), (req, res) => {
    let user = {
        id: 101,
        username: "guest",
        email: "guest@example.com",
        role: "guest",
        isAdmin: false
    };

    const input = req.body;

    // VULNERABLE: Mass assignment - overwriting all properties including protected ones
    Object.assign(user, input);

    res.json({
        message: "Profile Updated",
        updatedUser: user
    });
});

module.exports = router;
