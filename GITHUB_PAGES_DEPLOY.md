# GitHub Pages Deployment Guide

## 📁 Project Structure

The project is now organized for GitHub Pages deployment:

```
Computer-Security/
├── index.html              # Main entry point (GitHub Pages landing page)
├── pages/                  # All other HTML pages
│   ├── register.html
│   ├── dashboard.html
│   ├── breach.html
│   ├── hash-tools.html
│   ├── security-testing.html
│   ├── security-guide.html
│   └── all-features.html
├── assets/
│   ├── css/
│   │   ├── style.css       # Main stylesheet
│   │   └── nav-styles.css  # Navigation styles
│   └── js/
│       ├── script.js       # Main functionality
│       └── api-client.js   # API client
├── backend/                # Flask backend (not deployed to GitHub Pages)
└── docs/                   # Documentation
```

## 🚀 Deployment Steps

### 1. Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Restructured for GitHub Pages deployment"

# Add remote repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/Computer-Security.git

# Push to main branch
git push -u origin main
```

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings**
3. Scroll down to **Pages** section (in the left sidebar)
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

### 3. Access Your Site

Your site will be available at:
```
https://YOUR_USERNAME.github.io/Computer-Security/
```

GitHub Pages will automatically serve `index.html` from the root directory.

## ✅ What's Updated

All HTML files have been updated with correct paths:

### Root Files
- ✅ `index.html` - Uses `pages/`, `assets/css/`, `assets/js/` paths

### Pages Folder
All files in `pages/` use relative paths:
- ✅ CSS: `../assets/css/style.css`
- ✅ JS: `../assets/js/script.js`, `../assets/js/api-client.js`
- ✅ Navigation: `../index.html`, `../pages/[page].html`

## ⚙️ Features

All features are accessible from the persistent sidebar navigation:

1. **Login** (index.html) - Main landing page
2. **Register** - User registration
3. **Dashboard** - User dashboard
4. **Breach Time** - Password breach analysis
5. **Hash Tools** - Hashing utilities
6. **Security Testing** - Security test suite
7. **Security Guide** - Best practices guide
8. **All Features** - Overview of all features

## 📝 Notes

### Backend Considerations
- The Flask backend (`backend/`) is **NOT** deployed to GitHub Pages
- GitHub Pages only serves static HTML/CSS/JS files
- For full functionality with backend:
  - Deploy backend separately (Heroku, Railway, Render, etc.)
  - Update `api-client.js` to point to your backend URL
  - Configure CORS on your backend to allow GitHub Pages domain

### Local Development
To test locally:
```bash
# Simple HTTP server
python -m http.server 8000

# Then open: http://localhost:8000
```

### Frontend Only Mode
The current setup works as a **frontend-only demonstration** using:
- Local Storage for data persistence
- Client-side JavaScript for all functionality
- No server-side dependencies

## 🔧 Troubleshooting

### Links Not Working
- Ensure all paths use relative paths (`../` for pages folder files)
- Check browser console for 404 errors
- Verify file names match exactly (case-sensitive on Linux servers)

### CSS/JS Not Loading
- Verify paths in browser DevTools Network tab
- Check that files exist in `assets/css/` and `assets/js/`
- Clear browser cache

### Updates Not Showing
- GitHub Pages can take 1-5 minutes to update
- Clear browser cache
- Check GitHub Actions/Pages build status

## 📱 Mobile Responsive
- Navigation automatically collapses on mobile devices
- Hamburger menu for easy navigation
- Touch-friendly interface

## 🎨 Customization

To customize for your deployment:
1. Update site title in `index.html`
2. Modify colors in `assets/css/style.css`
3. Add your own features in `pages/`
4. Update navigation in all files to include new pages

## 📄 License & Usage

This is an educational security demonstration project. Use responsibly and ethically.

---

**Ready to deploy!** Follow the deployment steps above to publish your Security Lab on GitHub Pages.
