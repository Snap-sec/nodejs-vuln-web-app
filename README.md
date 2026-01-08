# Vulnerability Playground

A comprehensive web application intentionally designed with security vulnerabilities for testing and measuring the quality of security scanners.

## 🎯 Purpose

This application serves as a **benchmark platform** to evaluate and measure the detection capabilities of our internal security scanner. It contains a wide range of real-world vulnerabilities across multiple categories, providing a controlled environment for scanner validation and quality assurance.

## 👥 Credits

**Built by:**
- **Imran Partay**
- **Shoaib Wani**

## ⚠️ Disclaimer

**WARNING:** This application is intentionally vulnerable and should **NEVER** be deployed in a production environment or exposed to the public internet. It is designed exclusively for security testing and educational purposes in isolated, controlled environments.

## 🐛 Vulnerability Catalog

This application includes **40+ vulnerabilities** across the following categories:

### Injection Vulnerabilities
- SQL Injection (Login, Search)
- XSS (Reflected, Stored)
- OS Command Injection
- Python Code Injection
- XPath Injection
- LDAP Injection
- CRLF Injection
- HTTP Header Injection
- Cookie Injection

### Authentication & Authorization
- Insecure Direct Object Reference (IDOR)
- Mass Assignment
- Default Credentials (`admin:admin`)
- Broken Authentication (Global Session State)

### Data Exposure
- Unprotected API Endpoints
- Internal IP Disclosure
- Software Version Disclosure
- Environment Variable Exposure
- Backup Files Exposed (`.bak`)
- `.git` Folder Exposure
- `.env` File Exposure
- Directory Listing Enabled
- Swagger/OpenAPI Publicly Accessible

### Security Misconfigurations
- Missing Security Headers (CSP, HSTS, X-Frame-Options, Referrer-Policy)
- Clickjacking (Missing X-Frame-Options)
- Insecure Cookies (Missing HttpOnly, Secure, SameSite)
- Debug Mode Enabled
- Stack Traces Exposed
- Verbose Error Messages
- Hardcoded Secrets

### CORS Vulnerabilities
- Wildcard Origin with Credentials
- Trusted Subdomain Bypass
- Arbitrary Origin Reflection
- Origin Regex Bypass
- Null Origin Trust

### Advanced Vulnerabilities
- Server-Side Request Forgery (SSRF)
- Local File Inclusion (LFI)
- Remote File Inclusion (RFI)
- Prototype Pollution
- Insecure Deserialization
- GraphQL Introspection Enabled
- Angular Client-Side Template Injection (CSTI)

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vulnWebApp

# Install dependencies
npm install

# Start the application
node app.js
```

The application will be available at `http://localhost:3000`

### Default Credentials
- **Username:** `admin`
- **Password:** `admin`

## 📁 Project Structure

```
vulnWebApp/
├── app.js                      # Main application entry point
├── database.js                 # SQLite database setup
├── vulnerabilities/            # Modularized vulnerability endpoints
│   ├── xss.js
│   ├── sql_injection.js
│   ├── rce.js
│   ├── file_access.js
│   ├── cors.js
│   ├── xpath.js
│   ├── ldap.js
│   ├── mass_assignment.js
│   ├── graphql.js
│   ├── disclosure.js
│   └── ...
├── views/                      # EJS templates
│   ├── layout.ejs
│   ├── dashboard.ejs
│   └── login.ejs
├── public/                     # Static assets
└── playwriteLoginCRMSnap.js   # Playwright authentication script
```

## 🔧 Automated Testing

The project includes a Playwright authentication script (`playwriteLoginCRMSnap.js`) for automated scanner integration:

```javascript
const { authenticate } = require('./playwriteLoginCRMSnap.js');

// Use with your scanner
await authenticate({ 
    page, 
    target_url: 'http://localhost:3000', 
    scope 
});
```

## 🎓 Educational Use

This application can be used for:
- Security scanner validation and benchmarking
- Security training and awareness
- Penetration testing practice
- Understanding common web vulnerabilities
- Developing security testing tools

## 📊 Dashboard

The application features an interactive dashboard with cards for each vulnerability category, making it easy to navigate and test specific vulnerability types.

## 🔒 Security Notes

- All vulnerabilities are intentional and documented
- The application uses SQLite for simplicity
- Session management is intentionally insecure (global state)
- No actual sensitive data is stored

## 📝 License

This project is intended for educational and testing purposes only.

## 🤝 Contributing

This is an internal testing tool. For questions or improvements, please contact the development team.

---

**Remember:** This application is a security testing tool. Handle with care and never expose it to untrusted networks.
