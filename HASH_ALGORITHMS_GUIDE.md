# 🔐 Hash Algorithms Guide

## Overview

This Security Operations Center platform uses **industry-standard password hashing algorithms** for secure password storage, and **cryptographic hash functions** for general-purpose hashing.

---

## 🔑 Password Hashing Algorithms (For Password Storage)

### **Used in Registration & Authentication**

These algorithms are specifically designed for password storage and include built-in salt generation and key derivation functions:

### 1. **Argon2** (Recommended)
- **Type**: Argon2id (hybrid mode)
- **Status**: Winner of Password Hashing Competition 2015
- **Security**: ⭐⭐⭐⭐⭐ (Highest)
- **Use Case**: Best for password storage
- **Features**:
  - Memory-hard algorithm (resistant to GPU/ASIC attacks)
  - Configurable time and memory costs
  - Built-in salt generation
  - Side-channel attack resistant

**Configuration:**
```python
time_cost=2
memory_cost=65536 (64MB)
parallelism=1
hash_len=32
salt_len=16
```

**Example Hash:**
```
$argon2id$v=19$m=65536,t=2,p=1$randomsalthere$hashedoutputhere
```

---

### 2. **bcrypt**
- **Type**: Adaptive hash function based on Blowfish cipher
- **Status**: Industry standard since 1999
- **Security**: ⭐⭐⭐⭐ (Very Strong)
- **Use Case**: Proven in production systems
- **Features**:
  - Adaptive - can be made slower as computers get faster
  - Built-in salt generation (22 characters)
  - Work factor: 12 rounds (default)
  - Widely supported and battle-tested

**Configuration:**
```python
rounds=12  # 2^12 = 4096 iterations
```

**Example Hash:**
```
$2b$12$randomsalthere22chars$hashedoutputhere31chars
```

---

## 📊 Cryptographic Hash Functions (For General Hashing)

### **Used in Hash Tools & File Verification**

These are one-way hash functions used for data integrity, file verification, and educational purposes. **NOT recommended for password storage!**

### 1. **MD5**
- **Output**: 128-bit (32 hex characters)
- **Status**: ❌ **Broken** - Do not use for security
- **Speed**: Very fast
- **Use Cases**: 
  - Legacy system compatibility
  - Non-security checksums
  - Educational demonstrations
- **Vulnerabilities**: Collision attacks proven

**Example:**
```
Input: "hello"
MD5: 5d41402abc4b2a76b9719d911017c592
```

---

### 2. **SHA-1**
- **Output**: 160-bit (40 hex characters)
- **Status**: ⚠️ **Deprecated** - Avoid for security
- **Speed**: Fast
- **Use Cases**: 
  - Git commits (historical)
  - Legacy applications
  - Educational purposes
- **Vulnerabilities**: Collision attacks demonstrated (2017)

**Example:**
```
Input: "hello"
SHA-1: aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d
```

---

### 3. **SHA-256** (SHA-2 family)
- **Output**: 256-bit (64 hex characters)
- **Status**: ✅ **Secure** for general hashing
- **Speed**: Fast
- **Use Cases**: 
  - File integrity verification
  - Digital signatures
  - Blockchain (Bitcoin)
  - HMAC-based authentication
- **Security**: Strong, no practical attacks

**Example:**
```
Input: "hello"
SHA-256: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
```

---

### 4. **SHA-512** (SHA-2 family)
- **Output**: 512-bit (128 hex characters)
- **Status**: ✅ **Secure** for general hashing
- **Speed**: Fast on 64-bit systems
- **Use Cases**: 
  - High-security file verification
  - Digital signatures
  - Long-term data integrity
- **Security**: Very strong, future-proof

**Example:**
```
Input: "hello"
SHA-512: 9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043
```

---

## 🎯 Which Algorithm to Use?

### **For Password Storage:**

| Scenario | Algorithm | Why? |
|----------|-----------|------|
| New projects | **Argon2** | Most secure, memory-hard, modern |
| Production systems | **bcrypt** | Battle-tested, widely supported |
| Maximum security | **Argon2** | Winner of PHC, best resistance |
| Legacy compatibility | **bcrypt** | 25+ years proven track record |

❌ **NEVER use MD5, SHA-1, SHA-256, or SHA-512 for password storage!**

---

### **For General Hashing:**

| Use Case | Algorithm | Why? |
|----------|-----------|------|
| File verification | **SHA-256** | Standard, fast, secure |
| Long-term integrity | **SHA-512** | Future-proof, very strong |
| Legacy systems | **MD5** | Only if required for compatibility |
| Git/SVN | **SHA-1** | Historical reasons only |
| Checksums | **SHA-256** | Balance of speed and security |

---

## 🔬 Technical Comparison

### **Password Hashing Algorithms**

| Feature | bcrypt | Argon2 |
|---------|--------|--------|
| Type | Key derivation | Key derivation |
| Memory-hard | No | Yes ✅ |
| GPU-resistant | Moderate | Strong ✅ |
| Configurable cost | Rounds only | Time, Memory, Parallelism ✅ |
| Salt | Built-in (22 chars) | Built-in (16 bytes) |
| Output length | 60 characters | Configurable (32 bytes default) |
| Speed | Slow (intentional) | Configurable |
| Best for | Production use | Maximum security |

---

### **Cryptographic Hash Functions**

| Algorithm | Output Size | Speed | Security | Use Case |
|-----------|-------------|-------|----------|----------|
| MD5 | 128-bit | Fastest | ❌ Broken | Legacy only |
| SHA-1 | 160-bit | Fast | ⚠️ Weak | Deprecating |
| SHA-256 | 256-bit | Fast | ✅ Strong | Current standard |
| SHA-512 | 512-bit | Fast | ✅ Very strong | High security |

---

## 💡 Best Practices

### **Password Storage (bcrypt/Argon2):**

✅ **DO:**
- Use Argon2 for new projects
- Use bcrypt for proven reliability
- Let the algorithm generate salts
- Configure appropriate work factors
- Update work factors as hardware improves

❌ **DON'T:**
- Use MD5, SHA-1, SHA-256, or SHA-512 alone
- Implement your own hashing algorithm
- Store passwords in plaintext
- Use static or predictable salts
- Lower security settings for "performance"

---

### **General Hashing (MD5/SHA):**

✅ **DO:**
- Use SHA-256 for file integrity
- Use SHA-512 for long-term security
- Verify checksums from trusted sources
- Use for non-password data only

❌ **DON'T:**
- Use MD5 or SHA-1 for new security applications
- Use these for password storage
- Trust MD5 hashes for security-critical files

---

## 🛠️ Implementation in This Project

### **Registration Flow:**

```javascript
// Frontend (index.html)
1. User selects algorithm: "Argon2" or "bcrypt"
2. User enters password
3. System generates reference hashes (MD5, SHA-1, SHA-256, SHA-512)
4. Sends to backend with selected algorithm
```

```python
# Backend (app.py)
1. Receives algorithm choice
2. Hash password with selected algorithm:
   - bcrypt: Uses bcrypt.hashpw() with 12 rounds
   - Argon2: Uses PasswordHasher() with optimal settings
3. Store algorithm name, hash, and empty salt (algorithms handle internally)
4. Store reference hashes for educational purposes
```

---

### **Database Schema:**

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    algorithm TEXT,              -- "bcrypt" or "Argon2"
    salt TEXT,                   -- Empty (algorithms handle internally)
    password_hash TEXT,          -- Actual secure hash
    hash_md5 TEXT,               -- Reference only (educational)
    hash_sha1 TEXT,              -- Reference only (educational)
    hash_sha256 TEXT,            -- Reference only (educational)
    hash_sha512 TEXT,            -- Reference only (educational)
    security_score INTEGER,
    breach_status TEXT,
    created_at TIMESTAMP
)
```

---

## 🔍 Hash Tool Features

This platform includes tools for:

1. **Password Breach Checker** - Check against 600M+ breached passwords (uses SHA-1 for k-anonymity)
2. **Hash Algorithm Comparison** - Compare MD5, SHA-1, SHA-256, SHA-512 side-by-side
3. **Salt Generator** - Generate cryptographic salts for educational purposes
4. **File Hash Calculator** - Calculate MD5, SHA-1, SHA-256, SHA-512 for files
5. **Hash Type Identifier** - Identify hash algorithm from hash string
6. **Hash Verification** - Verify passwords against known hashes

**Note:** These tools use MD5/SHA for **educational purposes** and **file verification**, NOT password storage.

---

## 📚 References

### **Standards:**
- **Argon2**: RFC 9106 (IETF Standard)
- **bcrypt**: OpenBSD bcrypt
- **SHA-2**: FIPS 180-4 (NIST)
- **MD5**: RFC 1321 (informational only, deprecated)

### **Security Guidelines:**
- OWASP Password Storage Cheat Sheet
- NIST Digital Identity Guidelines (SP 800-63B)
- Password Hashing Competition (PHC)

---

## ⚠️ Security Notice

**Password Hashing (ALWAYS use for passwords):**
- ✅ bcrypt
- ✅ Argon2
- ✅ scrypt (not implemented in this project)
- ✅ PBKDF2 (not implemented in this project)

**General Hashing (NEVER use for passwords):**
- ❌ MD5
- ❌ SHA-1
- ❌ SHA-256 (alone, without key derivation)
- ❌ SHA-512 (alone, without key derivation)

---

**Remember:** The difference between password hashing and general hashing is critical. Use the right tool for the right job!

*Last Updated: January 2026*
