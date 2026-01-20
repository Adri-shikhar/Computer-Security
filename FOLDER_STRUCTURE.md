# 📁 Security Lab - Organized Folder Structure

## Quick Navigation

| Folder | Purpose | Main Files |
|--------|---------|------------|
| `features/` | All user-facing features | index.html (overview) |
| `features/auth/` | User registration & login | register.html |
| `features/dashboard/` | User management & data | dashboard.html |
| `features/security-testing/` | Attack simulators & demos | security-testing.html |
| `features/hash-tools/` | Hash calculator & verification | hash-tools.html |
| `features/breach-analysis/` | Password strength & crack time | breach.html |
| `features/guides/` | Educational content | security-guide.html |
| `tools/` | Development & testing utilities | index.html (overview) |
| `tools/diagnostics/` | System health checks | feature-checker.html, diagnostics.html |
| `tools/scripts/` | Python helper scripts | attack_toolkit.py |
| `shared/` | Shared assets (CSS, JS) | css/, js/ |
| `documentation/` | PDF guides & markdown | *.pdf, *.md |
| `backend/` | Flask API & database | app.py, models.py |

## Folder Details

### 🔐 features/auth/
User authentication functionality
- **register.html** - New user registration with algorithm selection

### 📊 features/dashboard/
Data management and user viewing
- **dashboard.html** - View all users, manage accounts, export data

### 🔓 features/security-testing/
Security vulnerability demonstrations
- **security-testing.html** - Dictionary attack simulator, timing attack demo, wordlist upload

### #️⃣ features/hash-tools/
Password hashing utilities
- **hash-tools.html** - Calculate MD5, SHA-256, SHA-1 hashes

### ⏱️ features/breach-analysis/
Password security analysis
- **breach.html** - Password strength meter, crack time estimation

### 📚 features/guides/
Educational resources
- **security-guide.html** - Best practices, algorithm explanations

### 🛠️ tools/diagnostics/
Development and testing utilities
- **feature-checker.html** - Verify all JS functions load correctly
- **diagnostics.html** - Full system health check
- **dashboard-debug.html** - Dashboard testing
- **test-backend.html** - Backend connectivity test
- **test-connection.html** - API connection test

### 🐍 tools/scripts/
Python automation scripts
- **attack_toolkit.py** - Export hashes, generate wordlists, show stats
- **setup.py** - Initial project setup
- **view_database.py** - View SQLite database contents

### 🎨 shared/
Shared assets used by all pages
- **css/style.css** - Main application styles
- **css/nav-styles.css** - Sidebar navigation styles
- **js/script.js** - Core JavaScript logic
- **js/api-client.js** - Backend API client

### 📄 documentation/
Project documentation
- **Feature_Location_Map.pdf** - Complete feature-to-file mapping
- **Security_Lab_Complete_Documentation.pdf** - Full project docs
- Various markdown guides

### ⚙️ backend/
Flask backend API
- **app.py** - Main Flask application
- **models.py** - SQLAlchemy database models
- **instance/** - SQLite database storage

## How to Navigate

1. **Start at** `index.html` (root) - Login page
2. **Explore features** via `features/index.html` - Visual folder overview
3. **Access tools** via `tools/index.html` - Diagnostics & scripts
4. **Read docs** in `documentation/` folder

## URL Structure

```
/index.html                                    → Login (home)
/features/index.html                           → Features overview
/features/auth/register.html                   → Registration
/features/dashboard/dashboard.html             → Dashboard
/features/security-testing/security-testing.html → Security lab
/features/hash-tools/hash-tools.html           → Hash calculator
/features/breach-analysis/breach.html          → Breach analyzer
/features/guides/security-guide.html           → Security guide
/tools/index.html                              → Tools overview
/tools/diagnostics/feature-checker.html        → Feature tester
```
