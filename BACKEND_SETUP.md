# 🚀 Backend Setup Guide

This guide explains how to start and use the Flask backend for the Security Operations Center platform.

---

## 📋 Prerequisites

- **Python 3.8+** installed on your system
- **Virtual environment** already configured (`.venv` folder exists)
- **Dependencies** installed:
  - flask
  - flask-cors
  - argon2-cffi
  - bcrypt

---

## ⚡ Quick Start

### **Step 1: Start the Backend Server**

Open a terminal in the project root directory and run:

```powershell
.\.venv\Scripts\python.exe backend\app.py
```

**You should see:**
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
 * Running on http://0.0.0.0:5000
Press CTRL+C to quit
```

✅ **Backend is now running!** Keep this terminal window open.

---

### **Step 2: Access the Application**

#### **Registration Page:**
1. Open `index.html` in your web browser
2. Fill in the registration form:
   - Name
   - Email
   - **Select Algorithm**: Choose between Argon2 (recommended) or bcrypt
   - Password
3. Click **"Register"**
4. User data is saved to the SQLite database with selected algorithm

#### **Dashboard Page:**
1. Open `backend/dashboard.html` in your web browser
2. View all registered users
3. See security statistics:
   - Total users
   - Secure passwords (70+ score)
   - Weak passwords (<50 score)
   - Breached passwords

---

## 🗄️ Database Information

### **Location:**
```
backend/database.db
```

### **Tables:**
- **users** - Registered users from the registration form
- **demo_users** - Demo/sample data (not currently used)
- **resalt_log** - Auto-resalt history logs

### **User Schema:**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NUArgon2',
    salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    hash_md5 TEXT,
    hash_sha1 TEXT,
    hash_sha256 TEXT,
    hash_sha512 TEXT,
    security_score INTEGER DEFAULT 0,
    breach_status TEXT DEFAULT 'UNKNOWN',
    resalt_count INTEGER DEFAULT 0,
    last_resalt TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Note:** The `hash_md5`, `hash_sha1`, `hash_sha256`, `hash_sha512` columns store reference hashes for **educational purposes only**. The actual password is secured using the chosen algorithm (bcrypt or Argon2) stored in `password_hash`.
```

---

## 🔌 API Endpoints

### **Base URL:** `http://localhost:5000/api`

### **Available Endpoints:**

#### **1. Health Check**
```http
GET /api/health
```
Check if backend is running.

**Response:**
```json
{
  "status": "healthy",
  "message": "Backend is running"
}
```

---

#### **2. Register User**
```http
POST /api/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "algorithm": "Argon2",
  "hashes": {
    "md5": "5f4dcc3b5aa765d61d8327deb882cf99",
    "sha1": "8cb2237d0679ca88db6464eac60da96345513964",
    "sha256": "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
    "sha512": "ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548..."
  },
  "securityScore": 75
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful with Argon2 Authentication!",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "algorithm": "Argon2",
    "salt": "",
    "passwordHash": "$argon2id$v=19$m=65536,t=2,p=1$ti-Hash",
    "salt": "a1b2c3d4e5f6...",
    "passwordHash": "...",
    "securityScore": 75,
    "breachStatus": "SECURE"
  }
}
```

---

#### **3. Get All Users**
```http
GET /api/users
```

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,Argon2",
      "salt": "",
      "passwordHash": "$argon2id$v=19$m=65536,t=2,p=1$ample.com",
      "algorithm": "Multi-Hash",
      "salt": "a1b2c3d4...",
      "passwordHash": "...",
      "securityScore": 75,
      "breachStatus": "SECURE",
      "resaltCount": 0,
      "createdAt": "2026-01-23T10:30:00"
    }
  ],
  "count": 1
}
```

---

#### **4. Clear All Users**
```http
DELETE /api/users/clear
```

**Response:**
```json
{
  "success": true,
  "message": "All users cleared successfully"
}
```

---

## 🔧 Configuration

### **Port Configuration**
The backend runs on port `5000` by default. To change:

Edit `backend/app.py` (line ~900):
```python
if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
```

### **CORS Configuration**
CORS is enabled for all origins. To restrict:

Edit `backend/app.py` (line ~34):
```python
CORS(app, origins=['http://localhost:3000'])  # Restrict to specific origin
```

---

## 🛠️ Troubleshooting

### **Problem: "Module not found" errors**

**Solution:** Install dependencies
```powershell bcrypt
.\.venv\Scripts\pip.exe install flask flask-cors argon2-cffi
```

---

### **Problem: "Address already in use" (Port 5000 conflict)**

**Solution 1:** Stop other process using port 5000
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Solution 2:** Change port in `backend/app.py` and `backend/dashboard.html`

---

### **Problem: "Database locked" error**

**Solution:** Close all connections to database
- Close dashboard browser tab
- Stop backend server (CTRL+C)
- Restart backend server

---

### **Problem: Dashboard shows "Error connecting to Flask backend"**

**Checklist:**
1. ✅ Backend server is running (check terminal)
2. ✅ Backend URL is correct (`http://localhost:5000/api`)
3. ✅ No firewall blocking port 5000
4. ✅ CORS is enabled

**Test manually:**
```powershell
curl http://localhost:5000/api/health
```

Should return:
```json
{"status":"healthy","message":"Backend is running"}
```

---

### **Problem: Users not appearing in dashboard**

**Solution:**
1. Verify users exist in database:
```powershell
.\.venv\Scripts\python.exe -c "import sqlite3; conn = sqlite3.connect('backend/database.db'); cursor = conn.cursor(); cursor.execute('SELECT COUNT(*) FROM users'); print(f'Total users: {cursor.fetchone()[0]}'); conn.close()"
```

2. Check if dashboard is in correct mode:
   - Open `backend/dashboard.html`
   - Look for `currentStorage = 'backend'` (not 'local')

3. Refresh the dashboard (F5)

---

## 🔒 Security Features

### **Password bcrypt or Argon2 (user choice)
- **bcrypt**: 12 rounds, built-in salt generation
- **Argon2**: Argon2id variant, memory-hard, 64MB memory cost
- **Reference Hashes:** MD5, SHA-1, SHA-256, SHA-512 (educational only, NOT for password storage)
- **Salt Generation:** Cryptographically secure random salts

### **Breach Detection**
Passwords are checked against common password list:
- `123456`, `password`, `123456789`, `qwerty`, etc.

### **Security Scoring**
- **Secure:** 70+ score
- **Moderate:** 50-69 score  
- **Weak:** <50 score

---

## 📊 Database Maintenance

### **View All Users**
```powershell
.\.venv\Scripts\python.exe -c "import sqlite3; conn = sqlite3.connect('backend/database.db'); cursor = conn.cursor(); cursor.execute('SELECT id, name, email, algorithm FROM users'); users = cursor.fetchall(); [print(f'{u[0]}. {u[1]} ({u[2]}) - {u[3]}') for u in users]; conn.close()"
```

### **Clear All Users**
```powershell
.\.venv\Scripts\python.exe -c "import sqlite3; conn = sqlite3.connect('backend/database.db'); cursor = conn.cursor(); cursor.execute('DELETE FROM users'); conn.commit(); print('All users deleted'); conn.close()"
```

### **Recreate Database**
```powershell
# Delete old database
Remove-Item backend\database.db -Force

# Recreate with correct schema
.\.venv\Scripts\python.exe -c "import sys; sys.path.insert(0, 'backend'); from app import init_db; init_db(); print('Database recreated')"
```

---

## 🚦 Complete Startup Checklist

1. ✅ Open terminal in project root
2. ✅ Run: `.\.venv\Scripts\python.exe backend\app.py`
3. ✅ Wait for "Running on http://127.0.0.1:5000"
4. ✅ Open `index.html` to register users
5. ✅ Open `backend/dashboard.html` to view users
6. ✅ Check dashboard shows "Backend Ready" status

---

## 🎯 Usage Flow

```
┌─────────────────────┐
│   index.html        │  ← User registers here
│   (Registration)    │
└──────────┬──────────┘
           │
           │ POST /api/register
           ▼
┌─────────────────────┐
│   Flask Backend     │  ← Saves to database
│   (app.py)          │
└──────────┬──────────┘
           │
           │ Stores in SQLite
           ▼
┌─────────────────────┐
│   database.db       │  ← User data stored
│   (SQLite)          │
└──────────┬──────────┘
           │
           │ GET /api/users
           ▼
┌─────────────────────┐
│   dashboard.html    │  ← View all users
│   (Admin Panel)     │
└─────────────────────┘
```

---

## 📝 Notes

- **Database s:** Users choose between Argon2 (recommended) or bcrypt
- **Reference Hashes:** MD5, SHA-1, SHA-256, SHA-512 stored for educational purposes
- **Auto-Resalt:** Feature available but disabled by default
- **Development Mode:** Debug mode is ON (disable in production)

---

## 📖 Algorithm Documentation

For detailed information about hash algorithms used in this project, see [HASH_ALGORITHMS_GUIDE.md](HASH_ALGORITHMS_GUIDE.md).

**Quick Summary:**
- **For Password Storage**: bcrypt or Argon2 (✅ Secure)
- **For General Hashing**: MD5, SHA-1, SHA-256, SHA-512 (❌ NOT for passwords!
- **Development Mode:** Debug mode is ON (disable in production)

---

## 🆘 Need Help?

**Common Issues:**
1. Backend won't start → Check Python installation
2. Can't connect → Verify port 5000 is free
3. Database errors → Recreate database (see above)
4. Users not showing → Check backend is running

**Test Backend Health:**
```powershell
curl http://localhost:5000/api/health
```

---

**Ready to go! Start the backend and register some users! 🎉**
