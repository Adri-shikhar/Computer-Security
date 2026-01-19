#!/bin/bash

echo "========================================"
echo "Authentication Security Lab - Setup"
echo "========================================"
echo ""

echo "[1/4] Installing Python dependencies..."
pip3 install -r requirements.txt || {
    echo "ERROR: Failed to install dependencies"
    exit 1
}

echo ""
echo "[2/4] Initializing database..."
python3 setup.py || {
    echo "ERROR: Failed to initialize database"
    exit 1
}

echo ""
echo "[3/4] Starting Flask backend..."
python3 app.py &
FLASK_PID=$!

echo ""
echo "[4/4] Starting frontend server..."
sleep 2
python3 -m http.server 8000 &
HTTP_PID=$!

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Backend API: http://localhost:5000"
echo "Frontend UI: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop servers..."

# Cleanup function
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $FLASK_PID $HTTP_PID 2>/dev/null
    echo "Servers stopped. Goodbye!"
    exit 0
}

trap cleanup INT TERM

# Wait for user interrupt
wait
