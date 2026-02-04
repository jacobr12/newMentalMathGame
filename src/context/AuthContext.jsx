import { createContext, useState, useContext, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  RecaptchaVerifier
} from 'firebase/auth'
import { auth } from '../config/firebase'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null)

  useEffect(() => {
    // Initialize reCAPTCHA verifier for phone auth
    if (typeof window !== 'undefined' && !recaptchaVerifier) {
      try {
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          },
          'expired-callback': () => {
            // Response expired - reset verifier
            setRecaptchaVerifier(null)
          }
        })
        setRecaptchaVerifier(verifier)
      } catch (error) {
        console.error('Error initializing reCAPTCHA:', error)
      }
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user data from backend
        try {
          const token = await firebaseUser.getIdToken()
          localStorage.setItem('firebaseToken', token)
          
          // Try to get user from backend
          const userData = await authAPI.getCurrentUser()
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            phoneNumber: firebaseUser.phoneNumber,
            ...userData
          })
        } catch (error) {
          console.error('Error loading user data:', error)
          // If backend fails, use Firebase user data
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            phoneNumber: firebaseUser.phoneNumber,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
          })
        }
      } else {
        setUser(null)
        localStorage.removeItem('firebaseToken')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [recaptchaVerifier])

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const token = await userCredential.user.getIdToken()
      localStorage.setItem('firebaseToken', token)
      
      // Get user data from backend
      try {
        const userData = await authAPI.getCurrentUser()
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          phoneNumber: userCredential.user.phoneNumber,
          ...userData
        })
      } catch (error) {
        // If backend fails, use Firebase user data
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          phoneNumber: userCredential.user.phoneNumber,
          name: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User'
        })
      }
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  const loginWithPhone = async (phoneNumber) => {
    try {
      if (!recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized')
      }
      
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
      return { success: true, confirmationResult }
    } catch (error) {
      console.error('Phone login error:', error)
      return { success: false, error: error.message || 'Phone login failed' }
    }
  }

  const verifyPhoneCode = async (confirmationResult, code) => {
    try {
      const userCredential = await confirmationResult.confirm(code)
      const token = await userCredential.user.getIdToken()
      localStorage.setItem('firebaseToken', token)
      
      // Get or create user in backend
      try {
        const userData = await authAPI.getCurrentUser()
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          phoneNumber: userCredential.user.phoneNumber,
          ...userData
        })
      } catch (error) {
        // If user doesn't exist in backend, create it
        try {
          await authAPI.registerWithPhone(userCredential.user.phoneNumber, userCredential.user.uid)
          const userData = await authAPI.getCurrentUser()
          setUser({
            uid: userCredential.user.uid,
            phoneNumber: userCredential.user.phoneNumber,
            ...userData
          })
        } catch (createError) {
          // Fallback to Firebase user data
          setUser({
            uid: userCredential.user.uid,
            phoneNumber: userCredential.user.phoneNumber,
            name: userCredential.user.phoneNumber || 'User'
          })
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Code verification error:', error)
      return { success: false, error: error.message || 'Code verification failed' }
    }
  }

  const register = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const token = await userCredential.user.getIdToken()
      localStorage.setItem('firebaseToken', token)
      
      // Create user in backend
      try {
        await authAPI.registerWithFirebase(name, email, userCredential.user.uid)
        const userData = await authAPI.getCurrentUser()
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          ...userData
        })
      } catch (error) {
        // If backend fails, use Firebase user data
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          name: name || userCredential.user.email?.split('@')[0] || 'User'
        })
      }
      
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: error.message || 'Registration failed' }
    }
  }

  const logout = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      localStorage.removeItem('firebaseToken')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const value = {
    user,
    loading,
    login,
    loginWithPhone,
    verifyPhoneCode,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      <div id="recaptcha-container"></div>
    </AuthContext.Provider>
  )
}
