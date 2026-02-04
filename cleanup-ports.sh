#!/bin/bash

# Cleanup script to kill processes on common ports

echo "🧹 Cleaning up ports 5000, 5001, and 5173..."

# Kill processes on port 5000
if lsof -ti:5000 > /dev/null 2>&1; then
  echo "Killing process on port 5000..."
  lsof -ti:5000 | xargs kill -9 2>/dev/null
  sleep 1
else
  echo "Port 5000 is free"
fi

# Kill processes on port 5001
if lsof -ti:5001 > /dev/null 2>&1; then
  echo "Killing process on port 5001..."
  lsof -ti:5001 | xargs kill -9 2>/dev/null
  sleep 1
fi

# Kill processes on port 5173
if lsof -ti:5173 > /dev/null 2>&1; then
  echo "Killing process on port 5173..."
  lsof -ti:5173 | xargs kill -9 2>/dev/null
  sleep 1
fi

echo "✅ Ports cleaned up!"
echo ""
echo "You can now start the servers:"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: npm run dev"
