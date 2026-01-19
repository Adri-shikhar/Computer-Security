# 🔒 Authentication Security Lab - Flask Backend

## Overview
Professional Python/Flask backend demonstrating the evolution from weak (MD5) to industry-standard (Argon2id) password security with real-world features.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Initialize Database
```bash
python setup.py
```

### 3. Start Server
```bash
python app.py
```

Server runs at: `http://localhost:5000`

---

## 📁 Project Structure

```
Computer Security/
├── app.py                  # Flask application & API routes
├── models.py               # SQLAlchemy database models
├── setup.py                # Database initialization script
├── attack_toolkit.py       # Hash export for Hashcat testing
├── requirements.txt        # Python dependencies
├── auth_security_lab.db    # SQLite database (auto-created)
└── Frontend files          # HTML/CSS/JS (existing)
```

---

## 🎯 Features Implementation

### Part 1: Multi-Stage Architecture

**Global Configuration:**
```python
SECURITY_STAGE = 'modern'  # or 'broken'
```

**Stage 1 (Broken):** MD5 hashing with no salt
- Algorithm: `hashlib.md5(password)`
- Salt: `NONE`
- Security: ❌ CRITICAL VULNERABILITY
- Crack Time: Seconds

**Stage 2 (Modern):** Argon2id with professional settings
- Algorithm: `argon2-cffi`
- Parameters:
  - `time_cost=3` (iterations)
  - `memory_cost=65536` (64 MB RAM)
  - `parallelism=2` (threads)
- Salt: Automatic unique random salt per user
- Security: ✅ INDUSTRY STANDARD
- Crack Time: 100+ years

---

### Part 2: Real-Life Problem Solving

#### ✅ Unique Salting
Every Argon2 user gets a cryptographically secure random salt:
```python
ph = PasswordHasher(salt_len=16)  # 16-byte random salt
hash_value = ph.hash(password)     # Salt embedded automatically
```

#### ✅ Memory-Hard Parameters
```python
ph = PasswordHasher(
    time_cost=3,        # CPU cost
    memory_cost=65536,  # 64 MB memory (resists GPU attacks)
    parallelism=2,      # Thread count
    hash_len=32,        # 256-bit output
    salt_len=16         # 128-bit salt
)
```

**Why this matters:**
- GPU attacks need 64 MB per hash attempt
- RTX 4090: 24 GB VRAM ÷ 64 MB = only ~375 parallel attempts
- Compare to MD5: Millions of parallel attempts

#### ✅ Transparent Migration
Automatic upgrade from MD5 → Argon2 on login:
```python
if user.algorithm == 'md5' and password_is_valid:
    # Re-hash with Argon2
    new_hash = generate_argon2_hash(password)
    user.password_hash = new_hash
    user.algorithm = 'argon2'
    user.upgraded = True
    db.session.commit()
```

**User Experience:**
- No password reset required
- Seamless security upgrade
- User sees: "Your security has been upgraded"

#### ✅ Rate Limiting
Protection against brute force attacks:
```python
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION = 15 minutes

# Track failed attempts
if failed_attempts >= 5:
    return "Account locked for 15 minutes"
```

**Database Tracking:**
- `LoginAttempt` model records every attempt
- IP address logging
- Timestamp indexing for fast queries

---

### Part 3: Attack Support (Hashcat Export)

**Export Script:**
```bash
python attack_toolkit.py
```

**Output Files:**
- `md5_nosalt.txt` - MD5 hashes without salt
- `md5_salted.txt` - MD5 hashes with salt
- `argon2_hashes.txt` - Argon2id hashes

**Hashcat Commands:**

**MD5 (No Salt):**
```bash
# Dictionary attack
hashcat -m 0 md5_nosalt.txt rockyou.txt

# Brute force (8 chars)
hashcat -m 0 md5_nosalt.txt -a 3 ?a?a?a?a?a?a?a?a

# With rules
hashcat -m 0 md5_nosalt.txt wordlist.txt -r rules/best64.rule
```

**MD5 (Salted):**
```bash
hashcat -m 20 md5_salted.txt rockyou.txt
```

**Argon2id:**
```bash
hashcat -m 19100 argon2_hashes.txt rockyou.txt

# WARNING: Extremely slow!
# Expected speed: 1-10 H/s (vs 20 billion H/s for MD5)
```

---

### Part 4: Performance Analysis

**Benchmark Endpoint:**
```http
GET /api/benchmark
```

**Response:**
```json
{
  "benchmark": {
    "md5_ms": 0.023,
    "argon2_ms": 187.45,
    "slowdown_factor": 8152
  },
  "analysis": {
    "md5_analysis": "MD5 is extremely fast (0.023ms) but insecure",
    "argon2_analysis": "Argon2 is 8152x slower (187.45ms) but highly secure"
  }
}
```

**Security vs Performance Trade-off:**
- MD5: 0.02ms per hash → Attacker can try billions/second
- Argon2: 180ms per hash → Attacker limited to ~5/second
- **Conclusion:** 180ms login delay is acceptable for 8000x security improvement

---

## 🔌 API Endpoints

### Authentication

**Register User**
```http
POST /api/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "SecureP@ss123!",
  "algorithm": "argon2"
}
```

**Login (with auto-migration)**
```http
POST /api/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "SecureP@ss123!"
}
```

### Data Management

**Get All Users**
```http
GET /api/users
```

**Get Statistics**
```http
GET /api/stats
```

**Clear All Data**
```http
POST /api/clear-all
```

### Security Testing

**Export for Hashcat**
```http
GET /api/export/hashcat
```

**Benchmark Performance**
```http
GET /api/benchmark
```

**Get Configuration**
```http
GET /api/config
```

**Switch Security Stage**
```http
POST /api/config/stage
Content-Type: application/json

{
  "stage": "broken"  // or "modern"
}
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(512) NOT NULL,
    algorithm VARCHAR(20) NOT NULL,
    salt VARCHAR(512),
    created_at DATETIME,
    last_login DATETIME,
    upgraded BOOLEAN
);
```

### Login Attempts Table
```sql
CREATE TABLE login_attempts (
    id INTEGER PRIMARY KEY,
    username VARCHAR(80) NOT NULL,
    success BOOLEAN NOT NULL,
    ip_address VARCHAR(45),
    timestamp DATETIME
);
```

---

## 🎓 Educational Use Cases

### For Students
1. Register users with MD5 and Argon2
2. Export hashes and try cracking with Hashcat
3. Observe the massive speed difference
4. Test transparent migration by logging in

### For Instructors
1. Switch between `broken` and `modern` stages
2. Demonstrate real-world attack scenarios
3. Show performance benchmarks
4. Explain rate limiting importance

### For Researchers
1. Tune Argon2 parameters and benchmark
2. Test different attack strategies
3. Analyze login attempt patterns
4. Export data for security testing

---

## 🔐 Security Best Practices Demonstrated

✅ **Unique Salts** - Prevents rainbow table attacks
✅ **Memory-Hard Hashing** - Resists GPU acceleration
✅ **Transparent Migration** - Upgrade without disruption
✅ **Rate Limiting** - Prevents brute force attacks
✅ **Parameterized Queries** - Prevents SQL injection
✅ **HTTPS Ready** - Use with reverse proxy in production
✅ **Input Validation** - Sanitizes all user input
✅ **Secure Randomness** - Uses `secrets` module

---

## ⚠️ Important Notes

**This is an EDUCATIONAL platform:**
- Not for production use without additional hardening
- Demonstrates security concepts
- Use in controlled environments only
- Never use MD5 in real applications

**For Production:**
- Add HTTPS/TLS
- Implement CSRF protection
- Add proper session management
- Use environment variables for secrets
- Implement audit logging
- Add input validation middleware
- Set up proper CORS policies
- Use production WSGI server (Gunicorn)

---

## 📊 Attack Comparison

| Feature | MD5 (No Salt) | MD5 (Salted) | Argon2id |
|---------|---------------|--------------|----------|
| **Speed** | 0.02ms | 0.02ms | 180ms |
| **GPU Hashrate** | 200 GH/s | 200 GH/s | 5 H/s |
| **8-char crack time** | 30 seconds | 30 seconds | 100+ years |
| **Rainbow tables** | ✅ Vulnerable | ❌ Protected | ❌ Protected |
| **GPU acceleration** | ✅ Very effective | ✅ Very effective | ❌ Ineffective |
| **Memory required** | Minimal | Minimal | 64 MB per attempt |
| **Security rating** | 🔴 Critical | 🔴 Critical | 🟢 Secure |

---

## 🚀 Next Steps

1. **Run the setup:**
   ```bash
   python setup.py
   python app.py
   ```

2. **Test migration:**
   - Login with `diana_migrate / test1234`
   - Watch it upgrade from MD5 to Argon2

3. **Export and crack:**
   ```bash
   python attack_toolkit.py
   hashcat -m 0 md5_nosalt.txt wordlist.txt
   ```

4. **Benchmark performance:**
   ```bash
   curl http://localhost:5000/api/benchmark
   ```

---

**Built for cybersecurity education. Handle with responsibility.**
