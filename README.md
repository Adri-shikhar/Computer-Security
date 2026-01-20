# 🔒 Advanced Authentication Security Lab

A comprehensive full-stack cybersecurity education platform demonstrating the critical differences between weak and strong password hashing algorithms using real-world examples.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.12-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Argon2](https://img.shields.io/badge/Security-Argon2-red.svg)

---

## 🎯 Overview

This **full-stack web application** serves as an interactive security research platform featuring:

- 🔐 **Frontend**: Multi-page HTML/CSS/JavaScript interface with persistent navigation
- ⚙️ **Backend**: Python Flask API with SQLite database
- 🔄 **Transparent Migration**: Automatic upgrade from MD5 → Argon2id
- 🛡️ **Rate Limiting**: Protection against brute force attacks
- 📊 **Security Dashboard**: Real-time user management and statistics
- ⏱️ **Breach Time Calculator**: GPU-based password cracking estimates
- 🔬 **Educational**: Compare MD5, SHA-1, BCrypt, and Argon2id algorithms

**Hybrid Architecture:** Works with or without backend - frontend falls back to localStorage when backend is unavailable.

**GitHub Pages Ready:** Optimized structure for static deployment with `index.html` at root.

---

## 📁 Project Structure

```
Computer-Security/
├── index.html              # Main entry point (GitHub Pages compatible)
├── pages/                  # Application pages
│   ├── register.html       # User registration
│   ├── dashboard.html      # User dashboard
│   ├── breach.html         # Password breach calculator
│   ├── hash-tools.html     # Hash generation tools
│   ├── security-testing.html # Security test suite
│   ├── security-guide.html # Security best practices
│   └── all-features.html   # Features overview
├── assets/
│   ├── css/
│   │   ├── style.css       # Main styles (38KB glassmorphism design)
│   │   └── nav-styles.css  # Persistent sidebar navigation
│   └── js/
│       ├── script.js       # Core functionality (11 async functions)
│       └── api-client.js   # Backend API integration
├── backend/                # Flask backend
│   ├── app.py             # Main Flask application
│   ├── models.py          # Database models
│   └── requirements.txt   # Python dependencies
├── docs/                  # Documentation
└── scripts/               # Utility scripts
```

---

## ✨ Features

### 🌐 Multi-Page Architecture
**NEW:** The application has been restructured into **separate HTML pages** for better organization:

1. **`index.html`** - Login page (main entry point)
2. **`register.html`** - User registration with algorithm selection
3. **`breach.html`** - Password breach time estimator
4. **`dashboard.html`** - Admin dashboard with user management

Each page features:
- ✅ Independent functionality
- ✅ Shared navigation menu
- ✅ Persistent localStorage database
- ✅ Consistent dark cybersecurity theme
- ✅ Active page highlighting

---

## 🚀 Quick Start

### Installation

**Download and Run:**
```bash
1. Download all files:
   - index.html         (Login page)
   - register.html      (Registration page)
   - breach.html        (Breach time estimator)
   - dashboard.html     (Admin dashboard)
   - style.css          (Unified stylesheet)
   - script.js          (Application logic)

2. Keep all files in the same folder

3. Option A - Direct Open:
   Double-click index.html to open in browser

4. Option B - Local Server (Recommended):
   python -m http.server 8000
   Then visit: http://localhost:8000/index.html
```

### Requirements
- ✅ Modern web browser (Chrome, Firefox, Edge, Safari)
- ✅ JavaScript enabled
- ✅ localStorage enabled (for database)
- ✅ Internet connection (for CDN libraries only)
- ❌ **No backend server required**
- ❌ **No database installation needed**
- ❌ **No npm/node setup required**

### First Steps

1. **Open `index.html`** - Login page appears
2. **Click "Register"** - Navigate to registration page
3. **Create test users** with different algorithms
4. **Test "Breach Time"** - See password strength analysis
5. **Login with MD5 user** - Watch automatic upgrade!
6. **View Dashboard** - See all users and security status

---

## 📁 File Structure

```
Computer Security/
│
├── index.html              # Login Page (Main Entry)
├── register.html           # Registration Page
├── breach.html             # Breach Time Estimator
├── dashboard.html          # Admin Dashboard
├── style.css               # Unified Stylesheet
├── script.js               # Application Logic
└── README.md               # This Documentation
```

---

## 🔧 Technical Details

### Core Technologies

- **HTML5** - Semantic markup
- **CSS3** - Glassmorphism, animations
- **JavaScript ES6+** - Async/await, modules
- **Bootstrap 5.3.0** - Responsive framework

### Cryptography Libraries (CDN)

- **CryptoJS 4.1.1** - MD5 & SHA-1 hashing
- **BCryptJS 2.4.3** - BCrypt with configurable rounds
- **Argon2-browser 1.18.0** - WASM-based Argon2id

### Database

- **Type:** localStorage (browser API)
- **Key:** `authSecurityLab_users`
- **Format:** JSON array

---

## 📊 Algorithm Comparison

| Algorithm | Speed | Security | Cost Factor | Use Case |
|-----------|-------|----------|-------------|----------|
| **MD5** | 🔴 1-5ms | ❌ Broken | None | Demo only |
| **SHA-1** | 🔴 2-8ms | ❌ Deprecated | None | Historical |
| **BCrypt** | 🟡 50-200ms | ✅ Secure | 2^4 to 2^14 | Production |
| **Argon2id** | 🟢 200-1000ms | ✅ Best | 8-128MB | Recommended |

---

## 🎓 Educational Use Cases

### For Students
- Learn why MD5/SHA-1 are broken
- Understand salting importance
- See real breach time calculations
- Practice password strength analysis

### For Instructors
- Demonstrate cryptographic concepts
- Show legacy migration strategies
- Explain rainbow table attacks
- Teach cost factor tuning

### For Researchers
- Test password policies
- Benchmark algorithms
- Analyze breach scenarios
- Export for Hashcat testing

---

## 🛠️ Usage Examples

### Complete Workflow

```
1. Open index.html → Login page loads
2. Click "Register" → Navigate to registration page
3. Create MD5 user:
   - Username: "test"
   - Password: "oldpass"
   - Algorithm: MD5
   - Click "Register User"
   
4. Create Argon2 user:
   - Username: "secure"
   - Password: "MyP@ss123!"
   - Algorithm: Argon2id
   - Click "Register User"
   
5. Click "Breach Time" → Test passwords:
   - Enter "oldpass" → See ~1 second crack time
   - Enter "MyP@ss123!" → See 1000+ years
   
6. Click "Login" → Login as "test/oldpass"
   - Watch automatic MD5 → Argon2 upgrade!
   - Success message shows upgrade occurred
   
7. Click "Dashboard" → View all users:
   - See both users in table
   - Notice "UPGRADED" badge on test user
   - View hash types and timestamps
   
8. Click "Export Data" → Download for Hashcat testing
   - Get JSON file with all hashes
   - Use for security research
```

---

## 🔐 Security Notes

### ⚠️ Important Warnings
- **Educational Purpose Only** - Not intended for production systems
- **Client-side Storage** - localStorage is NOT encrypted
- **No Server Security** - All authentication happens in browser
- **Demo Environment** - Suitable for learning and testing only
- **Real Applications** - Use proper backend authentication systems

### ✅ Privacy Features
- **100% Local** - No data sent to external servers (except HaveIBeenPwned)
- **K-Anonymity** - HaveIBeenPwned only receives first 5 hash characters
- **No Tracking** - Zero analytics or user tracking
- **No Cookies** - Only uses localStorage for data persistence
- **Open Source** - All code visible and auditable

### 🎓 What This Teaches
- Difference between weak (MD5/SHA-1) and strong (BCrypt/Argon2) hashing
- Why salting is critical for password security
- How cost factors affect security vs performance
- Real-world breach time calculations
- Safe password migration strategies

---

## 🐛 Troubleshooting

### Common Issues

**Issue: "Cannot read property 'addEventListener' of null"**
```
✅ FIXED: All event listeners now check if elements exist
This was resolved in the multi-page architecture update.
```

**Issue: Login/Registration not working**
```
✅ FIXED: Forms now properly attach event listeners
✅ FIXED: Multi-page mode prevents cross-page errors
```

**Issue: Dashboard not showing users**
```
✅ FIXED: loadDashboard() function now properly renders users
1. Navigate to dashboard.html
2. Users will automatically load from localStorage
```

**Issue: Cannot register user / localStorage errors**
```javascript
// Open browser console (F12) and run:
localStorage.clear();
location.reload();
```

**Issue: Argon2 not working**
```
Solution:
- Use Chrome/Firefox/Edge (WebAssembly required)
- Enable JavaScript
- Check internet connection for CDN libraries
```

**Issue: Navigation doesn't work**
```
Solution:
- Ensure ALL files are in the same folder
- Check file names match exactly (case-sensitive)
- Use a local server for best results:
  python -m http.server 8000
```

**Issue: HaveIBeenPwned API errors**
```
Solution:
- Check internet connection
- API may have rate limits (wait 60 seconds)
- CORS errors? Use local server instead of file://
```

---

## 📚 Resources

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Argon2 RFC 9106](https://www.rfc-editor.org/rfc/rfc9106.html)
- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)
- [Hashcat](https://hashcat.net/hashcat/)

---

## 📝 License

MIT License - Free for educational use

---

## 🎯 Version Information

**Version:** 3.1 (Fixed Multi-Page Architecture)  
**Last Updated:** January 19, 2026  
**Status:** Stable & Production Ready

### Changelog

**v3.1 (January 19, 2026)**
- 🐛 Fixed login form event listener errors
- 🐛 Fixed registration form not working
- 🐛 Fixed dashboard not displaying users
- 🐛 Added loadDashboard() function
- 🐛 Fixed all event listeners with existence checks
- 🔧 Enhanced multi-page architecture stability
- ✅ All features now fully functional

**v3.0 (January 2026)**
- ✨ Multi-page architecture
- ✨ Separate HTML files for each feature
- ✨ Improved navigation system
- ✨ Better code organization
- ✨ Enhanced user experience

---

## 💡 Key Takeaways

1. 🔴 **MD5/SHA-1** - Never use for passwords
2. 🟢 **BCrypt** - Secure and proven (≥10 rounds)
3. 🟢 **Argon2id** - Best choice for new systems
4. 🧂 **Salting** - Essential for security
5. ⏱️ **Cost Factors** - Slow = Secure
6. 🔄 **Migration** - Upgrade without disruption

---

**🔒 "Security is not a product, but a process." - Bruce Schneier**

---

*Remember: Never reuse passwords, use a password manager, and enable 2FA!*
