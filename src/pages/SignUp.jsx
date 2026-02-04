import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Background3D from '../components/Background3D'
import { useAuth } from '../context/AuthContext'

export default function SignUp() {
  const [authMethod, setAuthMethod] = useState('email') // 'email' or 'phone'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register, loginWithPhone, verifyPhoneCode } = useAuth()
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }
  
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!')
      return
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    const result = await register(formData.name, formData.email, formData.password)
    
    if (result.success) {
      navigate('/stats')
    } else {
      setError(result.error || 'Registration failed. Please try again.')
    }
    
    setLoading(false)
  }

  const handlePhoneSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    if (!confirmationResult) {
      // Step 1: Send verification code
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`
      const result = await loginWithPhone(formattedPhone)
      
      if (result.success) {
        setConfirmationResult(result.confirmationResult)
      } else {
        setError(result.error || 'Failed to send verification code.')
      }
    } else {
      // Step 2: Verify code
      const result = await verifyPhoneCode(confirmationResult, verificationCode)
      
      if (result.success) {
        navigate('/stats')
      } else {
        setError(result.error || 'Invalid verification code.')
      }
    }
    
    setLoading(false)
  }

  const resetPhoneAuth = () => {
    setConfirmationResult(null)
    setVerificationCode('')
    setError('')
  }
  
  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Background3D />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '400px',
          padding: '2rem',
        }}
      >
        <div style={{
          background: 'rgba(10, 10, 30, 0.6)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '20px',
          padding: '3rem',
          boxShadow: '0 0 50px rgba(99, 102, 241, 0.12), 0 0 100px rgba(139, 92, 246, 0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}>
          <motion.h1
            style={{
              margin: '0 0 0.5rem 0',
              fontSize: '2rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Create Account
          </motion.h1>
          
          <p style={{
            color: '#94a3b8',
            textAlign: 'center',
            marginBottom: '2rem',
            fontSize: '0.9rem',
          }}>
            Start your mental math journey
          </p>

          {/* Auth Method Toggle */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            background: 'rgba(10, 10, 30, 0.5)',
            backdropFilter: 'blur(12px)',
            padding: '0.5rem',
            borderRadius: '10px',
            border: '1px solid rgba(139, 92, 246, 0.25)',
          }}>
            <motion.button
              type="button"
              onClick={() => {
                setAuthMethod('email')
                resetPhoneAuth()
              }}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '8px',
                border: 'none',
                background: authMethod === 'email'
                  ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                  : 'transparent',
                color: authMethod === 'email' ? 'white' : '#94a3b8',
                fontWeight: authMethod === 'email' ? '600' : '400',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Email
            </motion.button>
            <motion.button
              type="button"
              onClick={() => {
                setAuthMethod('phone')
                resetPhoneAuth()
              }}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '8px',
                border: 'none',
                background: authMethod === 'phone'
                  ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                  : 'transparent',
                color: authMethod === 'phone' ? 'white' : '#94a3b8',
                fontWeight: authMethod === 'phone' ? '600' : '400',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Phone
            </motion.button>
          </div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1.5rem',
                color: '#ef4444',
                fontSize: '0.9rem',
                textAlign: 'center',
              }}
            >
              {error}
            </motion.div>
          )}
          
          {authMethod === 'email' ? (
            <form onSubmit={handleEmailSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                }}>
                  Name
                </label>
                <motion.input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    background: 'rgba(15, 23, 42, 0.5)',
                    color: '#e2e8f0',
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                  whileFocus={{
                    borderColor: '#6366f1',
                    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                }}>
                  Email
                </label>
                <motion.input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    background: 'rgba(15, 23, 42, 0.5)',
                    color: '#e2e8f0',
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                  whileFocus={{
                    borderColor: '#6366f1',
                    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                }}>
                  Password
                </label>
                <motion.input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    background: 'rgba(15, 23, 42, 0.5)',
                    color: '#e2e8f0',
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                  whileFocus={{
                    borderColor: '#6366f1',
                    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                }}>
                  Confirm Password
                </label>
                <motion.input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    background: 'rgba(15, 23, 42, 0.5)',
                    color: '#e2e8f0',
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                  whileFocus={{
                    borderColor: '#6366f1',
                    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
                  }}
                />
              </div>
              
              <motion.button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: loading
                    ? 'rgba(99, 102, 241, 0.5)'
                    : 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: '1rem',
                  opacity: loading ? 0.7 : 1,
                }}
                whileHover={loading ? {} : { scale: 1.02 }}
                whileTap={loading ? {} : { scale: 0.98 }}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handlePhoneSubmit}>
              {!confirmationResult ? (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                    }}>
                      Name
                    </label>
                    <motion.input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        background: 'rgba(15, 23, 42, 0.5)',
                        color: '#e2e8f0',
                        fontSize: '1rem',
                        outline: 'none',
                      }}
                      whileFocus={{
                        borderColor: '#6366f1',
                        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                    }}>
                      Phone Number
                    </label>
                    <motion.input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1234567890"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        background: 'rgba(15, 23, 42, 0.5)',
                        color: '#e2e8f0',
                        fontSize: '1rem',
                        outline: 'none',
                      }}
                      whileFocus={{
                        borderColor: '#6366f1',
                        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
                      }}
                    />
                    <p style={{
                      color: '#64748b',
                      fontSize: '0.8rem',
                      marginTop: '0.5rem',
                    }}>
                      Include country code (e.g., +1 for US)
                    </p>
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: loading
                        ? 'rgba(99, 102, 241, 0.5)'
                        : 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      marginBottom: '1rem',
                      opacity: loading ? 0.7 : 1,
                    }}
                    whileHover={loading ? {} : { scale: 1.02 }}
                    whileTap={loading ? {} : { scale: 0.98 }}
                  >
                    {loading ? 'Sending Code...' : 'Send Verification Code'}
                  </motion.button>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                    }}>
                      Verification Code
                    </label>
                    <motion.input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      required
                      maxLength={6}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        background: 'rgba(15, 23, 42, 0.5)',
                        color: '#e2e8f0',
                        fontSize: '1rem',
                        outline: 'none',
                      }}
                      whileFocus={{
                        borderColor: '#6366f1',
                        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
                      }}
                    />
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: loading
                        ? 'rgba(99, 102, 241, 0.5)'
                        : 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      marginBottom: '1rem',
                      opacity: loading ? 0.7 : 1,
                    }}
                    whileHover={loading ? {} : { scale: 1.02 }}
                    whileTap={loading ? {} : { scale: 0.98 }}
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={resetPhoneAuth}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      background: 'transparent',
                      color: '#94a3b8',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Change Phone Number
                  </motion.button>
                </>
              )}
            </form>
          )}
          
          <p style={{
            color: '#94a3b8',
            textAlign: 'center',
            fontSize: '0.9rem',
            marginTop: '1rem',
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{
              color: '#6366f1',
              textDecoration: 'none',
              fontWeight: '600',
            }}>
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
