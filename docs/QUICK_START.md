# 🚀 Quick Start Guide - Flask & Database

## ✅ Current Status
- **Flask Backend**: ✅ RUNNING at http://127.0.0.1:5000
- **Frontend Server**: ✅ RUNNING at http://localhost:8000
- **Database**: ✅ INITIALIZED with 4 sample users

---

## 📊 How to View the Database

### Method 1: Dashboard (Best for Visual View)
**URL:** http://localhost:8000/dashboard.html

**Features:**
- ✅ See all users in a table
- ✅ View hash types and security levels
- ✅ Statistics cards (Total Users, MD5 count, Argon2 count)
- ✅ Refresh and Clear Data buttons
- ✅ Copy hash to clipboard

### Method 2: API Endpoints (Best for Data)

**Get All Users:**
```
http://127.0.0.1:5000/api/users
```

**Get Statistics:**
```
http://127.0.0.1:5000/api/stats
```

**Response Example:**
```json
{
  "success": true,
  "stats": {
    "total_users": 4,
    "md5_users": 3,
    "argon2_users": 1,
    "upgraded_users": 0,
    "security_score": 25.0
  }
}
```

### Method 3: SQLite Database File (Best for Direct Access)

**Location:** `d:\Computer Security\auth_security_lab.db`

**View with SQLite Browser:**
```bash
# Install DB Browser for SQLite from: https://sqlitebrowser.org/
# Then open: auth_security_lab.db
```

**Or use Python:**
```bash
cd "d:\Computer Security"
python
```
```python
import sqlite3
conn = sqlite3.connect('auth_security_lab.db')
cursor = conn.cursor()

# View all users
cursor.execute("SELECT username, algorithm, upgraded FROM users")
for row in cursor.fetchall():
    print(row)

# Get count
cursor.execute("SELECT COUNT(*) FROM users")
print(f"Total users: {cursor.fetchone()[0]}")

conn.close()
```

---

## 🧪 Sample Users (Already in Database)

| # | Username | Password | Algorithm | Purpose |
|---|----------|----------|-----------|---------|
| 1 | alice_legacy | password123 | MD5 (no salt) | Show vulnerability |
| 2 | bob_salted | welcome2024 | MD5 (salted) | Still weak |
| 3 | charlie_secure | MySecureP@ss123! | Argon2 | Secure demo |
| 4 | diana_migrate | test1234 | MD5 | Test auto-upgrade |

---

## 🎯 Quick Actions

### Start Flask Server
```bash
cd "d:\Computer Security"
python app.py
```

### Start Frontend Server
```bash
cd "d:\Computer Security"
python -m http.server 8000
```

### Stop Servers
Press `CTRL+C` in the terminal

### Restart Database (Reset to Sample Users)
```bash
python setup.py
```

---

## 🧪 Test the Connection

### Connection Test Page
**URL:** http://localhost:8000/test-connection.html

**Buttons:**
- ✅ Test Health Endpoint
- ✅ Get Configuration
- ✅ Get Statistics
- ✅ Run Benchmark

### Test Login with Migration
1. Go to: http://localhost:8000/index.html
2. Login as: `diana_migrate` / `test1234`
3. Watch: MD5 → Argon2 auto-upgrade!
4. Check dashboard: User now shows "UPGRADED" badge

### Test Registration
1. Go to: http://localhost:8000/register.html
2. Create user with Argon2
3. Check dashboard: New user appears
4. Try logging in: Works perfectly!

---

## 📁 Database Tables

### `users` Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(80) UNIQUE,
    password_hash VARCHAR(512),
    algorithm VARCHAR(20),
    salt VARCHAR(512),
    created_at DATETIME,
    last_login DATETIME,
    upgraded BOOLEAN
);
```

### `login_attempts` Table
```sql
CREATE TABLE login_attempts (
    id INTEGER PRIMARY KEY,
    username VARCHAR(80),
    success BOOLEAN,
    ip_address VARCHAR(45),
    timestamp DATETIME
);
```

---

## 🔧 Troubleshooting

### Flask Not Running?
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Restart Flask
cd "d:\Computer Security"
python app.py
```

### Database Empty?
```bash
# Reinitialize with sample users
python setup.py
```

### Frontend Not Loading?
```bash
# Restart HTTP server
cd "d:\Computer Security"
python -m http.server 8000
```

### Can't See Users in Dashboard?
1. Check Flask is running: http://127.0.0.1:5000/api/health
2. Check browser console (F12) for errors
3. Look for "🟢 Backend Connected" indicator
4. Try clicking "REFRESH" button on dashboard

---

## 📊 Current Database View

**Open Dashboard Now:**
http://localhost:8000/dashboard.html

**Or Test Connection:**
http://localhost:8000/test-connection.html

**Or API:**
http://127.0.0.1:5000/api/users

---

## 💡 Pro Tips

1. **Keep Both Servers Running:**
   - Terminal 1: `python app.py` (Flask backend)
   - Terminal 2: `python -m http.server 8000` (Frontend)

2. **Check Logs:**
   - Flask terminal shows all API requests
   - Browser console (F12) shows frontend activity

3. **Export Database:**
   - Dashboard → "Export Data" button
   - Or: http://127.0.0.1:5000/api/export/hashcat

4. **Performance Test:**
   - Connection Test Page → "Run Benchmark"
   - See MD5 vs Argon2 speed difference

---

**Your database is running and ready to use!** 🎉
