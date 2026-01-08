const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

// GraphQL Introspection Enabled (Simulation)
router.get('/vulnerabilities/graphql', (req, res) => {
    res.render('layout', {
        page: 'vulnerability',
        content: `
            <h1>GraphQL Introspection</h1>
            <p>This endpoint simulates a GraphQL API with introspection enabled.</p>
            <p>Try querying for <code>__schema</code> to discover the API structure.</p>
            <form id="gqlForm">
                <textarea name="query" rows="5" style="width:100%">{ getUser(id: 1) { name } }</textarea><br>
                <button type="button" onclick="runGQL()">Run Query</button>
            </form>
            <pre id="gqlResult"></pre>
            <script>
                function runGQL() {
                    const query = document.querySelector('[name=query]').value;
                    fetch('/graphql', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ query: query })
                    })
                    .then(r => r.json())
                    .then(res => {
                        document.getElementById('gqlResult').innerText = JSON.stringify(res, null, 2);
                    });
                }
            </script>
        `
    });
});

// The Mock GraphQL Endpoint
router.post('/graphql', bodyParser.json(), (req, res) => {
    const query = req.body.query || "";

    // VULNERABLE: Introspection is enabled
    if (query.includes("__schema") || query.includes("__type")) {
        return res.json({
            data: {
                __schema: {
                    types: [
                        { name: "User", fields: [{ name: "id" }, { name: "username" }, { name: "password" }, { name: "isAdmin" }] },
                        { name: "Post", fields: [{ name: "id" }, { name: "title" }, { name: "content" }] }
                    ]
                }
            }
        });
    }

    // Normal mock response
    if (query.includes("getUser")) {
        return res.json({
            data: {
                getUser: {
                    name: "Alice",
                    id: "1"
                }
            }
        });
    }

    res.json({ error: "Syntax Error or Unknown Query" });
});

module.exports = router;
