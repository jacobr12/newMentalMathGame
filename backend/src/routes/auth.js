import express from 'express'
import { body, validationResult } from 'express-validator'
import admin from '../config/firebase-admin.js'
import User from '../models/User.js'
import Stats from '../models/Stats.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   POST /api/auth/register-firebase
// @desc    Register a new user with Firebase (email/password)
// @access  Public
router.post(
  '/register-firebase',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('firebaseUid').notEmpty().withMessage('Firebase UID is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, email, firebaseUid } = req.body

      // Verify Firebase UID
      try {
        await admin.auth().getUser(firebaseUid)
      } catch (error) {
        return res.status(401).json({ message: 'Invalid Firebase UID' })
      }

      // Check if user already exists
      const userExists = await User.findOne({ 
        $or: [{ email }, { firebaseUid }] 
      })
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' })
      }

      // Create user
      const user = await User.create({
        name,
        email,
        firebaseUid,
      })

      // Create stats record for user
      await Stats.create({
        user: user._id,
      })

      res.status(201).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          firebaseUid: user.firebaseUid,
        },
      })
    } catch (error) {
      console.error('Registration error:', error)
      res.status(500).json({ message: 'Server error during registration' })
    }
  }
)

// @route   POST /api/auth/register-phone
// @desc    Register a new user with Firebase (phone)
// @access  Public
router.post(
  '/register-phone',
  [
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    body('firebaseUid').notEmpty().withMessage('Firebase UID is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { phoneNumber, firebaseUid } = req.body

      // Verify Firebase UID
      try {
        await admin.auth().getUser(firebaseUid)
      } catch (error) {
        return res.status(401).json({ message: 'Invalid Firebase UID' })
      }

      // Check if user already exists
      const userExists = await User.findOne({ 
        $or: [{ phoneNumber }, { firebaseUid }] 
      })
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' })
      }

      // Create user
      const user = await User.create({
        name: phoneNumber, // Default name to phone number
        phoneNumber,
        firebaseUid,
      })

      // Create stats record for user
      await Stats.create({
        user: user._id,
      })

      res.status(201).json({
        user: {
          id: user._id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          firebaseUid: user.firebaseUid,
        },
      })
    } catch (error) {
      console.error('Registration error:', error)
      res.status(500).json({ message: 'Server error during registration' })
    }
  }
)

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
