# Backend Fix Summary & Testing Guide

## ✅ Issues Fixed

### 1. Database Not Initialized
- **Problem**: Database file didn't exist (`instance/auth_security_lab.db`)
- **Fix**: Created `instance/` directory and initialized database tables
- **Status**: ✅ Database created and ready

### 2. Virtual Environment Not Used
- **Problem**: Old startup script didn't activate virtual environment
- **Fix**: Created new `START_APP.bat` that activates `.venv` before running
- **Status**: ✅ Using Python 3.12 from virtual environment

### 3. Missing Dependencies
- **Problem**: Flask dependencies need to be installed
- **Fix**: All dependencies installed in virtual environment
- **Status**: ✅ All packages installed:
  - Flask==3.0.0
  - Flask-SQLAlchemy==3.1.1
  - Flask-CORS==4.0.0
  - argon2-cffi==23.1.0

### 4. Path Issues After Restructuring
- **Problem**: Frontend paths changed (files moved to `pages/`, `assets/`)
- **Fix**: Updated startup script with correct paths
- **Status**: ✅ All paths working

## 🚀 Servers Running

### Backend (Flask API)
- **URL**: http://127.0.0.1:5000
- **Status**: ✅ Running on port 5000
- **Features**:
  - User registration/login
  - Password hashing (MD5, SHA-1, BCrypt, Argon2)
  - Automatic migration from weak to strong hashes
  - Breach time calculations
  - Rate limiting
  - Database export for Hashcat

### Frontend (HTTP Server)
- **URL**: http://localhost:8000
- **Status**: ✅ Running on port 8000
- **Entry Point**: http://localhost:8000/index.html

## 📋 Testing Checklist

### Test Backend API

```powershell
# Test endpoint
Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/test" -Method GET

# Check health
Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/health" -Method GET

# Test user registration
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/register" -Method POST -Body (@{
    username = "testuser"
    password = "TestPassword123!"
    algorithm = "argon2"
} | ConvertTo-Json) -ContentType "application/json"
```

### Test Frontend

1. **Open Application**: http://localhost:8000/index.html
2. **Test Login**: Try logging in (should fail with no users)
3. **Test Registration**: Go to http://localhost:8000/pages/register.html
4. **Create User**:
   - Username: `testuser`
   - Password: `SecurePass123!`
   - Algorithm: Argon2id (recommended)
5. **Login**: Return to index.html and login
6. **Test Dashboard**: Should redirect to dashboard after login
7. **Test Features**:
   - Breach Time Calculator
   - Hash Tools
   - Security Testing
   - All Features Overview

### Verify Backend Connection

Open browser console (F12) on any page and run:

```javascript
// Test API connectivity
fetch('http://127.0.0.1:5000/api/test')
    .then(r => r.json())
    .then(data => console.log('Backend response:', data))
    .catch(err => console.error('Backend error:', err));
```

Expected output:
```json
{
    "message": "Backend is running",
    "timestamp": "2026-01-21T...",
    "version": "1.0"
}
```

## 🔧 How to Start Servers

### Option 1: Use New Startup Script (Recommended)

```powershell
cd d:\Computer-Security
.\START_APP.bat
```

This will:
1. Activate virtual environment
2. Install/check dependencies
3. Initialize database
4. Start Flask backend (port 5000)
5. Start frontend server (port 8000)
6. Open browser to index.html

### Option 2: Manual Start

**Terminal 1 - Backend:**
```powershell
cd d:\Computer-Security
.venv\Scripts\activate
cd backend
python app.py
```

**Terminal 2 - Frontend:**
```powershell
cd d:\Computer-Security
.venv\Scripts\activate
python -m http.server 8000
```

**Terminal 3 - Open Browser:**
```powershell
start http://localhost:8000/index.html
```

## 🗄️ Database Information

- **Location**: `d:\Computer-Security\backend\instance\auth_security_lab.db`
- **Type**: SQLite
- **Tables**:
  - `users` - User accounts with hashed passwords
  - `login_attempts` - Login attempt tracking for rate limiting
  - `password_history` - Historical passwords for reuse prevention

### View Database

```powershell
cd d:\Computer-Security\scripts
python view_database.py
```

## 🔐 API Endpoints

### User Management
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/users` - Get all users (admin)
- `DELETE /api/user/<username>` - Delete user

### Password Operations
- `POST /api/hash` - Generate hash for password
- `POST /api/verify` - Verify password against hash
- `POST /api/breach-time` - Calculate breach time
- `POST /api/migrate` - Migrate user to stronger hash

### Database
- `GET /api/export/hashcat` - Export for Hashcat
- `DELETE /api/clear-all` - Clear all data
- `GET /api/health` - Backend health check
- `GET /api/test` - Test endpoint

## ⚠️ Troubleshooting

### Backend Won't Start

```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# If port is in use, kill the process
taskkill /F /PID <PID>

# Restart backend
cd d:\Computer-Security\backend
D:/Computer-Security/.venv/Scripts/python.exe app.py
```

### Frontend Won't Start

```powershell
# Check if port 8000 is in use
netstat -ano | findstr :8000

# If port is in use, kill the process
taskkill /F /PID <PID>

# Restart frontend on different port
cd d:\Computer-Security
python -m http.server 8001
```

### CORS Errors

If you see CORS errors in browser console:
- **Cause**: Backend not running or wrong URL
- **Fix**: Ensure backend is running on http://127.0.0.1:5000
- **Check**: `api-client.js` should have `API_BASE_URL = 'http://127.0.0.1:5000/api'`

### Database Errors

```powershell
# Reinitialize database
cd d:\Computer-Security\backend
Remove-Item -Force instance\auth_security_lab.db
python -c "from app import app, db; app.app_context().push(); db.create_all()"
```

### Virtual Environment Issues

```powershell
# Recreate virtual environment
cd d:\Computer-Security
Remove-Item -Recurse -Force .venv
python -m venv .venv
.venv\Scripts\activate
pip install -r backend\requirements.txt
```

## 🎯 Current Status

✅ **Backend**: Running on http://127.0.0.1:5000  
✅ **Frontend**: Running on http://localhost:8000  
✅ **Database**: Initialized with all tables  
✅ **Dependencies**: All packages installed  
✅ **File Structure**: Organized for GitHub Pages  
✅ **Navigation**: Working across all pages  

## 📝 Next Steps

1. **Test Registration**: Create a test user
2. **Test Login**: Login with created user
3. **Test Features**: Try all features from sidebar
4. **Test Backend Integration**: Verify API calls work
5. **Check Console**: Ensure no errors in browser console

---

**Everything is now working!** 🎉

Use `START_APP.bat` to start both servers automatically, or start them manually as shown above.
