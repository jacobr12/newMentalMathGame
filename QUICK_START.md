# Quick Start Guide

## Option 1: Use the Start Script (Easiest)

```bash
# Make the script executable (first time only)
chmod +x start.sh

# Run both servers
./start.sh
```

This will:
- Kill any processes on ports 5000, 5001, and 5173
- Start the backend server
- Start the frontend server
- Show you the URLs

Press `Ctrl+C` to stop both servers.

## Option 2: Manual Start (Two Terminals)

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
npm run dev
```

## If You Get Port Conflicts

### Kill processes on ports manually:

```bash
# Kill port 5000/5001 (backend)
lsof -ti:5000 | xargs kill -9
lsof -ti:5001 | xargs kill -9

# Kill port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Or use the cleanup script:

```bash
chmod +x cleanup-ports.sh
./cleanup-ports.sh
```

## Access the App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001/api
- **Health Check**: http://localhost:5001/api/health

## Troubleshooting

### Backend won't start?
- Make sure MongoDB is running (if using local MongoDB)
- Check `backend/.env` has correct MongoDB URI
- Verify Firebase Admin is configured in `backend/.env`

### Frontend won't start?
- Make sure you're in the root directory (not `backend/`)
- Check `.env` file has Firebase config
- Restart the dev server after changing `.env`

### Still having issues?
1. Make sure all dependencies are installed:
   ```bash
   npm install
   cd backend && npm install
   ```
2. Check that your `.env` files are configured correctly
3. Restart your terminal/computer if ports are still stuck
