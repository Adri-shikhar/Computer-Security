@echo off
echo ========================================
echo Authentication Security Lab - Setup
echo ========================================
echo.

echo [1/4] Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Initializing database...
python setup.py
if %errorlevel% neq 0 (
    echo ERROR: Failed to initialize database
    pause
    exit /b 1
)

echo.
echo [3/4] Starting Flask backend...
start "Flask Backend" python app.py

echo.
echo [4/4] Starting frontend server...
timeout /t 2 /nobreak > nul
start "Frontend Server" python -m http.server 8000

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Backend API: http://localhost:5000
echo Frontend UI: http://localhost:8000
echo.
echo Opening browser...
timeout /t 3 /nobreak > nul
start http://localhost:8000/index.html

echo.
echo Press any key to stop servers...
pause > nul

echo Stopping servers...
taskkill /FI "WINDOWTITLE eq Flask Backend*" /T /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend Server*" /T /F > nul 2>&1

echo.
echo Servers stopped. Goodbye!
