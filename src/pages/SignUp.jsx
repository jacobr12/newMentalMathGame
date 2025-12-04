import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Background3D from '../components/Background3D'

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const navigate = useNavigate()
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    // TODO: Add backend registration
    console.log('Sign up attempt:', formData)
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
          
          <form onSubmit={handleSubmit}>
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
              Sign Up
            </motion.button>
          </form>
          
          <p style={{
            color: '#94a3b8',
            textAlign: 'center',
            fontSize: '0.9rem',
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
