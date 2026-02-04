# Firebase Admin Setup for Backend

You have **3 options** to set up Firebase Admin. Choose the easiest one:

## Option 1: Service Account File (Easiest - Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `mentalmathapp-9ac06`
3. Click gear icon → **Project Settings**
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Download the JSON file
7. Save it as `backend/firebase-service-account.json`

That's it! The backend will automatically use this file.

**Important**: Add `firebase-service-account.json` to `.gitignore` (don't commit it!)

## Option 2: Environment Variable (Multi-line OK)

In your `backend/.env` file, you can paste the service account JSON:

```env
FIREBASE_SERVICE_ACCOUNT={
  "type": "service_account",
  "project_id": "mentalmathapp-9ac06",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  ...
}
```

The code will automatically handle multi-line JSON now!

## Option 3: Project ID Only (Requires gcloud CLI)

If you have Google Cloud SDK installed and authenticated:

```env
FIREBASE_PROJECT_ID=mentalmathapp-9ac06
```

Then run:
```bash
gcloud auth application-default login
```

---

## Quick Fix Right Now

**Easiest solution**: Use Option 1 (service account file)

1. Download the service account JSON from Firebase Console
2. Save it as `backend/firebase-service-account.json`
3. Restart your backend server
4. You should see: `✅ Firebase Admin initialized from service account file`
