# How to Run the Mental Math App

Follow these steps to get the app running on your computer.

## Prerequisites

- Node.js (v16 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)
- MongoDB database (local or cloud like MongoDB Atlas)
- Firebase account (free tier is fine)

## Step 1: Install Dependencies

Open a terminal in the project root directory and run:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

## Step 2: Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and create a new project
3. Enable Authentication:
   - Go to **Authentication** > **Sign-in method**
   - Enable **Email/Password**
   - Enable **Phone** (you'll need to set up reCAPTCHA)
4. Get your Firebase config:
   - Go to **Project Settings** (gear icon) > **General**
   - Scroll to "Your apps" and click the web icon (`</>`)
   - Register your app and copy the config values

## Step 3: Set Up Environment Variables

### Frontend (.env file)

Create a `.env` file in the root directory (same folder as `package.json`):

```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

Replace the values with your actual Firebase config.

### Backend (.env file)

Create a `.env` file in the `backend` directory:

```env
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/mental-math
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mental-math

# Server port
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Firebase Admin SDK
# Option 1: Service Account JSON (as a string)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'

# Option 2: Just project ID (if using default credentials)
# FIREBASE_PROJECT_ID=your-project-id
```

**To get Firebase Service Account:**
1. In Firebase Console, go to **Project Settings** > **Service accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. Copy the entire JSON content and paste it as a single-line string in your `.env` file (escape quotes properly)

## Step 4: Set Up MongoDB

### Option A: Local MongoDB

1. Install MongoDB locally: [Download here](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Or run manually
   mongod
   ```

### Option B: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string and add it to `backend/.env` as `MONGODB_URI`

## Step 5: Run the Application

You need **two terminal windows** - one for the backend, one for the frontend.

### Terminal 1: Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
Server running in development mode on port 5000
MongoDB Connected: ...
```

### Terminal 2: Frontend

```bash
# Make sure you're in the root directory (not backend)
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 6: Open the App

Open your browser and go to: **http://localhost:5173**

## Troubleshooting

### Backend won't start
- Check if MongoDB is running (if using local)
- Verify `MONGODB_URI` in `backend/.env` is correct
- Check if port 5000 is already in use

### Frontend won't start
- Make sure you're in the root directory (not `backend`)
- Check if port 5173 is already in use
- Verify all environment variables in `.env` are set

### Firebase errors
- Make sure Firebase Authentication is enabled
- Verify all Firebase config values in `.env` are correct
- For phone auth, make sure reCAPTCHA is configured

### Can't connect to backend
- Make sure backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env` matches backend URL
- Verify CORS settings in backend

### Authentication not working
- Check browser console for errors
- Verify Firebase service account is properly configured
- Make sure Firebase project has Authentication enabled

## Development Commands

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend
cd backend
npm run dev          # Start with auto-reload
npm start            # Start production server
```

## Need Help?

- Check `FIREBASE_SETUP.md` for detailed Firebase configuration
- Check `CHANGES.md` for what was changed
- Check browser console and terminal for error messages
