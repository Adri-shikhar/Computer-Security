@echo off
echo ============================================================
echo   Authentication Security Lab - Startup
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.11+ from https://www.python.org
    pause
    exit /b 1
)

echo [1/4] Checking dependencies...
cd ..\backend
pip show flask >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Python dependencies...
    pip install -r requirements.txt
)

echo [2/4] Starting Flask Backend (Port 5000)...
cd ..\backend
start "Flask Backend" cmd /k "python app.py"
timeout /t 3 >nul

echo [3/4] Starting Frontend Server (Port 8000)...
cd ..\frontend
start "Frontend Server" cmd /k "python -m http.server 8000"
timeout /t 2 >nul

echo [4/4] Opening Application...
timeout /t 2 >nul
start http://localhost:8000/index.html

echo.
echo ============================================================
echo   Application Started Successfully!
echo ============================================================
echo.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:8000
echo.
echo Available Pages:
echo   - Landing:    http://localhost:8000/index.html
echo   - Register:   http://localhost:8000/register.html
echo   - Dashboard:  http://localhost:8000/dashboard.html
echo   - Breach:     http://localhost:8000/breach.html
echo   - Test:       http://localhost:8000/test-connection.html
echo.
echo Sample Accounts:
echo   alice_legacy / password123 (MD5, no salt)
echo   bob_salted / welcome2024 (MD5, salted)
echo   charlie_secure / MySecureP@ss123! (Argon2)
echo   diana_migrate / test1234 (MD5, will auto-upgrade)
echo.
echo To stop servers: Close the terminal windows
echo.
pause
