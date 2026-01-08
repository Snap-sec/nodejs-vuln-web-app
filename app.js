const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');
const { exec } = require('child_process'); // For Command Injection / RCE
const fs = require('fs'); // For LFI
const app = express();
const PORT = 3000;


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Mock Session
app.use((req, res, next) => {
    if (!req.session) {
        req.session = {};
    }
    next();
});

// --- VULNERABILITY: Insecure Headers & Configuration ---
// Global Error Handler - Verbose (Stack Traces Exposed)
app.use((err, req, res, next) => {
    console.error(err.stack);
    // VULNERABLE: Exposing stack trace to user
    res.status(500).send(`
        <h1>500 Internal Server Error</h1>
        <p>Debug Mode: ON</p>
        <pre>${err.stack}</pre>
    `);
});
app.use((req, res, next) => {
    // 1. Server Version Disclosure
    res.setHeader('Server', 'Apache/2.4.1 (Unix)'); // Fake but disclosing
    // 2. X-Powered-By (Express default is on, but ensuring it)
    res.setHeader('X-Powered-By', 'Express');

    // 3. Weak or Malformed X-Content-Type-Options
    // res.setHeader('X-Content-Type-Options', 'allow'); // insecure value (commented out to allow full missing header)

    // MISSING SECURITY HEADERS (Explicitly not setting them)
    // - Content-Security-Policy
    // - Strict-Transport-Security
    // - X-Frame-Options (Clickjacking vulnerability)
    // - Referrer-Policy

    // TODO: Remove hardcoded secret before production
    // AWS_SECRET = "AKIA_FAKE_SECRET_KEY_FOR_DEMO"; 

    next();
});

// Mock Session Middleware (Insecure Cookies)
app.use((req, res, next) => {
    // 5. Missing 'Secure' and 'HttpOnly' flags on cookies
    // (Simulated by setting a dummy tracking cookie for every request)
    res.cookie('tracking_id', '12345', {
        secure: false, // VULNERABILITY: Missing Secure
        httpOnly: false // VULNERABILITY: Missing HttpOnly
        // VULNERABILITY: Missing SameSite Attribute (defaults to browser policy, often Lax, but not enforced)
    });
    next();
});
app.set('view engine', 'ejs');

// Basic Session Simulation (Vulnerable - Global State)
let currentSessionUser = null;

// Middleware to make user available in views
app.use((req, res, next) => {
    res.locals.user = currentSessionUser;
    next();
});

// Root Route
app.get('/', (req, res) => {
    if (currentSessionUser) {
        res.redirect('/dashboard');
    } else {
        res.render('layout', { page: 'login', error: null });
    }
});

// Dashboard Route (New Default)
app.get('/dashboard', (req, res) => {
    if (!currentSessionUser) {
        return res.redirect('/');
    }
    res.render('layout', { page: 'dashboard' }); // Requires dashboard.ejs
});

// Login Routes
app.get('/login', (req, res) => {
    res.render('layout', { page: 'login' });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // VULNERABLE: Direct string concatenation enabling SQL Injection
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    console.log("Executing Query:", query); // Log to show the injection

    db.get(query, (err, row) => {
        if (err) {
            console.error(err);
            return res.render('layout', { page: 'login', error: "Database error" });
        }
        if (row) {
            currentSessionUser = row; // Log in the user (Global State Vulnerability)
            res.redirect('/dashboard');
        } else {
            res.render('layout', { page: 'login', error: "Invalid credentials" });
        }
    });
});

app.get('/logout', (req, res) => {
    currentSessionUser = null;
    res.redirect('/login');
});

app.get('/register', (req, res) => {
    res.render('layout', { page: 'register' });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    // VULNERABLE: Direct string concatenation enabling SQL Injection
    const query = `INSERT INTO users(username, password, isAdmin) VALUES('${username}', '${password}', 0)`;

    db.run(query, (err) => {
        if (err) {
            console.error(err);
            return res.render('layout', { page: 'register', error: "Error registering user: " + err.message });
        }
        res.redirect('/login');
    });
});

// --- VULNERABILITY ROUTES (Modularized) ---

// 1. Unprotected Routes (Must be before Auth Middleware)
app.use(require('./vulnerabilities/unprotected'));

// 2. Authentication Barrier Middleware
app.use((req, res, next) => {
    if (!currentSessionUser) {
        return res.redirect('/login');
    }
    next();
});

// 3. Protected Routes
app.use(require('./vulnerabilities/xss'));
app.use(require('./vulnerabilities/sql_injection'));
app.use(require('./vulnerabilities/rce'));
app.use(require('./vulnerabilities/file_access'));
// app.use(require('./vulnerabilities/misc')); // Splitted into below modules:
app.use(require('./vulnerabilities/redirect'));
app.use(require('./vulnerabilities/cookie_injection'));
app.use(require('./vulnerabilities/crlf'));
app.use(require('./vulnerabilities/csti'));
app.use(require('./vulnerabilities/trace'));
app.use(require('./vulnerabilities/idor'));
app.use(require('./vulnerabilities/pollution'));
app.use(require('./vulnerabilities/insecure_cookies'));
app.use(require('./vulnerabilities/cors'));

// Phase 2: New Vulnerabilities
app.use(require('./vulnerabilities/xpath'));
app.use(require('./vulnerabilities/ldap'));
app.use(require('./vulnerabilities/header_injection'));
app.use(require('./vulnerabilities/mass_assignment'));
app.use(require('./vulnerabilities/graphql'));
app.use(require('./vulnerabilities/disclosure'));

// --- SERVER START ---

// Start Server
app.get('/vulnerabilities/xss', (req, res) => {
    const input = req.query.input || '';
    // VULNERABLE: Reflects input directly without escaping
    res.send(`<h1>XSS Demo</h1><p>You said: ${input}</p>`);
});

// 2. Open Redirect
app.get('/vulnerabilities/redirect', (req, res) => {
    const url = req.query.url;
    // VULNERABLE: Redirects to arbitrary URL
    if (url) {
        res.redirect(url);
    } else {
        res.send('Missing url parameter');
    }
});

// 3. Cookie Injection / Reflection
app.get('/vulnerabilities/cookie-reflect', (req, res) => {
    const param = req.query.param;
    if (param) {
        // VULNERABLE: Reflects parameter into cookie value (Header Injection potential if not validated)
        res.cookie('vulnerable_cookie', param);
        res.send('Cookie set');
    } else {
        res.send('Missing param');
    }
});

// 4. CRLF Injection
app.get('/vulnerabilities/crlf', (req, res) => {
    const input = req.query.input;
    if (input) {
        // VULNERABLE: Injecting input into a custom header
        res.setHeader('X-Custom-Header', input);
        res.send('Header set');
    } else {
        res.send('Missing input');
    }
});

// 5. OS Command Injection
app.get('/vulnerabilities/ping', (req, res) => {
    const ip = req.query.ip;
    if (ip) {
        // VULNERABLE: Concatenating input directly into exec
        exec(`ping -c 1 ${ip}`, (error, stdout, stderr) => {
            if (error) {
                return res.send(`Error: ${error.message}`);
            }
            res.send(`<pre>${stdout}</pre>`);
        });
    } else {
        res.send('Missing ip parameter');
    }
});

// 6. Python Code Injection
app.get('/vulnerabilities/pymath', (req, res) => {
    const code = req.query.code;
    if (code) {
        // VULNERABLE: Executing arbitrary Python code
        exec(`python3 -c "print(${code})"`, (error, stdout, stderr) => {
            if (error) {
                return res.send(`Error: ${stderr || error.message}`);
            }
            res.send(`<pre>Result: ${stdout}</pre>`);
        });
    } else {
        res.send('Missing code parameter (e.g., 2+2)');
    }
});

// 7. Local File Inclusion (LFI)
app.get('/vulnerabilities/lfi', (req, res) => {
    const file = req.query.file;
    if (file) {
        // VULNERABLE: Reading arbitrary file path
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) return res.send("Error reading file: " + err.message);
            res.send(`<pre>${data}</pre>`);
        });
    } else {
        res.send('Missing file parameter');
    }
});

// 8. Server-Side Request Forgery (SSRF) / Remote File Inclusion (RFI) simulation
app.get('/vulnerabilities/ssrf', (req, res) => {
    const url = req.query.url;
    if (url) {
        // VULNERABLE: Fetching arbitrary URL (basic simulation using curl via exec for simplicity)
        exec(`curl ${url}`, (error, stdout, stderr) => {
            if (error) return res.send("Error fetching URL");
            res.send(`<pre>${stdout}</pre>`);
        });
    } else {
        res.send('Missing url parameter');
    }
});

// 9. Angular Client-Side Template Injection (CSTI)
app.get('/vulnerabilities/csti', (req, res) => {
    // Serves a page with Angular 1.x (user input in template)
    const name = req.query.name || 'World';
    res.send(`
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
    `);
});

// 10. ASP.NET Trace (Simulation)
app.get('/trace.axd', (req, res) => {
    res.type('text/plain');
    res.send(`
Application Trace

Requests:
1. GET /login (200 OK)
2. POST /login (302 Found)
...
    `);
});

// --- ROUND 2 VULNERABILITIES ---

// 11. IDOR (Insecure Direct Object Reference)
app.get('/vulnerabilities/idor/user', (req, res) => {
    const id = req.query.id;
    if (!id) return res.send("Missing id parameter");

    // VULNERABLE: No check if the requested ID matches the logged-in user
    db.get(`SELECT * FROM users WHERE id = ${id}`, (err, row) => {
        if (err) return res.send("Database error");
        if (!row) return res.send("User not found");
        res.send(`
            <h1>User Profile (IDOR Demo)</h1>
            <p><strong>ID:</strong> ${row.id}</p>
            <p><strong>Username:</strong> ${row.username}</p>
            <p><strong>Password:</strong> ${row.password} (Sensitive Data Exposed!)</p>
            <p><strong>Is Admin:</strong> ${row.isAdmin}</p>
        `);
    });
});

// 12. Stored XSS (Guestbook)
app.get('/vulnerabilities/stored-xss', (req, res) => {
    db.all("SELECT * FROM guestbook ORDER BY created_at DESC", (err, rows) => {
        if (err) return res.send("DB Error");
        let html = `<h1>Guestbook (Stored XSS)</h1>
        <form method="POST" action="/vulnerabilities/stored-xss">
            <textarea name="message" placeholder="Leave a message..." rows="3" style="width: 300px;"></textarea><br>
            <button type="submit">Sign Guestbook</button>
        </form>
        <hr>
        <h3>Messages:</h3>`;

        rows.forEach(row => {
            // VULNERABLE: Outputting stored content directly without escaping
            html += `<div style="border:1px solid #ccc; padding:10px; margin:5px;">
                <small>${row.created_at}</small><br>
                ${row.message} 
            </div>`;
        });
        res.send(html);
    });
});

app.post('/vulnerabilities/stored-xss', (req, res) => {
    const message = req.body.message;
    // VULNERABLE: Storing input directly without sanitization
    db.run(`INSERT INTO guestbook(message) VALUES(?)`, [message], (err) => {
        if (err) return res.send("Error saving message");
        res.redirect('/vulnerabilities/stored-xss');
    });
});

// 13. Insecure Deserialization (Simulation)
app.get('/vulnerabilities/deserialize', (req, res) => {
    res.send(`
        <h1>Insecure Deserialization</h1>
        <p>Enter a JS payload to "deserialize" (execute):</p>
        <form method="POST" action="/vulnerabilities/deserialize">
            <textarea name="payload" rows="3" style="width: 100%;">console.log("Deserialized!")</textarea><br>
            <button type="submit">Deserialize</button>
        </form>
    `);
});

app.post('/vulnerabilities/deserialize', (req, res) => {
    const payload = req.body.payload;
    try {
        // VULNERABLE: Using eval() to simulate insecure deserialization of code/objects
        // In real world, this might be node-serialize's unserialize()
        const result = eval(payload);
        res.send(`Object deserialized. Result: ${result}`);
    } catch (e) {
        res.send(`Deserialization error: ${e.message}`);
    }
});

// 14. Prototype Pollution
app.get('/vulnerabilities/pollution', (req, res) => {
    res.send(`
        <h1>Prototype Pollution</h1>
        <p>Send a JSON payload to merge into the server configuration.</p>
        <p>Current Admin Status check: ${global.isAdmin ? "TRUE" : "FALSE"}</p>
        <form method="POST" action="/vulnerabilities/pollution" enctype="application/json">
            <textarea name="json" rows="5" style="width: 300px;">{"__proto__": {"isAdmin": true}}</textarea><br>
            <button type="submit" onclick="event.preventDefault(); fetch('/vulnerabilities/pollution', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: document.querySelector('textarea').value}).then(r => r.text()).then(t => document.body.innerHTML += t)">Pollute</button>
        </form>
    `);
});

app.use(bodyParser.json()); // Ensure JSON body parsing is enabled for this route

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

app.post('/vulnerabilities/pollution', (req, res) => {
    let payload = req.body;
    let config = {};

    // VULNERABLE: Recursive merge without key validation
    merge(config, payload);

    res.send(`<br>Config merged. Check if global Object prototype is polluted. <br> admin check: ${config.isAdmin || ({}).isAdmin}`);
});


// --- SERVER START ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
