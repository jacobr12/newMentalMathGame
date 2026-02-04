# How to Run the Mental Math App

## 🚀 Quick Start (Easiest Method)

### Step 1: Clean up any port conflicts
```bash
./cleanup-ports.sh
```

### Step 2: Start both servers
```bash
./start.sh
```

That's it! The app will be available at http://localhost:5173

---

## 📋 Manual Method (Two Terminals)

### Terminal 1 - Backend Server:
```bash
cd backend
npm run dev
```

You should see:
```
Server running in development mode on port 5001
MongoDB Connected: ...
```

### Terminal 2 - Frontend Server:
```bash
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

---

## 🔧 If You Get Port Conflicts

### Option 1: Use the cleanup script
```bash
./cleanup-ports.sh
```

### Option 2: Manually kill processes
```bash
# Kill backend port (5001)
lsof -ti:5001 | xargs kill -9

# Kill frontend port (5173)
lsof -ti:5173 | xargs kill -9
```

### Option 3: Change ports in .env files

**Backend** (`backend/.env`):
```env
PORT=5002
```

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:5002/api
```

Then restart both servers.

---

## ✅ Verify Everything is Working

1. **Backend Health Check**: Open http://localhost:5001/api/health
   - Should show: `{"status":"OK","message":"Server is running"}`

2. **Frontend**: Open http://localhost:5173
   - Should load the app without errors

3. **Check Browser Console**: 
   - Should have no Firebase errors
   - Should have no API connection errors

---

## 🐛 Common Issues

### "Port already in use"
- Run `./cleanup-ports.sh` or manually kill the processes
- Make sure you're not running multiple instances

### "Not authorized, token failed"
- Check `backend/.env` has `FIREBASE_SERVICE_ACCOUNT` or `FIREBASE_PROJECT_ID`
- Make sure Firebase Admin is initialized (check backend console)
- Restart backend server after changing `.env`

### "Firebase API key not valid"
- Check `.env` file has all Firebase config variables
- Restart frontend server after changing `.env`
- Verify API key in Firebase Console

### MongoDB connection error
- Make sure MongoDB is running (if using local)
- Check `MONGODB_URI` in `backend/.env` is correct
- For MongoDB Atlas, verify connection string is correct

---

## 📝 Ports Used

- **Backend**: 5001 (or PORT from `backend/.env`)
- **Frontend**: 5173 (Vite default)
- **MongoDB**: 27017 (if using local MongoDB)

---

## 🛑 Stopping the Servers

- If using `./start.sh`: Press `Ctrl+C`
- If using separate terminals: Press `Ctrl+C` in each terminal
