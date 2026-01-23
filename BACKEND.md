# 🔧 Backend Documentation - SOC Platform

## Flask Backend Server Technical Reference

This document provides comprehensive documentation for the Security Operations Center (SOC) Platform Flask backend.

---

## 📑 Table of Contents

1. [Server Configuration](#1-server-configuration)
2. [Dependencies](#2-dependencies)
3. [Database Schema](#3-database-schema)
4. [API Endpoints](#4-api-endpoints)
5. [Hashing Functions](#5-hashing-functions)
6. [Security Features](#6-security-features)
7. [Error Handling](#7-error-handling)
8. [Running the Server](#8-running-the-server)

---

## 1. Server Configuration

### Base Configuration

| Property | Value | Description |
|----------|-------|-------------|
| **Host** | `0.0.0.0` | Accepts connections from any IP |
| **Port** | `5000` | Default Flask development port |
| **Debug** | `True` | Enable debug mode (disable in production) |
| **CORS** | Enabled | Cross-Origin Resource Sharing allowed |

### Environment Variables

```python
DB_PATH = 'database.db'              # SQLite database location
AUTO_RESALT_INTERVAL = 300           # 5 minutes (demo), 3600 (production)
ARGON2_AVAILABLE = True/False        # Depends on argon2-cffi installation
```

### Argon2 Parameters

```python
PasswordHasher(
    time_cost=2,          # Number of iterations
    memory_cost=65536,    # Memory usage in KB (64 MB)
    parallelism=1,        # Number of parallel threads
    hash_len=32,          # Hash output length in bytes
    salt_len=16,          # Salt length in bytes
    type=Type.ID          # Argon2id variant (hybrid)
)
```

---

## 2. Dependencies

### Required Python Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `flask` | ≥2.3.0 | Web framework |
| `flask-cors` | ≥4.0.0 | CORS support |
| `argon2-cffi` | ≥23.1.0 | Argon2id password hashing |
| `bcrypt` | ≥4.0.0 | bcrypt password hashing |
| `requests` | ≥2.31.0 | HIBP API calls |

### Installation

```bash
cd backend
pip install -r requirements.txt
```

### requirements.txt

```
flask>=2.3.0
flask-cors>=4.0.0
argon2-cffi>=23.1.0
bcrypt>=4.0.0
requests>=2.31.0
```

---

## 3. Database Schema

### SQLite Database: `database.db`

#### Table: `users`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PRIMARY KEY | Auto-increment user ID |
| `name` | TEXT NOT NULL | User's full name |
| `email` | TEXT UNIQUE NOT NULL | User's email (unique) |
| `algorithm` | TEXT DEFAULT 'Multi-Hash' | Hashing algorithm used |
| `salt` | TEXT NOT NULL | Password salt |
| `password_hash` | TEXT NOT NULL | Hashed password |
| `hash_md5` | TEXT | MD5 hash (educational) |
| `hash_sha1` | TEXT | SHA-1 hash (deprecated) |
| `hash_sha256` | TEXT | SHA-256 hash |
| `hash_sha512` | TEXT | SHA-512 hash |
| `security_score` | INTEGER DEFAULT 0 | Password strength (0-100) |
| `breach_status` | TEXT DEFAULT 'UNKNOWN' | SECURE/WEAK/BREACHED |
| `resalt_count` | INTEGER DEFAULT 0 | Number of re-salts |
| `last_resalt` | TIMESTAMP | Last re-salt time |
| `created_at` | TIMESTAMP | Registration time |

#### Table: `demo_users`

Same schema as `users` - used for demo/lab demonstrations.

#### Table: `resalt_log`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PRIMARY KEY | Log entry ID |
| `user_id` | INTEGER | Reference to user |
| `old_salt` | TEXT | Previous salt value |
| `new_salt` | TEXT | New salt value |
| `resalted_at` | TIMESTAMP | Resalt timestamp |

---

## 4. API Endpoints

### Static File Serving

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Serve main index.html |
| `/dashboard` | GET | Serve backend dashboard |
| `/result-login` | GET | Serve result login page |
| `/<path:path>` | GET | Serve static files |

### User Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register` | POST | Register new user |
| `/api/users` | GET | Get all registered users |
| `/api/demo-users` | GET | Get demo users |
| `/api/users/clear` | DELETE | Clear all users |

### Re-Salt Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/resalt` | POST | Manual resalt all users |
| `/api/resalt/auto` | POST | Toggle auto-resalt |
| `/api/resalt/status` | GET | Get auto-resalt status |
| `/api/resalt/log` | GET | Get resalt history |
| `/api/resalt/users` | GET | Get users for resalt |
| `/api/resalt/user/<id>` | POST | Resalt single user |

### Security Audit

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/audit/duplicate-passwords` | GET | Find duplicate hashes |
| `/api/audit/weak-passwords` | GET | Find weak passwords |
| `/api/audit/breached-passwords` | GET | Find breached passwords |
| `/api/audit/hash-distribution` | GET | Analyze hash algorithms |

### Hash Migration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/hash-migration/users` | GET | Get users for migration |
| `/api/hash-migration/convert` | POST | Convert single user |
| `/api/hash-migration/batch` | POST | Batch conversion |

### Utilities

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats` | GET | Get dashboard statistics |
| `/api/hash` | POST | Hash a password |
| `/api/demo/populate` | POST | Populate demo data |
| `/api/health` | GET | Health check |

---

## 5. Hashing Functions

### Available Algorithms

| Algorithm | Security | Output Length | Use Case |
|-----------|----------|---------------|----------|
| **MD5** | ❌ Broken | 128-bit (32 hex) | Educational only |
| **SHA-1** | ❌ Deprecated | 160-bit (40 hex) | Legacy systems |
| **SHA-256** | ✅ Secure | 256-bit (64 hex) | General purpose |
| **SHA-512** | ✅ Very Secure | 512-bit (128 hex) | High security |
| **bcrypt** | ✅ Excellent | Adaptive | Password storage |
| **Argon2id** | ✅ Best | Adaptive | Recommended |

### Function Reference

```python
# Generate cryptographic salt
generate_salt(length=32) → str

# Hash with MD5 (NOT secure)
hash_password_md5(password) → (hash, salt)

# Hash with bcrypt
hash_password_bcrypt(password) → (hash, salt)

# Hash with Argon2id (recommended)
hash_password_argon2(password) → (hash, salt)

# Verify password
verify_password(password, algorithm, hash) → bool

# Check if password is breached (HIBP API)
check_password_pwned(password) → (is_pwned, count)

# Convert hash to another algorithm
hash_with_custom_salt(input_hash, salt_length, algorithm) → (hash, salt)
```

---

## 6. Security Features

### Password Breach Detection

Uses Have I Been Pwned (HIBP) API with k-Anonymity model:
1. Hash password with SHA-1
2. Send first 5 characters to API
3. Check if remaining hash appears in response
4. Returns breach count if found

### Auto-Resalt Feature

Background thread that periodically re-salts all passwords:
- Configurable interval (default: 5 minutes for demo)
- Generates new salt for each user
- Logs old and new salt to `resalt_log` table
- Updates security score to 85

### Hash Migration

Upgrade weak hashes to stronger algorithms:
- Preserves original MD5 hash for verification
- Applies new salt to existing hash
- Supports: SHA-1, SHA-256, SHA-512, bcrypt, Argon2id

---

## 7. Error Handling

### Response Format

**Success Response:**
```json
{
    "success": true,
    "message": "Operation completed",
    "data": { ... }
}
```

**Error Response:**
```json
{
    "success": false,
    "message": "Error description"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `400` | Bad Request (validation error) |
| `404` | Not Found |
| `500` | Internal Server Error |

---

## 8. Running the Server

### Development Mode

```bash
cd backend
python app.py
```

**Expected Output:**
```
🔐 Security Operations Center - Flask Backend
==================================================
🔒 Hashing Algorithm: Argon2id
🧂 Salt Length: 16 bytes (32 hex chars)
🔄 Auto-Resalt Interval: 300 seconds
==================================================
✅ Database initialized successfully!
🚀 Starting server on http://localhost:5000
==================================================
 * Running on http://0.0.0.0:5000
 * Debug mode: on
```

### Production Considerations

1. Set `debug=False`
2. Use a production WSGI server (Gunicorn, uWSGI)
3. Enable HTTPS with proper certificates
4. Set strong `SECRET_KEY`
5. Configure rate limiting
6. Enable logging to file
7. Use environment variables for sensitive config

### Environment Setup

```bash
# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Linux/Mac)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
python app.py
```

---

## API Examples

### Register User

```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "securityScore": 85
  }'
```

### Get All Users

```bash
curl http://localhost:5000/api/users
```

### Trigger Resalt

```bash
curl -X POST http://localhost:5000/api/resalt
```

### Health Check

```bash
curl http://localhost:5000/api/health
```

---

**Last Updated:** January 2026  
**Version:** 1.0.0  
**Technologies:** Python Flask, SQLite, Argon2id, bcrypt
