# 🔐 Security Operations Center (SOC) Platform

A comprehensive web-based security toolkit featuring hash analysis and encryption tools for cybersecurity professionals, students, and enthusiasts.

![Platform](https://img.shields.io/badge/Platform-Web-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active-success)

---

## 📋 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Tools Overview](#tools-overview)
- [How to Use](#how-to-use)
- [Security Features](#security-features)
- [Technical Details](#technical-details)
- [Browser Compatibility](#browser-compatibility)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### 🔢 Hash & Security Tools
- **8 Professional Tools** for password and hash analysis
- **Password Breach Checker** - Check 600M+ breached passwords (HIBP)
- **Hash Algorithm Comparison** - Compare MD5, SHA-1, SHA-256, SHA-512
- **Salt Generator** - Create cryptographic salts
- **File Hash Calculator** - Verify file integrity
- **Hash Type Identifier** - Auto-detect hash algorithms
- **Entropy Analyzer** - Measure password strength
- **Rotation Pattern Detector** - Find weak password patterns

### 🔒 Encryption Tools
- **AES-256** - Industry-standard symmetric encryption
- **Triple DES** - Legacy encryption support
- **RC4 Stream Cipher** - Educational purposes
- **Real-time Encryption/Decryption** - Instant results

---

## 🚀 Quick Start

### Option 1: Direct Open (Recommended)
1. Download or clone this repository
2. Open `index.html` in any modern browser
3. Start using the tools immediately - **No installation required!**

### Option 2: Local Server (Optional)
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Then open: http://localhost:8000
```

### Option 3: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"

---

## 🛠️ Tools Overview

### 1️⃣ Password Breach Checker 🔓

**What it does:** Checks if your password has been compromised in data breaches

**How to use:**
1. Navigate to **Hash Tools** → **Password Breach Checker**
2. Enter any password in the input field
3. Click **"Check Password Security"**
4. See instant results from 600M+ breached passwords

**Privacy Features:**
- ✅ Password hashed locally (SHA-1)
- ✅ Only 5 characters sent to API (k-Anonymity)
- ✅ Your password NEVER leaves your device
- ✅ Uses Have I Been Pwned API

**Example:**
```
Input: password123
Result: ⚠️ COMPROMISED - Seen 37,000+ times in breaches!
```

---

### 2️⃣ Hash Algorithm Comparison 📊

**What it does:** Compare different hash algorithms side-by-side

**How to use:**
1. Select **Hash Tools** → **Algorithm Comparison**
2. Enter text or password to hash
3. (Optional) Add a salt for extra security
4. Select algorithms to compare (MD5, SHA-1, SHA-256, SHA-512)
5. Click **"Generate Hashes"**

**Use cases:**
- Compare hash lengths and security
- Understand salt benefits
- Educational demonstrations
- Security assessments

**Example:**
```
Input: Hello123
Salt: random_salt_abc

Outputs:
MD5     → 32 characters  (❌ Insecure)
SHA-1   → 40 characters  (⚠️ Deprecated)
SHA-256 → 64 characters  (✅ Good)
SHA-512 → 128 characters (✅ Strong)
```

---

### 3️⃣ Salt Generator & Hasher 🧂

**What it does:** Generate cryptographic salts and create salted password hashes

**How to use:**
1. Navigate to **Salt Generator & Hasher**
2. Click **"Generate Random Salt"** (recommended)
   - OR manually enter a custom salt
3. Enter a password
4. Select hash algorithm (MD5, SHA-1, SHA-256, SHA-512)
5. Choose salt position (Prepend/Append)
6. Click **"Generate Salted Hash"**

**Why use salts?**
- Prevents rainbow table attacks
- Makes identical passwords produce different hashes
- Industry best practice for password storage

**Example:**
```
Password: myPassword123
Salt: 7a8b9c0d1e2f3g4h
Algorithm: SHA-256
Position: Prepend

Combined: 7a8b9c0d1e2f3g4hmyPassword123
Hash: e4d909c290d0fb1ca068ffaddf22cbd0...
```

---

### 4️⃣ File Hash Calculator 📁

**What it does:** Calculate cryptographic hashes of files for integrity verification

**How to use:**
1. Select **File Hash Calculator**
2. Click **"Choose File"** or drag & drop any file
3. Select hash algorithms to calculate
4. View all hashes instantly
5. (Optional) Paste expected hash to verify file integrity

**Use cases:**
- Verify downloaded files aren't tampered
- Check software integrity
- Detect file modifications
- Forensic analysis

**Example:**
```
File: ubuntu-20.04.iso
Size: 2.7 GB

MD5:     ca7a6f5c4e9dab1234567890abcdef12
SHA-256: 4e9dab1234567890abcdef12ca7a6f5c...
SHA-512: 1234567890abcdef12ca7a6f5c4e9dab...

Verification: ✅ Hash matches official Ubuntu checksum
```

---

### 5️⃣ Hash Type Identifier 🔍

**What it does:** Automatically detect hash algorithm from hash string

**How to use:**
1. Navigate to **Hash Type Identifier**
2. Paste any hash string
3. Click **"Identify Hash Type"**
4. See detected algorithm and security assessment

**Supported formats:**
- MD5 (32 characters)
- SHA-1 (40 characters)
- SHA-256 (64 characters)
- SHA-512 (128 characters)
- BCrypt (60 characters, starts with $2)
- Argon2 (starts with $argon2)

**Example:**
```
Input: 5f4dcc3b5aa765d61d8327deb882cf99
Result: MD5 (128-bit) - Fast, vulnerable to collisions ❌
```

---

### 6️⃣ Password Entropy Analyzer 📈

**What it does:** Measure password strength using entropy calculation

**How to use:**
1. Select **Password Entropy Analyzer**
2. Enter any password
3. Click **"Calculate Entropy"**
4. View detailed strength analysis

**Metrics shown:**
- Password length
- Character set size
- Entropy bits
- Strength rating (Very Weak → Very Strong)
- Visual strength meter

**Example:**
```
Password: P@ssw0rd!2024

Length: 13 characters
Character Set: 72 (Mixed case + numbers + symbols)
Entropy: 79.8 bits
Strength: STRONG ✅
```

---

### 7️⃣ Password Rotation Detector 🔄

**What it does:** Find predictable patterns in password sequences

**How to use:**
1. Navigate to **Password Rotation Detector**
2. Enter password sequence (one per line)
3. Click **"Detect Patterns"**
4. See risk assessment and recommendations

**Detects:**
- Sequential numbers (Password1, Password2, Password3)
- Month/season patterns (Spring2023, Summer2023)
- Simple increments
- Predictable variations

**Example:**
```
Input:
CompanyPass2022
CompanyPass2023
CompanyPass2024

Result: ⚠️ HIGH RISK
- Sequential year pattern detected
- Highly predictable
- Recommendation: Use unique passwords
```

---

### 8️⃣ Hash Verification ✅

**What it does:** Verify if a password matches a known hash

**How to use:**
1. Select **Hash Verification**
2. Enter the password to test
3. (Optional) Add salt if used
4. Paste the target hash
5. Select hash algorithm
6. Click **"Verify Hash"**

**Use cases:**
- Password recovery testing
- Hash validation
- Database verification
- Authentication testing

**Example:**
```
Password: admin123
Salt: abc123
Target Hash: 8e07e1f2d3c4b5a6...
Algorithm: SHA-256

Result: ✅ PASSWORD MATCHES!
```

---

## 🔒 Encryption Tools

### AES-256 Encryption

**What it does:** Encrypt/decrypt text using industry-standard AES-256

**How to use:**

#### Encrypting:
1. Navigate to **Encryption** page
2. Select **AES-256** algorithm
3. Enter a strong password
4. Type or paste text to encrypt
5. Click **"Encrypt"**
6. Copy encrypted output

#### Decrypting:
1. Select **AES-256** algorithm
2. Enter the SAME password used for encryption
3. Paste encrypted text
4. Click **"Decrypt"**
5. View original text

**Security Tips:**
- ✅ Use strong, unique passwords
- ✅ Store passwords securely
- ✅ Never share encryption keys
- ⚠️ Losing password = data lost forever

**Example:**
```
Plain Text: "Hello World"
Password: MyStrongP@ss2024!
Algorithm: AES-256

Encrypted: U2FsdGVkX1+2K7J3... (base64)
Decrypted: "Hello World"
```

---

## 🛡️ Security Features

### Privacy-First Design
- **No Server Required** - All processing happens in your browser
- **Offline Capable** - Works without internet (except breach checker)
- **No Data Collection** - Nothing sent to external servers
- **Open Source** - Inspect the code yourself

### k-Anonymity Model (Breach Checker)
```
Your Password: "example123"
           ↓
Local SHA-1 Hash: 3c9909afec25354d551dae21590bb26e38d53f2173
           ↓
Send to API: 3c990 (first 5 chars only)
           ↓
API Returns: ~500 hash suffixes
           ↓
Local Match: Check if your hash is in the list
```

### Cryptographic Standards
- SHA-1, SHA-256, SHA-512 (Web Crypto API)
- AES-256, Triple DES (CryptoJS library)
- Cryptographically secure random salts

---

## 🔧 Technical Details

### Architecture
```
Computer-Security/
├── index.html              # Landing page & registration
├── backend/
│   └── dashboard.html      # Backend admin panel
├── features/
│   ├── encryption/         # Encryption tools
│   │   ├── encryption.html
│   │   ├── encryption.css
│   │   └── encryption.js
│   └── hash-tools/         # Hash analysis tools
│       ├── hash-tools.html
│       ├── hash-tools.css
│       └── hash-tools.js
└── shared/
    ├── css/
    │   ├── style.css       # Global styles
    │   └── nav-styles.css  # Navigation styles
    └── js/
        ├── script.js       # Global scripts
        └── api-client.js   # API utilities
```

### Dependencies
- **Bootstrap 5.3** - UI framework
- **Font Awesome 6.4** - Icons
- **CryptoJS 4.1** - Encryption library
- **Web Crypto API** - Native browser cryptography

### Browser Requirements
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Internet Explorer NOT supported

---

## 💡 Best Practices

### Password Security
1. **Length Matters** - Minimum 12 characters
2. **Mix Characters** - Upper, lower, numbers, symbols
3. **Unique Passwords** - Never reuse across sites
4. **Check Breaches** - Regularly verify with our tool
5. **Use Password Manager** - Don't memorize complex passwords

### Hash Usage
1. **Always Salt** - Never store plain hashes
2. **Use SHA-256+** - Avoid MD5 and SHA-1
3. **Verify Files** - Check downloads against official hashes
4. **Regular Audits** - Periodically check password strength

### Encryption Tips
1. **Strong Keys** - Use 16+ character passwords
2. **Secure Storage** - Store keys separately from data
3. **Backup Keys** - Keep secure backup of encryption passwords
4. **Test Decryption** - Verify you can decrypt before deleting originals

---

## 🎓 Educational Use

Perfect for:
- **Cybersecurity Students** - Learn hash algorithms
- **IT Professionals** - Quick security checks
- **Developers** - Understand encryption concepts
- **Security Auditors** - Test password policies
- **Teachers** - Demonstrate security principles

---

## 📱 Mobile Support

All tools work on mobile devices:
- ✅ Responsive design
- ✅ Touch-friendly interface
- ✅ Hamburger menu on small screens
- ✅ All features fully functional

---

## 🐛 Troubleshooting

### Password Breach Checker Not Working
- **Problem:** "Could not connect to breach database"
- **Solution:** Check internet connection, HIBP API requires network access

### Encryption/Decryption Fails
- **Problem:** Decryption returns gibberish
- **Solution:** Verify you're using the exact same password and algorithm

### File Hash Calculator Slow
- **Problem:** Large files take time to hash
- **Solution:** Normal behavior, hashing 1GB+ files takes several seconds

### Browser Compatibility Issues
- **Problem:** Features not working
- **Solution:** Update to latest browser version, disable ad blockers

---

## 📄 License

MIT License - Free for personal and commercial use

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional hash algorithms (BLAKE2, BLAKE3)
- More encryption methods
- UI/UX enhancements
- Security audits
- Documentation improvements

---

## ⚠️ Disclaimer

This tool is for **educational and professional purposes**. While it uses industry-standard cryptographic libraries:
- Not intended to replace professional security tools
- Always follow your organization's security policies
- Test thoroughly before production use
- Keep encryption passwords secure

---

## 🌟 Credits

- **Have I Been Pwned** - Troy Hunt's breach database
- **CryptoJS** - Encryption library
- **Bootstrap** - UI framework
- **Font Awesome** - Icon library

---

**Made with ❤️ for the cybersecurity community**

*Last Updated: January 2025*
