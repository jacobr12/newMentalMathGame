# Firebase Setup Instructions

This app uses Firebase Authentication for email/password and phone authentication. Follow these steps to set up Firebase:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable Google Analytics (optional)

## 2. Enable Authentication Methods

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication
3. Enable **Phone** authentication
   - For phone auth, you'll need to add your app's SHA-1 fingerprint (for Android) or configure reCAPTCHA

## 3. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app and copy the Firebase configuration object

## 4. Configure Frontend

1. Create a `.env` file in the root directory (same level as `package.json`)
2. Add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

## 5. Configure Backend

1. In Firebase Console, go to **Project Settings** > **Service accounts**
2. Click "Generate new private key" to download the service account JSON
3. In your backend `.env` file, add:

```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
```

   OR if running on Google Cloud (App Engine, Cloud Run, etc.), you can use:

```env
FIREBASE_PROJECT_ID=your-project-id
```

## 6. Install Dependencies

Run these commands to install the required packages:

```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

## 7. Test the Setup

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `npm run dev`
3. Try signing up with email/password or phone number

## Notes

- Phone authentication requires reCAPTCHA verification
- Make sure your Firebase project has billing enabled if you exceed the free tier limits
- For production, configure authorized domains in Firebase Console > Authentication > Settings
