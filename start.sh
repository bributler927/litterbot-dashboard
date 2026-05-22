#!/bin/bash
# LitterBot Dashboard - Start Script
# Starts both the Python backend (port 5000) and React frontend (port 3000)

set -e

echo "=========================================="
echo "  LitterBot Dashboard Startup"
echo "=========================================="

# ── Backend setup ────────────────────────────
cd "$(dirname "$0")/backend"

if [ ! -d ".venv" ]; then
  echo "→ Creating Python virtual environment..."
  python3 -m venv .venv
fi

echo "→ Installing Python dependencies..."
.venv/bin/pip install -q -r requirements.txt

echo "→ Starting Flask backend on http://localhost:5000"
.venv/bin/python app.py &
BACKEND_PID=$!

# ── Frontend setup ───────────────────────────
cd "../frontend"

if [ ! -d "node_modules" ]; then
  echo "→ Installing Node dependencies (this may take a moment)..."
  npm install
fi

echo "→ Starting React frontend on http://localhost:3000"
npm start &
FRONTEND_PID=$!

echo ""
echo "  ✓ Backend:  http://localhost:5000"
echo "  ✓ Frontend: http://localhost:3000"
echo ""
echo "  Press Ctrl+C to stop both servers."
echo "=========================================="

# Trap Ctrl+C and stop both
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
