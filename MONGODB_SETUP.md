# MongoDB Setup Guide

## Quick Check: Is MongoDB Running?

Your backend needs MongoDB to save stats. Let's check if it's set up:

### Option 1: Check if MongoDB is installed locally

```bash
# Check if MongoDB is installed
which mongod

# Or check if it's running
ps aux | grep mongod
```

### Option 2: Use MongoDB Atlas (Cloud - Easiest, Recommended)

This is the easiest option - no installation needed!

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a free cluster (M0 - Free tier)
4. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Username: `mentalmath` (or whatever you want)
   - Password: Create a strong password (save it!)
   - Database User Privileges: "Read and write to any database"
5. Whitelist your IP:
   - Go to "Network Access" → "Add IP Address"
   - Click "Add Current IP Address" (or use 0.0.0.0/0 for development - less secure)
6. Get your connection string:
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mental-math?retryWrites=true&w=majority`

7. Update `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mental-math?retryWrites=true&w=majority
   ```

### Option 3: Install MongoDB Locally (macOS)

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Or run manually
mongod --config /opt/homebrew/etc/mongod.conf
```

Then in `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/mental-math
```

## Test Your MongoDB Connection

After setting up, restart your backend and check the console. You should see:
```
MongoDB Connected: localhost
```
or
```
MongoDB Connected: cluster0.xxxxx.mongodb.net
```

If you see an error, check:
1. MongoDB is running (if local)
2. Connection string is correct in `backend/.env`
3. IP is whitelisted (if using Atlas)
4. Username/password are correct
