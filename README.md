# 🔐 Authentication Security Lab

A hands-on educational platform demonstrating password security evolution from weak (MD5) to strong (Argon2id) hashing.

> 📖 **For complete A-Z documentation, see [COMPLETE_GUIDE.md](COMPLETE_GUIDE.md)**

## Quick Start

```powershell
# 1. Start backend (Flask API)
cd backend
..\.venv\Scripts\python.exe app.py

# 2. Open in browser
# http://localhost:5000 (API)
# Or open index.html directly for frontend
```

---

## 📁 Project Structure

```
📂 Computer-Security/
├── index.html                    ← Login page (START HERE)
├── README.md                     ← This file
├── FOLDER_STRUCTURE.md           ← Detailed folder guide
│
├── 📂 features/                  ← All user-facing features
│   ├── index.html                ← Visual feature overview
│   ├── all-features.html         ← Quick access grid
│   ├── auth/register.html        ← User registration
│   ├── dashboard/dashboard.html  ← User management
│   ├── security-testing/         ← Dictionary attack, timing attack
│   ├── hash-tools/               ← Hash calculator
│   ├── breach-analysis/          ← Password strength analyzer
│   └── guides/                   ← Security documentation
│
├── 📂 shared/                    ← Shared assets
│   ├── css/style.css             ← Main styles
│   ├── css/nav-styles.css        ← Sidebar styles
│   ├── js/script.js              ← Core logic (~1200 lines)
│   └── js/api-client.js          ← Backend API client
│
├── 📂 tools/                     ← Development utilities
│   ├── diagnostics/              ← System health checks
│   └── scripts/                  ← Python helper scripts
│
└── 📂 backend/                   ← Flask API
    ├── app.py                    ← Main application (~800 lines)
    ├── models.py                 ← Database models
    └── instance/                 ← SQLite database
```

---

## 🔑 Algorithms Implemented

### Frontend (JavaScript)

| Algorithm | Library | Security | Speed |
|-----------|---------|----------|-------|
| **MD5** | CryptoJS | ❌ Broken | ~0.001ms |
| **SHA-1** | CryptoJS | ❌ Weak | ~0.001ms |
| **BCrypt** | bcryptjs | ✅ Good | ~100ms |
| **PBKDF2** | CryptoJS | ✅ Good | ~200ms |
| **Argon2id** | argon2-browser | ✅ Best | ~300ms |

### Backend (Python)

| Algorithm | Library | Security | Notes |
|-----------|---------|----------|-------|
| **MD5** | hashlib | ❌ Broken | Educational only |
| **PBKDF2-SHA256** | hashlib | ✅ NIST Approved | 600,000 iterations |
| **Argon2id** | argon2-cffi | ✅ Industry Standard | Memory-hard (64MB) |

---

## 🔒 Security Features

### Hash Generation
```javascript
// MD5 - NO SALT (broken)
hash = CryptoJS.MD5(password).toString();

// BCrypt - Built-in salt
hash = bcrypt.hashSync(password, 10);

// Argon2id - Memory-hard, GPU-resistant
result = await argon2.hash({
    pass: password,
    salt: saltBytes,
    type: argon2.ArgonType.Argon2id,
    mem: 65536,  // 64MB memory
    time: 2,     // 2 iterations
    parallelism: 1
});
```

### Backend Argon2 Config (Python)
```python
ph = PasswordHasher(
    time_cost=3,        # Iterations
    memory_cost=65536,  # 64 MB
    parallelism=2,      # Threads
    hash_len=32,        # Output length
    salt_len=16         # Salt length
)
```

### Rate Limiting
- **5 failed attempts** → 15-minute lockout
- IP address tracking
- Login attempt logging

### Password History
- Prevents reuse of last **5 passwords**
- Checks against all stored algorithms

### Transparent Migration
- Users with MD5 hashes are **automatically upgraded** to Argon2id on next login

---

## 🛠️ Key Features by File

### `shared/js/script.js` (~1200 lines)
- `generateHash(password, algorithm)` - Hash with any algorithm
- `verifyHash(password, algorithm, hash)` - Verify passwords
- `checkPasswordPwned(password)` - HaveIBeenPwned API check
- `attemptLegacyMigration(user, password)` - MD5 → Argon2
- `exportDatabaseForHashcat()` - Export for offline cracking
- `renderUserTable()` - Display user dashboard

### `backend/app.py` (~800 lines)
- `POST /api/register` - Create user with chosen algorithm
- `POST /api/login` - Authenticate + auto-migrate
- `GET /api/users` - List all users
- `GET /api/health` - System status
- `GET /api/benchmark` - Hash performance comparison
- `POST /api/export/hashcat` - Export for cracking

### `tools/scripts/attack_toolkit.py`
```bash
python tools/scripts/attack_toolkit.py
# Options:
# 1. Export hashes for Hashcat
# 2. Generate sample wordlist
# 3. Show crack time statistics
# 4. Show attack strategies
```

---

## ⚡ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | Authenticate user |
| GET | `/api/users` | List all users |
| GET | `/api/health` | System status |
| GET | `/api/benchmark` | Hash performance |
| DELETE | `/api/users/<id>` | Delete user |

**Example Registration:**
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"pass123","algorithm":"argon2"}'
```

---

## 🎯 Educational Demos

### 1. Dictionary Attack Simulator
**Location:** `features/security-testing/security-testing.html`
- Enter a password, select algorithm
- Watch it attempt to match against wordlist
- See timing differences between MD5 vs Argon2

### 2. Timing Attack Demo
- Demonstrates vulnerable string comparison
- Shows how response time leaks information
- Learn about constant-time comparison

### 3. Password Strength Analyzer
**Location:** `features/breach-analysis/breach.html`
- Real-time strength meter
- Crack time estimation
- HaveIBeenPwned integration

---

## 📊 Crack Time Comparison (RTX 4090)

| Algorithm | Speed | 8-char Time | Risk |
|-----------|-------|-------------|------|
| MD5 | 200 GH/s | ~30 seconds | 🔴 Critical |
| SHA-1 | 100 GH/s | ~1 minute | 🔴 High |
| BCrypt | 100 kH/s | ~2 years | 🟡 Medium |
| Argon2id | ~5 H/s | 100+ years | 🟢 Low |

---

## 🚀 Running the Project

### Prerequisites
- Python 3.10+
- Node.js (optional, for development)

### Backend Setup
```powershell
cd backend
python -m venv ..\.venv
..\.venv\Scripts\activate
pip install flask flask-cors flask-sqlalchemy argon2-cffi
python app.py
```

### Frontend
Just open `index.html` in a browser, or:
```powershell
python -m http.server 8000
# Then visit http://localhost:8000
```

---

## 📝 License

Educational use only. Do not use these techniques on systems you don't own.

---

## 🔗 Quick Links

| Page | Path | Purpose |
|------|------|---------|
| Login | `index.html` | Authentication entry point |
| Features | `features/index.html` | Visual folder overview |
| Register | `features/auth/register.html` | New user signup |
| Dashboard | `features/dashboard/dashboard.html` | Manage users |
| Security Lab | `features/security-testing/security-testing.html` | Attack demos |
| Tools | `tools/index.html` | Diagnostics & scripts |
