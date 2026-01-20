# 🔐 Security Lab - Complete A-Z Guide

## Table of Contents

1. [Overview](#overview)
2. [Project Architecture](#project-architecture)
3. [Folder Structure](#folder-structure)
4. [Features A-Z](#features-a-z)
5. [Hashing Algorithms](#hashing-algorithms)
6. [How Each Feature Works](#how-each-feature-works)
7. [API Reference](#api-reference)
8. [Security Concepts](#security-concepts)
9. [Code Walkthrough](#code-walkthrough)
10. [Troubleshooting](#troubleshooting)

---

## Overview

**Authentication Security Lab** is an educational platform that demonstrates:

- ✅ Password hashing evolution (MD5 → SHA-1 → BCrypt → Argon2id)
- ✅ Real-time breach time calculations
- ✅ HaveIBeenPwned API integration
- ✅ Automatic legacy hash migration
- ✅ Dictionary attack simulation
- ✅ Timing attack demonstration
- ✅ Export hashes for security testing (Hashcat)

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, Bootstrap 5.3, JavaScript ES6+ |
| Backend | Python 3.10+, Flask, SQLAlchemy |
| Database | SQLite (local), localStorage (fallback) |
| Hashing | CryptoJS, bcryptjs, argon2-browser (frontend), argon2-cffi (backend) |

---

## Project Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐   │
│  │  index.html │   │ features/*  │   │  shared/js/*.js     │   │
│  │  (Login)    │   │ (All Pages) │   │  (Core Logic)       │   │
│  └──────┬──────┘   └──────┬──────┘   └──────────┬──────────┘   │
│         │                 │                      │               │
│         └─────────────────┼──────────────────────┘               │
│                           │                                      │
│                    ┌──────▼──────┐                               │
│                    │ api-client.js│                              │
│                    │ (API Bridge) │                              │
│                    └──────┬──────┘                               │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │ HTTP Requests
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                     FLASK BACKEND (Server)                        │
├───────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐     │
│  │   app.py    │   │  models.py  │   │  SQLite Database    │     │
│  │ (Routes)    │◄──┤ (ORM Models)│◄──┤  (auth_security.db) │     │
│  └─────────────┘   └─────────────┘   └─────────────────────┘     │
│                                                                   │
│  Endpoints: /api/register, /api/login, /api/users, /api/health   │
└───────────────────────────────────────────────────────────────────┘
```

### Hybrid Mode

The app works in **two modes**:

1. **Backend Connected** 🟢 - Uses Flask API + SQLite database
2. **LocalStorage Fallback** 🟡 - Uses browser localStorage when backend unavailable

---

## Folder Structure

```
📁 Computer-Security/
├── 📄 index.html                     # Login page (entry point)
├── 📄 README.md                      # Quick reference
├── 📄 COMPLETE_GUIDE.md              # This file
├── 📄 FOLDER_STRUCTURE.md            # Folder guide
├── 📄 START_APP.bat                  # Quick start script
│
├── 📁 features/                      # User-facing feature pages
│   ├── 📄 index.html                 # Visual feature overview
│   ├── 📄 all-features.html          # Feature grid
│   ├── 📁 auth/
│   │   └── 📄 register.html          # User registration with algorithm selection
│   ├── 📁 dashboard/
│   │   └── 📄 dashboard.html         # User management, export, stats
│   ├── 📁 security-testing/
│   │   └── 📄 security-testing.html  # Dictionary attack, timing attack demo
│   ├── 📁 hash-tools/
│   │   └── 📄 hash-tools.html        # Hash calculator, comparison
│   ├── 📁 breach-analysis/
│   │   └── 📄 breach.html            # Password strength, crack time
│   └── 📁 guides/
│       └── 📄 security-guide.html    # Educational content
│
├── 📁 shared/                        # Shared assets
│   ├── 📁 css/
│   │   ├── 📄 style.css              # Main application styles (1500+ lines)
│   │   └── 📄 nav-styles.css         # Sidebar navigation styles
│   └── 📁 js/
│       ├── 📄 script.js              # Core application logic (1250+ lines)
│       └── 📄 api-client.js          # Backend API communication
│
├── 📁 backend/                       # Flask server
│   ├── 📄 app.py                     # Main Flask application (800+ lines)
│   ├── 📄 models.py                  # SQLAlchemy database models
│   ├── 📄 requirements.txt           # Python dependencies
│   └── 📁 instance/
│       └── 📄 auth_security_lab.db   # SQLite database
│
└── 📁 tools/                         # Utilities
    ├── 📄 index.html                 # Tools overview
    ├── 📁 diagnostics/               # Health check pages
    └── 📁 scripts/
        ├── 📄 attack_toolkit.py      # Hash export, wordlist generation
        ├── 📄 setup.py               # Initial project setup
        └── 📄 view_database.py       # View SQLite contents
```

---

## Features A-Z

### A - Algorithm Selection
**Location:** `features/auth/register.html`
**Code:** `shared/js/script.js` → `generateHash()`

Users can choose from 4 hashing algorithms:
- **MD5** - Insecure, for demonstration only
- **SHA-1** - Deprecated, weak
- **BCrypt** - Secure, configurable cost factor (rounds)
- **Argon2id** - Most secure, memory-hard

### B - Breach Time Calculator
**Location:** `features/breach-analysis/breach.html`
**Code:** `shared/js/script.js` → `calculateBreachTime()`

Calculates how long a password would take to crack based on:
- Password length and character set
- Algorithm speed (MD5: 200B/s, Argon2: 1K/s on RTX 4090)
- Displays crack time for all 4 algorithms simultaneously

### C - Cost Factor Configuration
**Location:** `features/auth/register.html`
**Code:** `shared/js/script.js` → `currentConfig` object

Adjustable security parameters:
- **BCrypt Rounds:** 4-16 (default: 10)
- **Argon2 Memory:** 16-256 MB (default: 64MB)
- **Argon2 Time Cost:** 1-10 iterations (default: 2)

### D - Dashboard
**Location:** `features/dashboard/dashboard.html`
**Code:** `shared/js/script.js` → `renderUserTable()`, `loadDashboard()`

Displays all registered users with:
- Username
- Algorithm used
- Security badge (Vulnerable/Weak/Secure)
- Hash value (truncated with copy button)
- Upgrade status (if migrated from MD5)

### E - Export for Hashcat
**Location:** `features/dashboard/dashboard.html`
**Code:** `shared/js/script.js` → `exportDatabaseForHashcat()`

Exports all hashes in Hashcat-compatible format:
```
# Format: username:hash
# Hashcat Commands:
# MD5:    hashcat -m 0 hashes.txt wordlist.txt
# BCrypt: hashcat -m 3200 hashes.txt wordlist.txt
```

### F - Fallback Mode
**Location:** `shared/js/api-client.js`
**Code:** `checkBackendHealth()`, `isBackendAvailable()`

Automatic fallback to localStorage when backend is unavailable:
- Shows 🟢 "Backend Connected" or 🟡 "Using LocalStorage"
- All features work in both modes

### G - generateHash()
**Location:** `shared/js/script.js` (line 120-220)

Core hashing function:
```javascript
async function generateHash(password, algorithm, salt = null) {
    switch(algorithm) {
        case 'md5':
            hash = CryptoJS.MD5(password).toString();
            break;
        case 'bcrypt':
            hash = bcrypt.hashSync(password, rounds);
            break;
        case 'argon2':
            result = await argon2.hash({
                pass: password,
                salt: saltBytes,
                type: argon2.ArgonType.Argon2id,
                mem: 65536, // 64MB
                time: 2
            });
            break;
    }
    return { hash, salt, time };
}
```

### H - HaveIBeenPwned Integration
**Location:** `features/auth/register.html`
**Code:** `shared/js/script.js` → `checkPasswordPwned()`

Uses K-Anonymity to safely check if password appears in breaches:
1. SHA-1 hash the password
2. Send first 5 characters to API
3. Check if suffix exists in response
4. Display breach count if found

### I - Initialization
**Location:** `shared/js/script.js` → `init()`

On page load:
1. Initialize localStorage database
2. Render user table (if on dashboard)
3. Check backend availability
4. Display connection status

### J - JavaScript Libraries Used

| Library | Version | Purpose |
|---------|---------|---------|
| CryptoJS | 4.1.1 | MD5, SHA-1, SHA-256, PBKDF2 |
| bcryptjs | 2.4.3 | BCrypt hashing |
| argon2-browser | 1.18.0 | Argon2id hashing |
| Bootstrap | 5.3.0 | UI framework |
| Font Awesome | 6.4.0 | Icons |

### K - Key Functions Map

| Function | File | Purpose |
|----------|------|---------|
| `generateHash()` | script.js | Create password hash |
| `verifyHash()` | script.js | Verify password |
| `checkPasswordPwned()` | script.js | Check HIBP API |
| `calculateBreachTime()` | script.js | Crack time estimation |
| `attemptLegacyMigration()` | script.js | MD5 → Argon2 upgrade |
| `renderUserTable()` | script.js | Display user dashboard |
| `exportDatabaseForHashcat()` | script.js | Export hashes |
| `registerUserAPI()` | api-client.js | Register via backend |
| `loginUserAPI()` | api-client.js | Login via backend |

### L - Legacy Migration
**Location:** Login form handling
**Code:** `shared/js/script.js` → `attemptLegacyMigration()`

Automatic upgrade process:
1. User with MD5 hash logs in
2. Verify old MD5 hash
3. Re-hash password with Argon2id
4. Update database record
5. Show upgrade notification toast

### M - Models (Database)
**Location:** `backend/models.py`

```python
class User(db.Model):
    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    password_hash = Column(String(500), nullable=False)
    algorithm = Column(String(20), nullable=False)  # md5, argon2, pbkdf2
    salt = Column(String(64))
    created_at = Column(DateTime, default=datetime.utcnow)
    upgraded = Column(Boolean, default=False)
    last_login = Column(DateTime)

class LoginAttempt(db.Model):
    # Rate limiting - tracks failed login attempts
    
class PasswordHistory(db.Model):
    # Prevents password reuse
```

### N - Navigation System
**Location:** All HTML pages, `shared/css/nav-styles.css`

Persistent sidebar navigation with:
- Logo and branding
- Quick access links (Login, Register)
- Feature links with badges
- Action buttons (Export, Clear Data)
- Mobile-responsive toggle

### O - Output Formats

**Hash Export:**
```
# username:hash
admin:5f4dcc3b5aa765d61d8327deb882cf99
user1:$argon2id$v=19$m=65536,t=2,p=1$...
```

**API Response:**
```json
{
    "success": true,
    "message": "User registered with ARGON2",
    "user": {
        "id": 1,
        "username": "testuser",
        "algorithm": "argon2",
        "processing_time_ms": 342.5
    }
}
```

### P - Password Strength Analysis
**Location:** `features/breach-analysis/breach.html`
**Code:** `shared/js/script.js` → `analyzePasswordStrength()`

Analyzes password characteristics:
- **Length:** Number of characters
- **Charset:** Lowercase, uppercase, digits, symbols
- **Entropy:** Bits of randomness
- **Total Combinations:** Possible permutations

### Q - Quick Start Commands

```powershell
# Start backend server
cd backend
..\.venv\Scripts\python.exe app.py

# Or use the batch file
START_APP.bat

# Frontend (just open in browser)
start index.html

# Or serve via Python
python -m http.server 8000
```

### R - Rate Limiting
**Location:** `backend/app.py` → `check_rate_limit()`

Protection against brute force:
- **Max Attempts:** 5 failed logins
- **Lockout Duration:** 15 minutes
- **IP Tracking:** Logs IP address of attempts
- **Reset on Success:** Clears failed attempts on successful login

### S - Security Testing Lab
**Location:** `features/security-testing/security-testing.html`

Three interactive demos:

1. **Dictionary Attack Simulator**
   - Enter target password
   - Select hash algorithm
   - Watch wordlist comparison in real-time
   - See attempts, speed, and results

2. **Timing Attack Demo**
   - Set secret password
   - Enter guesses
   - See response time differences
   - Learn about constant-time comparison

3. **Custom Wordlist Upload**
   - Upload .txt wordlist file
   - Preview loaded words
   - Use for dictionary attack testing

### T - Transparent Migration
**Location:** `backend/app.py` → Login endpoint

When MD5 user logs in with `SECURITY_STAGE = 'modern'`:
```python
if is_valid and SECURITY_STAGE == 'modern':
    new_hash = generate_argon2_hash(password)
    user.password_hash = new_hash
    user.algorithm = 'argon2'
    user.upgraded = True
    db.session.commit()
```

### U - UI Components

**Loading Spinner:**
```html
<div class="spinner-overlay" id="loadingSpinner">
    <div class="spinner-content">
        <div class="spinner-border"></div>
        <p id="spinnerText">Computing secure hash...</p>
    </div>
</div>
```

**Security Badges:**
- 🔴 `badge-vulnerable` - MD5
- 🟠 `badge-weak` - SHA-1
- 🟢 `badge-secure` - BCrypt, Argon2

**Toast Notifications:**
- Migration success
- Error messages
- Copy confirmations

### V - Verify Hash
**Location:** `shared/js/script.js` → `verifyHash()`

Password verification per algorithm:
```javascript
async function verifyHash(password, algorithm, storedHash, salt) {
    switch(algorithm) {
        case 'md5':
            return CryptoJS.MD5(password).toString() === storedHash;
        case 'bcrypt':
            return bcrypt.compareSync(password, storedHash);
        case 'argon2':
            return await argon2.verify({pass: password, encoded: storedHash});
    }
}
```

### W - Wordlist Generation
**Location:** `tools/scripts/attack_toolkit.py`

```python
def generate_sample_wordlist():
    common_passwords = [
        "password", "123456", "password123", "admin", "letmein",
        "welcome", "monkey", "dragon", "master", "sunshine"
    ]
    with open('wordlist.txt', 'w') as f:
        f.write('\n'.join(common_passwords))
```

### X - Export Functions

**Frontend Export:**
- `exportDatabaseForHashcat()` - Downloads hashes.txt

**Backend Export:**
- `GET /api/export/hashcat` - Returns hash file
- `attack_toolkit.py` - CLI export tool

### Y - Your Data Storage

**localStorage Keys:**
- `authSecurityLab_users` - Array of user objects

**SQLite Tables:**
- `users` - Main user table
- `login_attempts` - Rate limiting
- `password_history` - Reuse prevention

### Z - Zero-Knowledge (K-Anonymity)

The HIBP API uses K-Anonymity:
1. Client hashes password with SHA-1
2. Only first 5 chars sent to API (prefix)
3. API returns all hashes starting with prefix
4. Client checks locally if full hash exists
5. **Password never leaves the browser!**

---

## API Reference

### POST /api/register
```json
Request: {"username": "test", "password": "pass123", "algorithm": "argon2"}
Response: {"success": true, "user": {"id": 1, "algorithm": "argon2"}}
```

### POST /api/login
```json
Request: {"username": "test", "password": "pass123"}
Response: {"success": true, "migrated": false, "user": {...}}
```

### GET /api/users
```json
Response: {"users": [{"username": "test", "algorithm": "argon2", ...}]}
```

### GET /api/health
```json
Response: {"status": "healthy", "database": "connected", "security_stage": "modern"}
```

### GET /api/benchmark
```json
Response: {"md5_ms": 0.001, "argon2_ms": 342.5, "slowdown_factor": 342500}
```

---

## Security Concepts

### Why MD5 is Broken
- No salt (rainbow tables work)
- 200 billion hashes/second on GPU
- 8-character password: ~30 seconds to crack

### Why Argon2 is Secure
- Memory-hard (64MB+ per hash)
- Configurable time cost
- Built-in salt
- Only ~1,000 hashes/second even on powerful GPUs

### Salt vs No Salt
```
No Salt (MD5):
  "password" → 5f4dcc3b5aa765d61d8327deb882cf99 (always same)
  Rainbow table attack: instant lookup

With Salt (Argon2):
  "password" + random_salt → unique hash every time
  Must crack each hash individually
```

### Pepper (Server-Side Secret)
```python
HASH_PEPPER = "secret-server-key"
peppered_password = password + HASH_PEPPER
hash = argon2.hash(peppered_password)
```
Even if database is stolen, attacker needs pepper to crack hashes.

---

## Troubleshooting

### Backend won't start
```powershell
cd backend
..\.venv\Scripts\pip install flask flask-cors flask-sqlalchemy argon2-cffi
..\.venv\Scripts\python app.py
```

### "Argon2 library not loaded"
Refresh the page. The argon2-browser library loads asynchronously.

### LocalStorage not persisting
- Check browser privacy settings
- Try incognito mode
- Clear localStorage: `localStorage.clear()`

### API connection refused
- Ensure backend is running on port 5000
- Check CORS settings in `app.py`
- Verify firewall allows localhost connections

---

## Quick Reference Card

| Action | Location | Function |
|--------|----------|----------|
| Register User | features/auth/register.html | Form submit → `generateHash()` |
| Login | index.html | Form submit → `verifyHash()` |
| View Users | features/dashboard/dashboard.html | `renderUserTable()` |
| Check Breach | features/auth/register.html | `checkPasswordPwned()` |
| Crack Time | features/breach-analysis/breach.html | `calculateBreachTime()` |
| Export Hashes | Dashboard or script.js | `exportDatabaseForHashcat()` |
| Dictionary Attack | features/security-testing/ | `startCracking()` |
| Timing Attack | features/security-testing/ | `testTiming()` |

---

**Last Updated:** January 2026
**Version:** 2.0 (Organized Edition)
