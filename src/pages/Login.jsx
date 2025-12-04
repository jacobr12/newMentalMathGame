import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Background3D from '../components/Background3D'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  
  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Add backend authentication
    console.log('Login attempt:', { email, password })
    // For now, just navigate to dashboard
    navigate('/stats')
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
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '20px',
          padding: '3rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}>
          <motion.h1
            style={{
              margin: '0 0 0.5rem 0',
              fontSize: '2rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Welcome Back
          </motion.h1>
          
          <p style={{
            color: '#94a3b8',
            textAlign: 'center',
            marginBottom: '2rem',
            fontSize: '0.9rem',
          }}>
            Sign in to track your progress
          </p>
          
          <form onSubmit={handleSubmit}>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                Password
              </label>
              <motion.input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '1rem',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </motion.button>
          </form>
          
          <p style={{
            color: '#94a3b8',
            textAlign: 'center',
            fontSize: '0.9rem',
          }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{
              color: '#6366f1',
              textDecoration: 'none',
              fontWeight: '600',
            }}>
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
