import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    let initialized = false

    // Option 1: Try to load from service account file (easiest for local dev)
    try {
      const serviceAccountPath = join(__dirname, '../../firebase-service-account.json')
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
      console.log('✅ Firebase Admin initialized from service account file')
      initialized = true
    } catch (fileError) {
      // File doesn't exist or can't be read, try other methods
    }

    // Option 2: Try service account from environment variable (JSON string)
    if (!initialized && process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        // Remove any newlines and extra whitespace, then parse
        let cleanedJson = process.env.FIREBASE_SERVICE_ACCOUNT.trim()
        
        // Remove surrounding quotes if present
        if ((cleanedJson.startsWith("'") && cleanedJson.endsWith("'")) ||
            (cleanedJson.startsWith('"') && cleanedJson.endsWith('"'))) {
          cleanedJson = cleanedJson.slice(1, -1)
        }
        
        // Replace escaped newlines and clean up
        cleanedJson = cleanedJson.replace(/\\n/g, '\n').replace(/\s+/g, ' ')
        
        const serviceAccount = JSON.parse(cleanedJson)
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        })
        console.log('✅ Firebase Admin initialized with service account from env')
        initialized = true
      } catch (parseError) {
        console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT:', parseError.message)
        console.error('   Make sure it\'s valid JSON (can be multi-line in .env)')
      }
    }

    // Option 3: Try project ID (only works with Application Default Credentials)
    if (!initialized && process.env.FIREBASE_PROJECT_ID) {
      try {
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID,
        })
        console.log('✅ Firebase Admin initialized with project ID:', process.env.FIREBASE_PROJECT_ID)
        initialized = true
      } catch (projectError) {
        console.error('❌ Error initializing with project ID:', projectError.message)
        console.error('   This requires Application Default Credentials (gcloud CLI)')
      }
    }

    if (!initialized) {
      console.error('❌ Firebase Admin NOT initialized!')
      console.error('   Options:')
      console.error('   1. Create backend/firebase-service-account.json with your service account JSON')
      console.error('   2. Set FIREBASE_SERVICE_ACCOUNT in backend/.env (can be multi-line)')
      console.error('   3. Set FIREBASE_PROJECT_ID and configure gcloud CLI')
      console.error('   Authentication will NOT work until this is fixed!')
    }
  } catch (error) {
    console.error('❌ Fatal error initializing Firebase Admin:', error.message)
    console.error('   Authentication will NOT work until this is fixed!')
  }
} else {
  console.log('✅ Firebase Admin already initialized')
}

export default admin
