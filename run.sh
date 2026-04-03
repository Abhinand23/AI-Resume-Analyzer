#!/bin/bash
echo "Starting AI Resume Analyzer Application..."

echo "1) Starting FastAPI Backend..."
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

echo "2) Starting Vite React Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "✅ Both servers are now running!"
echo "📍 Frontend UI is live at: http://localhost:5173"
echo "📍 Backend API is live at: http://localhost:8000"
echo "============================================"
echo "Press Ctrl+C to stop both servers."

# Trap Ctrl+C (SIGINT) to elegantly kill both servers
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" EXIT

wait $BACKEND_PID $FRONTEND_PID
