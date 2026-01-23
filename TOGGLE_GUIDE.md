# Demo/Live Mode Toggle Guide

## Overview
The Security Operations Center now includes a convenient toggle system that allows you to switch between **Demo Mode** (using pre-loaded demo data) and **Live Mode** (using the Flask backend).

## What's New

### 1. Features Removed
The following features have been removed from the navigation:
- ✅ Salt Generator
- ✅ Hash Identifier  
- ✅ Base64 Encoder/Decoder

All references have been cleaned up from all HTML files.

### 2. Demo/Live Toggle System

#### Toggle Button Location
A floating toggle button appears in the top-right corner of the page with:
- **Demo Button** - Loads pre-populated demo data (30 sample users)
- **Live Button** - Connects to Flask backend (requires backend to be running)
- **Status Indicator** - Shows if backend is online or offline

#### How to Use

**Demo Mode (Default)**
- Activated by default when you open the application
- Shows 30 pre-populated demo users
- No backend required
- Perfect for quick demos and testing
- Click the "Demo" button to switch to this mode

**Live Mode**
- Requires Flask backend to be running
- Click the "Live" button to switch
- If backend is offline, you'll get a notification
- Allows you to register real users and use all backend features
- Data persists in the SQLite database

## Starting the Backend

### Option 1: Using PowerShell (Windows)
```powershell
cd d:\Computer-Security\backend
python app.py
```

### Option 2: Using Python directly
```bash
cd backend
python app.py
```

The backend will start on `http://localhost:5000`

## Features

### Demo Mode
✅ Instant access to sample data  
✅ No setup required  
✅ 30 pre-populated users  
✅ Perfect for presentations  
✅ No database needed  

### Live Mode
✅ Full backend integration  
✅ Real user registration  
✅ Data persistence  
✅ All backend features available  
✅ API endpoints active  

## Toggle Notifications

When you switch modes, you'll see a notification:
- **Demo Mode**: "Demo Mode Activated - Using demo data for preview"
- **Live Mode**: "Live Mode Activated - Connected to Flask backend"
- **Backend Offline**: "Backend Offline - Please start the Flask backend to use Live mode"

## Technical Details

### API Endpoints Used
- **Demo Mode**: `/api/demo-users` - Returns pre-populated demo data
- **Live Mode**: `/api/users` - Returns real user data from database
- **Health Check**: `/api/health` - Checks if backend is available

### Files Modified
1. `shared/js/api-client.js` - Added toggle functionality
2. `backend/app.py` - Added `/api/health` endpoint
3. All HTML files - Removed references to deleted features

## Dashboard Integration

The toggle automatically refreshes the dashboard when you switch modes, showing the appropriate data source.

## Troubleshooting

**Toggle button not appearing?**
- Make sure `api-client.js` is loaded in your HTML file
- Check browser console for errors

**Can't switch to Live mode?**
- Ensure Flask backend is running
- Check that it's running on `http://127.0.0.1:5000`
- Verify the backend console shows no errors

**Demo data not loading?**
- Check browser console for errors
- Ensure the `/api/demo-users` endpoint is working
- Try refreshing the page

## Next Steps

1. **For Quick Demo**: Just open `index.html` - Demo mode is already active
2. **For Full Testing**: 
   - Start the Flask backend with `python backend/app.py`
   - Click the "Live" button in the toggle
   - Register real users and test all features

Enjoy your streamlined Security Operations Center! 🔐
