#!/bin/bash

# NaijaTrust Quick Start Script
# This script helps verify your setup and start the servers

echo "🚀 NaijaTrust Quick Start"
echo "========================="
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env file not found!"
    echo "📝 Please follow the SETUP_GUIDE.md to create your .env file"
    echo ""
    echo "Quick steps:"
    echo "1. Copy backend/.env.example to backend/.env"
    echo "2. Fill in your MongoDB Atlas, Gmail, and Google OAuth credentials"
    echo ""
    exit 1
fi

# Check if MongoDB URI is configured
if grep -q "YOUR_PASSWORD_HERE" backend/.env; then
    echo "⚠️  Warning: MongoDB connection string not configured"
    echo "📝 Please update MONGODB_URI in backend/.env"
    echo "   See SETUP_GUIDE.md for instructions"
    echo ""
fi

# Check if Email is configured
if grep -q "your-email@gmail.com" backend/.env; then
    echo "⚠️  Warning: Email service not configured"
    echo "📝 Please update EMAIL_USER and EMAIL_PASSWORD in backend/.env"
    echo "   Verification emails will be logged to console instead"
    echo ""
fi

# Check if Google OAuth is configured
if grep -q "your-google-client-id" backend/.env; then
    echo "⚠️  Warning: Google OAuth not configured"
    echo "📝 Please update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env"
    echo "   Google login will not work until configured"
    echo ""
fi

echo "✅ Starting servers..."
echo ""

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# Start backend
echo "📦 Starting backend server..."
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 2

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Servers started!"
echo ""
echo "📍 Backend:  http://localhost:5000"
echo "📍 Frontend: http://localhost:5173"
echo ""
echo "📖 Open SETUP_GUIDE.md for configuration instructions"
echo ""
echo "Press Ctrl+C to stop servers"
echo ""

# Wait for processes
wait
