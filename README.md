# 🔐 Security Operations Center (SOC) Platform
## Complete Technical Documentation & Project Guide

A full-stack web application for secure user registration, password management, cryptographic hashing, and real-time security analytics. Built with Python Flask backend and modern JavaScript/HTML/CSS frontend.

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Technology Stack](#2-architecture--technology-stack)
3. [Password Hashing - Deep Dive](#3-password-hashing---deep-dive)
4. [Database Schema & Data Flow](#4-database-schema--data-flow)
5. [API Endpoints Reference](#5-api-endpoints-reference)
6. [Security Features & Audit Tools](#6-security-features--audit-tools)
7. [Mathematical & Cryptographic Logic](#7-mathematical--cryptographic-logic)
8. [Frontend Components](#8-frontend-components)
9. [How to Run the Project](#9-how-to-run-the-project)
10. [Project Structure](#10-project-structure)
11. [Security Best Practices](#11-security-best-practices)

---

## 1. Project Overview

### What is this project?

A **Security Operations Center (SOC) Platform** that demonstrates:
- Secure user registration with cryptographic password hashing
- Multiple hashing algorithms (MD5, SHA-1, SHA-256, SHA-512, bcrypt, Argon2id)
- Password security analysis and scoring
- Duplicate password detection
- Breached password identification
- Salt generation and re-salting capabilities
- Admin dashboard for security monitoring

### Key Features

| Feature | Description |
|---------|-------------|
| **User Registration** | Register users with secure password hashing |
| **Multi-Hash Generator** | Generate MD5, SHA-1, SHA-256, SHA-512, bcrypt hashes with optional salt |
| **Hash Migration** | Upgrade password hashes from weak to strong algorithms |
| **Salt & Hash Manager** | 3-in-1 tool: Add Salt, Change Bit Length, Migrate Algorithm |
| **Security Scoring** | Analyze password strength (0-100 score) |
| **Duplicate Detection** | Find users sharing the same password |
| **Breach Detection** | Identify commonly breached passwords |
| **Password Generator** | Generate secure random passwords with customizable rules |
| **Admin Dashboard** | Real-time security monitoring |
| **Export/Clear** | Download data or clear database |

---

## 2. Architecture & Technology Stack

### Backend (Python Flask)

```
┌─────────────────────────────────────────────────────────────┐
│                    FLASK BACKEND SERVER                      │
│                   (app.py - Port 5000)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Routes    │  │  Hashing    │  │    Database         │  │
│  │   (API)     │  │  Functions  │  │    (SQLite)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │                │                    │              │
│         ▼                ▼                    ▼              │
│  /api/register     Argon2id/bcrypt      users table         │
│  /api/users        MD5/SHA-256          demo_users table    │
│  /api/audit/*      Salt Generation      resalt_log table    │
│  /api/resalt/*                                               │
└─────────────────────────────────────────────────────────────┘
```

### Frontend (HTML/CSS/JavaScript)

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Browser)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ index.html  │  │ dashboard   │  │  password-generator │  │
│  │ Registration│  │  .html      │  │  .html              │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │                │                    │              │
│         ▼                ▼                    ▼              │
│   User Input       Admin Panel          Utility Tools        │
│   Form Submit      Data Tables          Crypto Functions     │
│   API Calls        Audit Tools                               │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend** | Python 3.10+ | Server-side logic |
| **Framework** | Flask 2.3+ | REST API server |
| **Database** | SQLite | Data persistence |
| **Hashing** | argon2-cffi, bcrypt | Password hashing |
| **CORS** | flask-cors | Cross-origin requests |
| **Frontend** | HTML5, CSS3, JavaScript | User interface |
| **Styling** | Bootstrap 5, Font Awesome | UI components |

---

## 3. Password Hashing - Deep Dive

### 3.1 What is Password Hashing?

Password hashing is a **one-way cryptographic function** that transforms a password into a fixed-length string (hash). It's impossible to reverse the hash back to the original password.

```
Password: "MySecure123"
    │
    ▼ (Hashing Function)
    │
Hash: "5f4dcc3b5aa765d61d8327deb882cf99"
```

### 3.2 Hashing Algorithms Explained

#### MD5 (Message Digest 5)

```python
import hashlib
password = "hello"
hash = hashlib.md5(password.encode()).hexdigest()
# Result: "5d41402abc4b2a76b9719d911017c592"
```

- **Output**: 128-bit (32 hex characters)
- **Speed**: Very fast
- **Security**: ❌ NOT SECURE (collision attacks possible)
- **Use Case**: Educational purposes only

#### SHA-1 (Secure Hash Algorithm 1)

```python
hash = hashlib.sha1(password.encode()).hexdigest()
# Result: "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d"
```

- **Output**: 160-bit (40 hex characters)
- **Speed**: Fast
- **Security**: ❌ NOT SECURE (collision attacks)
- **Use Case**: Legacy systems only

#### SHA-256 (Secure Hash Algorithm 256)

```python
hash = hashlib.sha256(password.encode()).hexdigest()
# Result: "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
```

- **Output**: 256-bit (64 hex characters)
- **Speed**: Fast
- **Security**: ✅ Secure for data integrity
- **Use Case**: File checksums, digital signatures

#### SHA-512 (Secure Hash Algorithm 512)

```python
hash = hashlib.sha512(password.encode()).hexdigest()
# Result: 128 hex characters
```

- **Output**: 512-bit (128 hex characters)
- **Speed**: Fast
- **Security**: ✅ Secure for data integrity
- **Use Case**: High-security checksums

#### bcrypt

```python
import bcrypt
password = "hello".encode()
salt = bcrypt.gensalt(rounds=12)
hash = bcrypt.hashpw(password, salt)
# Result: "$2b$12$..."
```

- **Output**: 60 characters (includes salt)
- **Speed**: Slow (intentional - configurable work factor)
- **Security**: ✅✅ SECURE for passwords
- **Features**: Built-in salt, adaptive work factor
- **Use Case**: Password storage

#### Argon2id (Winner of Password Hashing Competition 2015)

```python
from argon2 import PasswordHasher
ph = PasswordHasher(
    time_cost=2,        # Number of iterations
    memory_cost=65536,  # Memory usage (64MB)
    parallelism=1,      # Number of threads
    hash_len=32,        # Output length
    salt_len=16         # Salt length
)
hash = ph.hash("hello")
# Result: "$argon2id$v=19$m=65536,t=2,p=1$..."
```

- **Output**: Variable length (includes parameters + salt)
- **Speed**: Configurable (memory-hard)
- **Security**: ✅✅✅ MOST SECURE for passwords
- **Features**: Memory-hard, resists GPU/ASIC attacks
- **Use Case**: Modern password storage

### 3.3 Salt - Why It's Critical

#### What is Salt?

A **salt** is a random string added to a password before hashing to ensure unique hashes.

```
Without Salt:
  "password" → MD5 → "5f4dcc3b5aa765d61d8327deb882cf99"
  "password" → MD5 → "5f4dcc3b5aa765d61d8327deb882cf99" (Same!)

With Salt:
  "password" + "a1b2c3d4" → MD5 → "e7d3e769f7b8a2c1d4e5f6a7b8c9d0e1"
  "password" + "x9y8z7w6" → MD5 → "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d" (Different!)
```

#### Salt Generation in This Project

```python
import secrets

def generate_salt(length=32):
    """Generate cryptographically secure random salt"""
    return secrets.token_hex(length // 2)  # 16 bytes = 32 hex chars
```

#### Why Salt Prevents Attacks

1. **Rainbow Table Attack**: Pre-computed hash tables become useless
2. **Dictionary Attack**: Same password → different hashes
3. **Duplicate Detection**: Can't identify users with same password (if salted properly)

### 3.4 Hashing Flow in This Project

#### Registration Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   User Input                                                  │
│   ┌─────────────────┐                                         │
│   │ Password: "abc" │                                         │
│   └────────┬────────┘                                         │
│            │                                                  │
│            ▼                                                  │
│   ┌─────────────────────────────────────────────────────┐     │
│   │            HASHING PROCESS (Backend)                │     │
│   │                                                     │     │
│   │   Step 1: Generate Salt                             │     │
│   │   salt = secrets.token_hex(16)                      │     │
│   │   salt = "a1b2c3d4e5f6g7h8"                         │     │
│   │                                                     │     │
│   │   Step 2: Hash with Algorithm                       │     │
│   │   MD5:    hash = md5("abc")                         │     │
│   │           = "900150983cd24fb0d6963f7d28e17f72"      │     │
│   │                                                     │     │
│   │   Argon2: hash = argon2id("abc", salt, params)      │     │
│   │           = "$argon2id$v=19$m=65536,t=2,p=1$..."    │     │
│   │                                                     │     │
│   │   Step 3: Calculate Security Score                  │     │
│   │   score = evaluate_password_strength("abc")         │     │
│   │   score = 15 (very weak)                            │     │
│   │                                                     │     │
│   │   Step 4: Check Breach Status                       │     │
│   │   if password in common_passwords:                  │     │
│   │       status = "BREACHED"                           │     │
│   │   elif score < 50:                                  │     │
│   │       status = "WEAK"                               │     │
│   │   else:                                             │     │
│   │       status = "SECURE"                             │     │
│   └─────────────────────────────────────────────────────┘     │
│            │                                                  │
│            ▼                                                  │
│   ┌─────────────────────────────────────────────────────┐     │
│   │            DATABASE STORAGE                         │     │
│   │                                                     │     │
│   │   INSERT INTO users (                               │     │
│   │       name, email, algorithm, salt,                 │     │
│   │       password_hash, security_score, breach_status  │     │
│   │   ) VALUES (                                        │     │
│   │       "John", "john@email.com", "MD5",              │     │
│   │       "a1b2c3d4e5f6g7h8",                           │     │
│   │       "900150983cd24fb0d6963f7d28e17f72",           │     │
│   │       15, "WEAK"                                    │     │
│   │   )                                                 │     │
│   └─────────────────────────────────────────────────────┘     │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

#### Registration Flow - Detailed Explanation

**Phase 1: User Input**

When a user registers, they provide:
- **Name**: User's full name
- **Email**: Unique identifier for the account
- **Password**: Secret credential (e.g., "abc")

The password is sent to the backend server via HTTPS (in production) to ensure secure transmission.

---

**Phase 2: Hashing Process (Backend)**

The backend receives the password and processes it through four critical steps:

**Step 1: Generate Salt**
```python
import secrets

# Generate cryptographically secure random salt
salt = secrets.token_hex(16)  # 16 bytes = 32 hex characters
# Example output: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

**What is `secrets.token_hex(16)`?**
- `secrets` is Python's built-in module for generating cryptographically strong random numbers
- `token_hex(16)` generates 16 random bytes and converts them to a 32-character hexadecimal string
- Each byte becomes 2 hex digits (0-9, a-f)
- Uses the operating system's secure random number generator (e.g., `/dev/urandom` on Linux, `CryptGenRandom` on Windows)
- **Why secure?** Output is unpredictable and suitable for cryptographic use (unlike `random` module)

**Why do we need salt?**
- Without salt: Same password → Same hash (vulnerable to rainbow table attacks)
- With salt: Same password + different salt → Different hash (unique per user)
- Makes pre-computed hash attacks useless

---

**Step 2: Hash with Algorithm**

The system supports multiple hashing algorithms. Here's how each works:

**MD5 (Educational Only):**
```python
import hashlib

password = "abc"
hash_value = hashlib.md5(password.encode()).hexdigest()
# Output: "900150983cd24fb0d6963f7d28e17f72"
```

**How MD5 works:**
1. Convert password string to bytes using `.encode()`
2. Pass bytes through MD5 algorithm (uses bitwise operations, modular addition, and compression functions)
3. Produces 128-bit (16 bytes) output
4. Convert to hexadecimal string (32 characters) using `.hexdigest()`
5. **Process:** `"abc"` → bytes → MD5 compression → binary hash → "900150983cd24fb0d6963f7d28e17f72"

**Why MD5 is NOT secure:**
- Fast computation (attackers can try billions of guesses per second)
- Collision attacks possible (two different inputs can produce same hash)
- No protection against brute-force or dictionary attacks

**Argon2id (Recommended):**
```python
from argon2 import PasswordHasher

ph = PasswordHasher(
    time_cost=2,        # Number of iterations (computational cost)
    memory_cost=65536,  # Memory usage in KB (64 MB)
    parallelism=1,      # Number of threads
    hash_len=32,        # Output hash length in bytes
    salt_len=16         # Salt length in bytes
)

password = "abc"
salt = "a1b2c3d4e5f6g7h8"
hash_value = ph.hash(password)
# Output: "$argon2id$v=19$m=65536,t=2,p=1$YTFiMmMzZDRlNWY2Zzdo$..."
```

**How Argon2id works:**
1. Takes password and generates/uses salt internally
2. Allocates large memory buffer (64 MB by default)
3. Performs multiple iterations of memory-hard operations
4. **Memory-hard**: Forces attackers to use lots of RAM, making GPU/ASIC attacks expensive
5. Output format includes algorithm parameters, salt, and hash: `$argon2id$v=19$m=65536,t=2,p=1$salt$hash`

**Why Argon2id is secure:**
- Slow and memory-intensive (protects against brute-force)
- Resistant to GPU/ASIC attacks (memory is expensive to parallelize)
- Winner of Password Hashing Competition (2015)
- Configurable parameters (can increase security as hardware improves)

**Hash Function Process:**
```
Input: "abc"
     ↓
Encoding: bytes [0x61, 0x62, 0x63]
     ↓
Algorithm: Mathematical transformations
     ↓
Output: Fixed-length hash string
```

---

**Step 3: Calculate Security Score**

```python
def evaluate_password_strength(password):
    score = 0
    
    # Length scoring (0-30 points)
    if len(password) >= 8:
        score += 10
    if len(password) >= 12:
        score += 10
    if len(password) >= 16:
        score += 10
    
    # Character variety (0-40 points)
    if any(c.isupper() for c in password):
        score += 10  # Has uppercase
    if any(c.islower() for c in password):
        score += 10  # Has lowercase
    if any(c.isdigit() for c in password):
        score += 10  # Has digits
    if any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password):
        score += 10  # Has special characters
    
    # Entropy calculation (0-30 points)
    char_set_size = 0
    if any(c.isupper() for c in password):
        char_set_size += 26
    if any(c.islower() for c in password):
        char_set_size += 26
    if any(c.isdigit() for c in password):
        char_set_size += 10
    if any(c in string.punctuation for c in password):
        char_set_size += 32
    
    entropy = len(password) * math.log2(char_set_size) if char_set_size > 0 else 0
    if entropy > 60:
        score += 30
    elif entropy > 40:
        score += 20
    elif entropy > 28:
        score += 10
    
    return min(score, 100)  # Cap at 100
```

**For password "abc":**
- Length: 3 characters → 0 points (too short)
- Character variety: Only lowercase → 10 points
- Entropy: 3 × log₂(26) = 14.1 bits → 5 points (very low)
- **Total: 15 points (Very Weak)**

**Score Interpretation:**
- 0-30: Very Weak (easily cracked in seconds)
- 31-50: Weak (cracked in minutes to hours)
- 51-70: Moderate (cracked in days to months)
- 71-85: Strong (cracked in years)
- 86-100: Very Strong (practically uncrackable)

---

**Step 4: Check Breach Status**

```python
# Common breached passwords database
common_passwords = [
    '123456', 'password', '123456789', '12345678',
    'qwerty', 'abc123', '111111', 'password1',
    '12345', '1234567890', ... (thousands more)
]

def check_breach_status(password, security_score):
    # Check if password is in known breach list
    if password.lower() in common_passwords:
        return "BREACHED"
    
    # Check if password score is too low
    elif security_score < 50:
        return "WEAK"
    
    # Password is reasonably secure
    else:
        return "SECURE"
```

**How breach detection works:**
1. **Local Dictionary Check**: Compare password against list of commonly breached passwords from data breaches (e.g., RockYou, LinkedIn, Adobe breaches)
2. **Have I Been Pwned (HIBP) API**: Check password against Troy Hunt's database of 850+ million pwned passwords using k-Anonymity model (only first 5 characters of SHA-1 hash are sent)
3. **Score Evaluation**: Even if not in breach list, weak passwords (score < 50) are flagged
4. **Status Assignment**:
   - `BREACHED`: Password found in known breach databases (local or HIBP)
   - `WEAK`: Low security score (< 50)
   - `SECURE`: Good score and not in breach list

**HIBP k-Anonymity Model:**
```python
def check_password_pwned(password):
    # Hash password with SHA-1
    sha1_hash = hashlib.sha1(password.encode()).hexdigest().upper()
    prefix = sha1_hash[:5]  # Send only first 5 chars
    suffix = sha1_hash[5:]
    
    # Query HIBP API with prefix
    response = requests.get(f'https://api.pwnedpasswords.com/range/{prefix}')
    
    # Check if suffix matches any returned hash
    for hash_line in response.text.split('\\r\\n'):
        hash_suffix, count = hash_line.split(':')
        if hash_suffix == suffix:
            return True, int(count)  # Pwned!
    return False, 0  # Safe
```

**Why this matters:**
- Passwords like "password123" appear in millions of accounts
- Attackers try these common passwords first
- Flagging breached passwords prevents easy account compromise
- HIBP uses k-Anonymity so your actual password is never sent to the API
- Real-time checking against 850+ million compromised passwords

---

**Phase 3: Database Storage**

After all processing, the user data is stored:

```sql
INSERT INTO users (
    name,                -- User's name: "John"
    email,               -- Unique identifier: "john@email.com"
    algorithm,           -- Hash algorithm used: "MD5"
    salt,                -- Generated salt: "a1b2c3d4e5f6g7h8"
    password_hash,       -- Hashed password: "900150983cd24fb0d6963f7d28e17f72"
    security_score,      -- Calculated score: 15
    breach_status        -- Security status: "WEAK"
) VALUES (
    'John',
    'john@email.com',
    'MD5',
    'a1b2c3d4e5f6g7h8',
    '900150983cd24fb0d6963f7d28e17f72',
    15,
    'WEAK'
)
```

**What gets stored:**
- ✅ **Password hash**: One-way encrypted version (cannot be reversed)
- ✅ **Salt**: Needed for verification during login
- ✅ **Algorithm**: To know which hash function to use for verification
- ✅ **Security metadata**: Score and breach status for monitoring
- ❌ **Plain password**: NEVER stored (security best practice)

**Database storage benefits:**
1. **Verification**: Can check login attempts by hashing input with stored salt and comparing hashes
2. **Security Monitoring**: Admin can identify weak passwords and take action
3. **Audit Trail**: Track security metrics across all users
4. **Re-salting**: Can upgrade weak hashes later without knowing original password

---

**Key Security Principles:**

1. **One-way transformation**: Password → Hash (irreversible)
2. **Unique salts**: Different hash for same password across users
3. **Secure storage**: Never store plain passwords
4. **Server-side processing**: All hashing happens on backend (not in browser)
5. **Multiple layers**: Hash + salt + score + breach check = defense in depth

#### Login Verification Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    LOGIN VERIFICATION FLOW                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   User Input: password = "abc"                                │
│                                                               │
│   Step 1: Retrieve stored hash and salt from database         │
│   SELECT salt, password_hash, algorithm FROM users            │
│   WHERE email = 'john@email.com'                              │
│                                                               │
│   Step 2: Hash submitted password with same algorithm         │
│   submitted_hash = hash_function(password, stored_salt)       │
│                                                               │
│   Step 3: Compare hashes                                      │
│   if submitted_hash == stored_hash:                           │
│       return "Login Successful" ✅                            │
│   else:                                                       │
│       return "Invalid Password" ❌                            │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema & Data Flow

### 4.1 Database Tables

#### Users Table (Main Storage)

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    algorithm TEXT DEFAULT 'Multi-Hash',
    salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    hash_md5 TEXT,           -- MD5 hash for reference
    hash_sha1 TEXT,          -- SHA-1 hash for reference
    hash_sha256 TEXT,        -- SHA-256 hash for reference
    hash_sha512 TEXT,        -- SHA-512 hash for reference
    security_score INTEGER DEFAULT 0,
    breach_status TEXT DEFAULT 'UNKNOWN',
    resalt_count INTEGER DEFAULT 0,
    last_resalt TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Demo Users Table (For Demonstration)

```sql
CREATE TABLE demo_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    algorithm TEXT DEFAULT 'Multi-Hash',
    salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    -- ... similar structure
);
```

#### Resalt Log Table (Audit Trail)

```sql
CREATE TABLE resalt_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    old_salt TEXT,
    new_salt TEXT,
    resalted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 Data Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Flask     │────▶│   SQLite    │
│   (Browser) │◀────│   Backend   │◀────│   Database  │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      │ HTTP Requests     │ Python Logic      │ SQL Queries
      │ (JSON)            │ Hashing           │ CRUD Operations
      │                   │ Validation        │
      ▼                   ▼                   ▼
   User Actions      API Processing      Data Storage
   - Register        - Hash passwords    - users
   - View Dashboard  - Validate input    - demo_users
   - Run Audits      - Calculate scores  - resalt_log
```

---

## 5. API Endpoints Reference

### 5.1 User Management

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/register` | POST | Register new user | `{name, email, password}` | User object |
| `/api/users` | GET | Get all users | - | List of users |
| `/api/users/clear` | DELETE | Delete all users | - | Success message |
| `/api/demo-users` | GET | Get demo users | - | List of demo users |

### 5.2 Security Audits

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/api/audit/duplicate-passwords` | GET | Find duplicate password hashes | Groups of duplicates |
| `/api/audit/weak-passwords` | GET | Find users with score < 50 | List of weak users |
| `/api/audit/breached-passwords` | GET | Find breached passwords | List of breached users |
| `/api/audit/hash-distribution` | GET | Algorithm & score distribution | Statistics |

### 5.3 Hash Migration Operations

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/api/hash-migration/users` | GET | Get all users with hash info | User list with algorithm data |
| `/api/hash-migration/convert` | POST | Convert single user's hash | Updated user details |
| `/api/hash-migration/batch-convert` | POST | Batch convert multiple users | List of converted users |

### 5.4 Re-Salt Operations

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/api/resalt` | POST | Trigger manual resalt for all | Count of resalted |
| `/api/resalt/auto` | POST | Toggle auto-resalt | Status |
| `/api/resalt/status` | GET | Get auto-resalt status | Enabled/interval |
| `/api/resalt/user/<id>` | POST | Resalt single user | User details |
| `/api/resalt/all` | POST | Resalt all weak users | List of resalted |
| `/api/resalt/users` | GET | Get users needing resalt | User list |

### 5.4 Utility

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/stats` | GET | Dashboard statistics |
| `/api/demo/populate` | POST | Populate demo data |

---

## 6. Security Features & Audit Tools

### 6.1 Duplicate Password Detection

**Logic:**

```python
# SQL Query to find duplicates
SELECT password_hash, COUNT(*) as count, 
       GROUP_CONCAT(name || ' (' || email || ')') as users
FROM users
GROUP BY password_hash
HAVING count > 1
ORDER BY count DESC
```

**Mathematical Set Operation:**

```
Let H = {h₁, h₂, ..., hₙ} be the set of all password hashes
Duplicates D = {h ∈ H : |{i : hᵢ = h}| > 1}
```

**Why This Matters:**
- If two users have the same hash, they have the same password
- Compromising one account compromises all with same password
- Indicates poor password policies

### 6.2 Weak Password Detection

**Logic:**

```python
# Security score thresholds
WEAK_THRESHOLD = 50
SECURE_THRESHOLD = 70

# Filter weak users
SELECT * FROM users WHERE security_score < 50
```

**Security Score Calculation:**

```
Score = f(length, uppercase, lowercase, digits, symbols, entropy)

Example:
- "password"     → Score: 20 (common, no variety)
- "Pass123"      → Score: 45 (short, predictable)
- "MyP@ss2024!"  → Score: 75 (good variety)
- "Tr0ub4dor&3!" → Score: 95 (excellent)
```

### 6.3 Breach Detection

**Logic:**

```python
# Common breached passwords list (local)
common_passwords = ['123456', 'password', 'qwerty', 'abc123', ...]

# Check during registration
if password.lower() in common_passwords:
    breach_status = 'BREACHED'

# Additionally check Have I Been Pwned API
is_pwned, pwned_count = check_password_pwned(password)
if is_pwned:
    breach_status = 'BREACHED'
    print(f"Password found in {pwned_count:,} breaches")
```

**How It Works:**
1. Compare password against local breach database (fast, offline)
2. Query Have I Been Pwned API for real-time breach checking (850+ million passwords)
3. Use k-Anonymity model to protect privacy (only 5-char hash prefix sent)
4. Flag users with commonly breached passwords

### 6.4 Salt & Hash Management

The Salt & Hash Manager provides three powerful actions for upgrading password security:

**1. Add Salt** - Add random salt to existing unsalted hashes:
```python
# Add cryptographically secure salt
new_salt = secrets.token_hex(16)  # 32 hex characters
new_hash = hash_function(original_hash + new_salt)
```

**2. Change Salt Bit Length** - Modify salt size for stronger protection:
```
Available Salt Sizes:
├── 8 bytes  (64-bit)   - Basic security
├── 16 bytes (128-bit)  - Good security
├── 32 bytes (256-bit)  - Recommended
└── 64 bytes (512-bit)  - Maximum security
```

**3. Migrate Algorithm** - Upgrade to stronger hash algorithms:
```
Migration Paths:
MD5 → SHA-1 → SHA-256 → SHA-512 → bcrypt → Argon2id

Hash Strength Hierarchy:
┌─────────────┬────────────┬───────────────────────┐
│ Algorithm   │ Bit Length │ Security Level        │
├─────────────┼────────────┼───────────────────────┤
│ MD5         │ 128-bit    │ ❌ Broken             │
│ SHA-1       │ 160-bit    │ ⚠️ Deprecated         │
│ SHA-256     │ 256-bit    │ ✅ Secure             │
│ SHA-512     │ 512-bit    │ ✅ Very Strong        │
│ bcrypt      │ 184-bit    │ ✅✅ Password Hashing │
│ Argon2id    │ Variable   │ ✅✅✅ Maximum        │
└─────────────┴────────────┴───────────────────────┘
```

**Migration Logic:**
```python
def hash_with_custom_salt(input_hash, salt_length, target_algorithm):
    """Migrate hash to new algorithm with custom salt"""
    new_salt = secrets.token_hex(salt_length)
    combined = input_hash + new_salt
    
    if target_algorithm == 'sha256':
        new_hash = hashlib.sha256(combined.encode()).hexdigest()
    elif target_algorithm == 'sha512':
        new_hash = hashlib.sha512(combined.encode()).hexdigest()
    elif target_algorithm == 'bcrypt':
        new_hash = bcrypt.hashpw(combined.encode(), bcrypt.gensalt())
    elif target_algorithm == 'argon2id':
        new_hash = ph.hash(combined)
    
    return new_hash, new_salt
```

### 6.5 Re-Salt Management (Legacy)

**Purpose:**
Upgrade weak (unsalted or MD5) hashes to stronger salted hashes.

**Re-Salt Process:**

```
┌──────────────────────────────────────────────────────────────┐
│                    RE-SALT PROCESS                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   Original State:                                             │
│   ┌─────────────────────────────────────────────────────┐     │
│   │ password_hash = MD5("password")                     │     │
│   │              = "5f4dcc3b5aa765d61d8327deb882cf99"   │     │
│   │ salt = "" (empty)                                   │     │
│   │ algorithm = "MD5"                                   │     │
│   │ security_score = 20                                 │     │
│   └─────────────────────────────────────────────────────┘     │
│                          │                                    │
│                          ▼                                    │
│   ┌─────────────────────────────────────────────────────┐     │
│   │ Step 1: Generate new salt                           │     │
│   │ new_salt = secrets.token_hex(16)                    │     │
│   │         = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"        │     │
│   └─────────────────────────────────────────────────────┘     │
│                          │                                    │
│                          ▼                                    │
│   ┌─────────────────────────────────────────────────────┐     │
│   │ Step 2: Create new hash (preserving old MD5)        │     │
│   │ salted_input = old_hash + new_salt                  │     │
│   │ new_hash = SHA256(salted_input)                     │     │
│   │          = "8a7b6c5d4e3f2a1b..."                    │     │
│   └─────────────────────────────────────────────────────┘     │
│                          │                                    │
│                          ▼                                    │
│   After Re-Salt:                                              │
│   ┌─────────────────────────────────────────────────────┐     │
│   │ password_hash = "8a7b6c5d4e3f2a1b..." (new SHA256)  │     │
│   │ salt = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"           │     │
│   │ algorithm = "SHA256"                                │     │
│   │ security_score = 85                                 │     │
│   │ hash_md5 = "5f4dcc3b5aa765d61d8327deb882cf99"       │     │
│   │            (preserved for verification)             │     │
│   └─────────────────────────────────────────────────────┘     │
│                                                               │
│   ✅ User's password unchanged - only hash security upgraded  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Mathematical & Cryptographic Logic

### 7.1 Hash Function Properties

A secure hash function H(x) must satisfy:

| Property | Description | Mathematical Definition |
|----------|-------------|------------------------|
| **Deterministic** | Same input → same output | H(x) = H(x) always |
| **Fast Computation** | Quick to compute | O(n) complexity |
| **Pre-image Resistance** | Can't reverse hash | Given h, hard to find x where H(x) = h |
| **Collision Resistance** | Hard to find two inputs with same hash | Hard to find x₁ ≠ x₂ where H(x₁) = H(x₂) |
| **Avalanche Effect** | Small change → completely different hash | H(x) ≠ H(x + ε) for any small ε |

### 7.2 Password Strength Entropy

**Entropy Formula:**

```
E = L × log₂(N)
```

Where:
- E = entropy (bits)
- L = password length
- N = size of character set

**Example Calculations:**

```
Password: "abc" (3 lowercase letters)
N = 26 (lowercase only)
E = 3 × log₂(26) = 3 × 4.7 = 14.1 bits

Password: "Abc123!@" (8 mixed characters)
N = 26 + 26 + 10 + 32 = 94 (full ASCII)
E = 8 × log₂(94) = 8 × 6.55 = 52.4 bits
```

**Security Levels:**

| Entropy | Security Level | Time to Crack (at 10¹² guesses/sec) |
|---------|----------------|-------------------------------------|
| < 28 bits | Very Weak | < 1 second |
| 28-35 bits | Weak | Minutes |
| 36-59 bits | Reasonable | Days to Years |
| 60-127 bits | Strong | Millions of years |
| 128+ bits | Very Strong | Heat death of universe |

### 7.3 Argon2 Memory-Hard Function

**Why Memory-Hard?**
- GPU/ASIC attacks rely on parallel computation
- Memory is expensive to parallelize
- Forces attackers to use similar hardware as defenders

**Argon2 Parameters:**

```python
PasswordHasher(
    time_cost=2,        # t: iterations (higher = slower)
    memory_cost=65536,  # m: memory in KB (64MB)
    parallelism=1,      # p: threads
    hash_len=32,        # output length in bytes
    salt_len=16         # salt length in bytes
)
```

**Computational Cost:**

```
Cost ∝ t × m × p
```

### 7.4 Duplicate Detection Algorithm

**Algorithm:**

```
Input: Set of users U = {u₁, u₂, ..., uₙ}
Output: Groups of users with duplicate passwords

1. Create hash map M = {}
2. For each user uᵢ in U:
   a. h = password_hash(uᵢ)
   b. If h ∈ M:
      M[h].append(uᵢ)
   c. Else:
      M[h] = [uᵢ]
3. Return {group ∈ M : |group| > 1}
```

**Complexity:** O(n) where n = number of users

---

## 8. Frontend Components

### 8.1 Registration Page (index.html)

- User input form (name, email, password)
- Real-time password strength indicator
- Hash preview before submission
- API integration with backend

### 8.2 Admin Dashboard (dashboard.html)

- **Stats Cards**: Total users, secure/weak/breached counts
- **User Table**: All registered users with details
- **Audit Tools**: 
  - Find Duplicate Passwords
  - Scan Weak Passwords
  - Check Breached Passwords
- **Actions**: Export Data, Clear Storage

### 8.3 Multi-Hash Generator

The Multi-Hash Generator provides a unified interface for generating hashes with 5 algorithms:

**Supported Algorithms:**
- **MD5** - 128-bit hash (educational purposes)
- **SHA-1** - 160-bit hash (legacy support)
- **SHA-256** - 256-bit hash (recommended)
- **SHA-512** - 512-bit hash (high security)
- **bcrypt** - Password hashing with work factor

**Features:**
- Optional salt generation (8/16/32/64 bytes)
- Visual hash flow diagram
- Copy hash to clipboard
- Client-side processing with CryptoJS

### 8.4 Salt & Hash Manager

**Access:** Backend Dashboard → "Open Salt & Hash Manager" button

The Salt & Hash Manager is a comprehensive tool for upgrading password security with three integrated actions:

**Action 1: Add Salt**
- Adds cryptographically secure random salt to existing hashes
- Salt is generated using `secrets.token_hex()` for true randomness
- Prevents rainbow table attacks by making each hash unique

**Action 2: Change Salt Bit Length**
- Configure salt size based on security requirements:
  - 64-bit (8 bytes) - Basic security
  - 128-bit (16 bytes) - Good security  
  - 256-bit (32 bytes) - Recommended (default)
  - 512-bit (64 bytes) - Maximum security

**Action 3: Migrate Algorithm**
- Upgrade weak hashes to stronger algorithms:
  - SHA-1 (160-bit) - Deprecated but supported
  - SHA-256 (256-bit) - Recommended for most use cases
  - SHA-512 (512-bit) - High security applications
  - bcrypt - Adaptive password hashing
  - Argon2id - Maximum security (memory-hard)

**UI Features:**
- Statistics dashboard showing user distribution by algorithm
- Bulk user selection with "Select All MD5" quick action
- Real-time migration preview showing the conversion process
- Color-coded algorithm badges (red=weak, green=secure)

**API Endpoints:**
- `GET /api/hash-migration/users` - List all users with hash info
- `POST /api/hash-migration/convert` - Convert single user
- `POST /api/hash-migration/batch-convert` - Batch convert multiple users

### 8.5 Password Generator

Professional password generation with customizable rules:

- Character types (uppercase, lowercase, numbers, symbols)
- Adjustable length (8-128 characters)
- Entropy calculation
- Strength indicator
- Exclude similar characters option

### 8.6 Navigation Structure

```
MAIN NAVIGATION
├── Registration
└── Backend Dashboard

SECURITY TOOLS
├── Hash Tools (expandable)
│   ├── Multi-Hash Generator
│   ├── Hash Comparison
│   └── Entropy Analyzer
├── Breach Checker
└── Password Generator

BACKEND DASHBOARD ONLY
└── Salt & Hash Manager (accessed via dashboard button)
```

---

## 9. How to Run the Project

### Prerequisites

- Python 3.10 or higher
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Edge)

### Step-by-Step Setup

**1. Clone/Navigate to Project:**

```bash
cd d:\Computer-Security
```

**2. Create Virtual Environment (Optional but recommended):**

```bash
python -m venv .venv
.\.venv\Scripts\activate  # Windows
```

**3. Install Dependencies:**

```bash
cd backend
pip install -r requirements.txt
```

**4. Start Backend Server:**

```bash
python app.py
```

You should see:
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
```

**5. Open Frontend:**

- Open `index.html` in your browser, OR
- Navigate to `http://localhost:5000`

### Quick Test

1. Register a new user on the landing page
2. Go to Backend Dashboard
3. See your registered user in the table
4. Run "Find Duplicate Passwords" or "Scan Weak Passwords"

---

## 10. Project Structure

```
d:\Computer-Security\
│
├── index.html                      # Main landing/registration page
├── README.md                       # This documentation
│
├── backend/
│   ├── app.py                      # Flask server with all APIs
│   ├── dashboard.html              # Admin dashboard
│   ├── database.db                 # SQLite database
│   ├── requirements.txt            # Python dependencies
│   └── result-login.html           # Login result page
│
├── dashboard-features/
│   ├── password-generator/
│   │   ├── password-generator.html # Professional password generator
│   │   ├── password-generator.css  # Shared UI styles
│   │   └── password-generator.js
│   ├── breach-checker/
│   │   └── breach-checker.html     # Check passwords against HIBP
│   ├── duplicate-checker/
│   │   └── duplicate-checker.html  # Find duplicate passwords
│   ├── resalt-management/
│   │   └── resalt-management.html  # Salt & Hash Manager (3 Actions)
│   └── security-analytics/
│       └── security-analytics.html # Security dashboard
│
├── shared/
│   ├── css/
│   │   ├── style.css               # Main styles
│   │   ├── nav-styles.css          # Navigation styles
│   │   └── ux-enhancements.css     # UX improvements
│   └── js/
│       ├── api-client.js           # Backend API client
│       ├── script.js               # Main JS logic
│       ├── ux-helper.js            # UX utilities
│       └── live-demo-service.js    # Demo data service
│
└── features/
    └── hash-tools/
        ├── multi-hash-generator.html  # Multi-Hash Generator (5 algorithms)
        ├── hash-comparison.html       # Compare hash algorithms
        └── entropy-analyzer/          # Password entropy analysis
```

---

## 11. Security Best Practices

### What This Project Does Right ✅

1. **Server-side hashing** - Never hash passwords on frontend only
2. **Strong algorithms** - Argon2id, bcrypt for password storage
3. **Unique salts** - Each password has its own random salt
4. **No plain passwords** - Never stored or logged
5. **CORS enabled** - Controlled cross-origin access
6. **Input validation** - All inputs sanitized
7. **Audit capabilities** - Detect weak/duplicate/breached passwords

### Production Recommendations 📋

1. Use HTTPS in production
2. Implement rate limiting
3. Add CSRF protection
4. Use environment variables for secrets
5. Implement proper session management
6. Regular security audits
7. Log security events
8. Implement account lockout after failed attempts

---

## 12. UI/UX Features

### Animation Effects

The platform includes comprehensive CSS animations for enhanced user experience:

| Animation | Description | Usage |
|-----------|-------------|-------|
| `animate-fadeIn` | Smooth fade in effect | Page load elements |
| `animate-fadeInUp` | Fade in from bottom | Cards, forms |
| `animate-bounceIn` | Bouncy entrance | Icons, alerts |
| `animate-pulse` | Continuous pulsing | Active indicators |
| `animate-float` | Floating effect | Decorative icons |
| `animate-glow` | Glowing border | Focus states |
| `hover-lift` | Lift on hover | Interactive cards |
| `card-animate` | Card hover effect | Dashboard cards |
| `btn-animate` | Button shine effect | Action buttons |
| `ripple` | Material ripple effect | Click feedback |

### Responsive Design

- **Desktop**: Full sidebar navigation with expanded features
- **Tablet**: Collapsible sidebar with touch-friendly controls
- **Mobile**: Bottom navigation with hamburger menu

### Accessibility

- High contrast color scheme
- Keyboard navigation support
- ARIA labels on interactive elements
- Focus indicators on all controls

---

## 13. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Backend not starting | Check if port 5000 is in use: `netstat -an \| findstr 5000` |
| CORS errors | Ensure Flask-CORS is installed and enabled |
| Database locked | Close other connections to database.db |
| Argon2 not found | Install: `pip install argon2-cffi` |
| bcrypt errors | Install: `pip install bcrypt` |
| API timeout | Check network connection, HIBP API may be slow |

### Debug Mode

Enable debug logging in `app.py`:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

---

## 14. Additional Documentation

For detailed backend API documentation, see **[BACKEND.md](BACKEND.md)**

---

## Summary

This project demonstrates:

- **Cryptographic password hashing** with multiple algorithms (MD5, SHA-1, SHA-256, SHA-512, bcrypt, Argon2id)
- **Multi-Hash Generator** for comparing different hashing algorithms
- **Salt & Hash Manager** with 3 actions: Add Salt, Change Bit Length, Migrate Algorithm
- **Salt generation and management** for enhanced security (64/128/256/512 bit options)
- **Hash Migration** to upgrade weak hashes to stronger algorithms
- **Security auditing** to detect vulnerabilities
- **Full-stack architecture** with Flask backend and JS frontend
- **Real-time security analytics** for administrators
- **Modern UI/UX** with CSS animations and responsive design

The mathematical foundation ensures passwords are protected using industry-standard cryptographic functions, while the audit tools help administrators identify and remediate security issues.

---

## 15. Quick Start Guide

### 1. Clone and Setup

```bash
git clone <repository-url>
cd Computer-Security
```

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Start Backend Server

```bash
python app.py
```

### 4. Access the Platform

Open browser to: **http://localhost:5000**

### 5. Register a User

1. Fill in name, email, and password
2. Watch the real-time security score
3. Click "Register" to save
4. View data in Backend Dashboard

---

**Created by:** Security Operations Center Platform  
**Technologies:** Python Flask, SQLite, JavaScript, HTML/CSS, Argon2id, bcrypt, CryptoJS  
**Version:** 1.0.0  
**Last Updated:** January 2026  
**License:** MIT
