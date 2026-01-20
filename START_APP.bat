@echo off
echo ============================================================
echo   Authentication Security Lab - Startup (FIXED)
echo ============================================================
echo.

REM Change to project root
cd /d "%~dp0"

echo [1/5] Activating virtual environment...
if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
    echo Virtual environment activated
) else (
    echo WARNING: Virtual environment not found
    echo Creating virtual environment...
    python -m venv .venv
    call .venv\Scripts\activate.bat
    echo Installing dependencies...
    pip install -r backend\requirements.txt
)

echo.
echo [2/5] Checking Python dependencies...
cd backend
pip show flask >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Python dependencies...
    pip install -r requirements.txt
)

echo.
echo [3/5] Initializing database...
if not exist "instance" mkdir instance
python -c "from app import app, db; app.app_context().push(); db.create_all(); print('Database initialized')"

echo.
echo [4/5] Starting Flask Backend (Port 5000)...
start "Flask Backend" cmd /k "cd /d %~dp0backend && %~dp0.venv\Scripts\python.exe app.py"
timeout /t 5 >nul

echo.
echo [5/5] Starting Frontend Server (Port 8000)...
cd ..
start "Frontend Server" cmd /k "%~dp0.venv\Scripts\python.exe -m http.server 8000"
timeout /t 3 >nul

echo.
echo Opening Application...
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
echo   - Home:       http://localhost:8000/index.html
echo   - Register:   http://localhost:8000/pages/register.html
echo   - Dashboard:  http://localhost:8000/pages/dashboard.html
echo   - Breach:     http://localhost:8000/pages/breach.html
echo   - All Features: http://localhost:8000/pages/all-features.html
echo.
echo Backend API:
echo   - Test:       http://localhost:5000/api/test
echo   - Health:     http://localhost:5000/api/health
echo.
echo To stop servers: Close the terminal windows
echo.
pause
