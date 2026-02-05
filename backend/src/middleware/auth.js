import admin from '../config/firebase-admin.js'
import User from '../models/User.js'

// Protect routes - verify Firebase token
export const protect = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]

      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(token)

      // Get or create user from database
      let user = await User.findOne({ firebaseUid: decodedToken.uid })

      if (!user) {
        // Create user if doesn't exist
        user = await User.create({
          firebaseUid: decodedToken.uid,
          email: decodedToken.email,
          phoneNumber: decodedToken.phone_number,
          name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
        })
      }

      req.user = user
      next()
    } catch (error) {
      // Handle token expiration specifically
      if (error.code === 'auth/id-token-expired') {
        console.warn('⚠️ Token expired - client should refresh')
        return res.status(401).json({ 
          message: 'Token expired. Please sign in again.',
          code: 'TOKEN_EXPIRED'
        })
      }
      console.error('Token verification error:', error.code || error.message)
      return res.status(401).json({ message: 'Not authorized, token failed' })
    }
  }

  if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' })
  }
}

// Admin-only: require protect first, then require user email in ADMIN_EMAILS
const adminEmails = () =>
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' })
  }
  const email = (req.user.email || '').toLowerCase()
  if (!adminEmails().includes(email)) {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

export function isAdmin(user) {
  if (!user || !user.email) return false
  return adminEmails().includes((user.email || '').toLowerCase())
}
