# 🔐 Security Operations Center (SOC) Platform

A comprehensive web-based security toolkit featuring hash analysis, encryption tools, and **advanced password re-salting capabilities** for cybersecurity professionals, students, and enthusiasts.

![Platform](https://img.shields.io/badge/Platform-Web-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Python-3.12-blue)
![Flask](https://img.shields.io/badge/Flask-2.3+-green)

---

## 📋 Table of Contents

- [Features](#features)
- [How to Run the Backend](#how-to-run-the-backend)
- [Quick Start](#quick-start)
- [Hash Algorithms](#hash-algorithms)
- [NEW: Password Re-Salt Management](#password-re-salt-management)
- [Tools Overview](#tools-overview)
- [Backend Dashboard](#backend-dashboard)
- [Security Features](#security-features)
- [Technical Details](#technical-details)
- [Viva Preparation](#viva-preparation)
- [Browser Compatibility](#browser-compatibility)

---

## 🔐 Hash Algorithms

This platform uses **MD5 hashing** for initial password storage and provides re-salting capabilities:

### **For Password Storage (Registration):**
- **MD5** - Fast hashing algorithm (automatic, for demonstration)
- **Upgradable via Re-salt** - Can upgrade to SHA-256 + 32-char salt

### **For General Hashing (Tools & File Verification):**
- MD5, SHA-1, SHA-256, SHA-512 (Available in hash tools)

See [VIVA_PREPARATION_GUIDE.md](VIVA_PREPARATION_GUIDE.md) for technical details.

---

## 🚀 How to Run the Backend

### **Step 1: Navigate to Backend Directory**
```bash
cd d:\Computer-Security\backend
```

### **Step 2: Activate Virtual Environment & Start Server**
```bash
..\\.venv\Scripts\python.exe app.py
```

### **Step 3: Access the Application**
- **Main Page (Registration):** http://127.0.0.1:5000
- **Admin Dashboard:** http://127.0.0.1:5000/dashboard

### **Quick Terminal Command (One-Line)**
```powershell
cd d:\Computer-Security\backend; ..\\.venv\Scripts\python.exe app.py
```

### **Server Status**
When running successfully, you'll see:
```
🔐 Security Operations Center - Flask Backend
==================================================
✅ Database initialized successfully!
🚀 Starting server on http://localhost:5000
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

### **Stop the Server**
Press `Ctrl+C` in the terminal

---

## ✨ Features

### 🎯 Core Platform Features
- **User Registration** - Automatic MD5 password hashing
- **Backend Admin Dashboard** - Monitor all registered users
- **Security Audit Tools** - 4 professional security analysis tools
- **Password Re-Salt Management** ⭐ **NEW** - Upgrade weak MD5 to strong SHA-256 + salt
- **8 Hash Analysis Tools** - Professional password and hash tools
- **Encryption Suite** - AES-256, Triple DES, RC4

### 🔒 Security Audit Features (Backend Dashboard)
1. **Find Duplicate Passwords** - Identify users with identical password hashes
2. **Scan Weak Passwords** - Detect passwords with security score < 50
3. **Check Breached Passwords** - Query 600M+ breached passwords (HIBP)
4. **Analyze Hash Distribution** - View algorithm usage and security metrics

### ⚡ Password Re-Salt Management ⭐ **NEW FEATURE**
- **Individual Re-salt** - Upgrade single user from MD5 → SHA-256 + salt
- **Bulk Re-salt** - Upgrade all weak passwords with one click
- **Automatic Salt Generation** - 32-character cryptographic salts
- **Password Preservation** - Original passwords still work after re-salting
- **Security Score Improvement** - Boost scores from 35 → 85

#### How Re-Salt Works (Technical):
1. **Original Registration:** Password "test123" → MD5 hash stored
2. **Re-salt Process:** MD5 hash + new salt → SHA-256 hash
3. **Original MD5 preserved** in `hash_md5` column for verification
4. **Login after re-salt:** Password → MD5 → MD5+salt → SHA-256 → compare

**Result:** Users keep their passwords, but hash security improves dramatically!

---

## 🚀 Quick Start

### Option 1: Run Backend Server (Recommended)

#### Prerequisites
- Python 3.12+
- pip (Python package manager)

#### Installation Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd Computer-Security

# 2. Create virtual environment
python -m venv .venv

# 3. Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# 4. Install dependencies
cd backend
pip install -r requirements.txt

# 5. Run the Flask server
python app.py
```

#### Access the Application

```
🌐 Frontend (User Registration):
http://localhost:5000/

📊 Backend Dashboard (Admin Panel):
http://localhost:5000/dashboard

✅ Health Check:
http://localhost:5000/api/health
```

### Option 2: Frontend Only (No Backend Features)

1. Open `index.html` in any modern browser
2. Hash tools and encryption features work offline
3. **Note:** Registration and dashboard require backend server (Option 1)

---

## 🔄 Password Re-Salt Management ⭐ NEW

### What is Password Re-Salting?

Password re-salting upgrades weak password hashes to strong, salted hashes without requiring users to manually reset passwords.

### Why is it Important?

Legacy systems often use:
- ❌ MD5 (vulnerable to rainbow tables)
- ❌ No salt (same password = same hash)  
- ❌ Short salts (< 16 chars)
- ❌ Low security scores

### The Re-Salt Process

```
BEFORE:                          AFTER RE-SALT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User: John Doe                   User: John Doe
Algorithm: MD5                   Algorithm: SHA-256
Salt: (none)                     Salt: a7f3d9...b8c (32 chars)
Hash: 5f4dcc3b...                Hash: ef3a7d92... (64 chars)
Score: 35/100 ❌                 Score: 85/100 ✅
                                 Temp Pass: X7k@9pL!mQ2v
```

### How to Use

**Access Dashboard:**
```
http://localhost:5000/dashboard
```

**Individual Re-salt:**
1. Click "Refresh Security Status"
2. Find user with ⚠️ red warning
3. Click "Re-salt" button
4. Copy temporary password
5. Share with user

**Bulk Re-salt:**
1. Click "Re-salt All Weak Passwords"
2. Confirm operation
3. All temp passwords displayed
4. Click "Copy All"
5. Distribute to users

### Security Benefits
- ✅ MD5 → SHA-256 upgrade
- ✅ 32-char cryptographic salts
- ✅ Rainbow table protection
- ✅ Score: 35 → 85
- ✅ Zero downtime

---

## 📊 Backend Dashboard Features

### Access
```
URL: http://localhost:5000/dashboard
```

### Security Audit Tools

**1. Find Duplicate Passwords**
- Identify shared password hashes
- Group users by password
- Risk assessment

**2. Scan Weak Passwords**  
- Detect score < 50
- Sort by weakest
- Actionable recommendations

**3. Check Breached Passwords**
- Query 600M+ HIBP database
- Critical alerts
- k-Anonymity privacy

**4. Analyze Hash Distribution**
- Algorithm statistics
- Security level charts
- Visual metrics

### Re-Salt Management
- Real-time security monitoring
- Individual/bulk operations
- Temporary password generation
- One-click upgrades

---

## 🛠️ Hash Analysis Tools (8 Tools)

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
cd d:\Computer-Security\backend; ..\.venv\Scripts\python.exe app.py
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
- Additional hash algorithms (BLAKE2, BLAKE3, Argon2)
- Two-factor authentication (2FA)
- Email notifications for re-salt operations
- More encryption methods
- UI/UX enhancements
- Security audits
- Documentation improvements

---

## 🎓 Viva Preparation

### Complete Documentation

For comprehensive viva preparation including:
- Detailed technical implementation
- Security concepts explained
- Sample viva questions with answers
- Demonstration flow guide
- Architecture diagrams
- Code walkthroughs

**See:** [VIVA_PREPARATION_GUIDE.md](VIVA_PREPARATION_GUIDE.md)

### Key Features to Demonstrate

1. **User Registration** (MD5 auto-hash)
2. **Backend Dashboard** (User monitoring)
3. **Security Audit Tools** (4 professional tools)
4. **Password Re-Salt** ⭐ (Individual + Bulk upgrade)
5. **Hash Analysis Tools** (8 educational tools)
6. **Breach Checking** (HIBP integration with k-Anonymity)

### Quick Demo Flow (10 minutes)

```
1. Register 5 users with varying password strengths
2. Open dashboard → Show all users with MD5
3. Run 4 audit tools → Identify vulnerabilities
4. Use re-salt feature:
   - Individual re-salt for 1 user
   - Bulk re-salt for remaining users
5. Show security improvement: MD5 → SHA-256, Score 35 → 85
6. Demonstrate hash analysis tools
```

### Technical Questions Prepared

- What is password hashing vs encryption?
- Why is MD5 considered weak?
- What is a salt and why use it?
- Explain rainbow table attacks
- How does k-Anonymity protect privacy?
- Walk through the re-salt algorithm
- What is the difference between MD5, SHA-256, and Argon2?

**Full Q&A available in:** [VIVA_PREPARATION_GUIDE.md](VIVA_PREPARATION_GUIDE.md)

---

## 📚 Project Structure

```
Computer-Security/
├── index.html                  # User registration page (MD5 hashing)
├── backend/
│   ├── app.py                  # Flask REST API server
│   ├── database.db             # SQLite database
│   ├── dashboard.html          # Admin dashboard with re-salt
│   └── requirements.txt        # Python dependencies
├── features/
│   ├── encryption/             # AES-256, Triple DES, RC4
│   ├── hash-tools/             # 8 professional hash tools
│   └── password-generator/     # Strong password generator
├── shared/
│   ├── css/                    # Global styles
│   └── js/                     # API client, utilities
├── README.md                   # This file
└── VIVA_PREPARATION_GUIDE.md   # Comprehensive viva documentation
```

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
