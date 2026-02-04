import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Background3D from '../components/Background3D'
import Navigation from '../components/Navigation'
import { useAuth } from '../context/AuthContext'
import { statsAPI } from '../services/api'

const pageTransition = { type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.35 }

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user) return
  }, [user])

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset your stats? This cannot be undone.')) return
    setResetting(true)
    setMessage('')
    try {
      await statsAPI.resetStats()
      setMessage('Stats reset successfully.')
    } catch (err) {
      console.error(err)
      setMessage(err.message || 'Failed to reset stats')
    } finally {
      setResetting(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Background3D />
      <Navigation />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem' }}>
        <motion.h1
          className="gradient-text"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={pageTransition}
          style={{ fontSize: '2rem', marginBottom: '0.5rem' }}
        >
          Profile
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05, ...pageTransition }}
          style={{ color: '#94a3b8', marginBottom: '1.5rem' }}
        >
          Account information and settings
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...pageTransition }}
          className="glass-panel"
          style={{ padding: '2rem' }}
        >
          <p style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}><strong>Name:</strong> {user?.name}</p>
          {user?.email && <p style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}><strong>Email:</strong> {user?.email}</p>}
          {user?.phoneNumber && <p style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}><strong>Phone:</strong> {user?.phoneNumber}</p>}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <motion.button
              onClick={() => navigate('/stats')}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                boxShadow: '0 0 28px rgba(99, 102, 241, 0.28)',
              }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 36px rgba(99, 102, 241, 0.35)' }}
              whileTap={{ scale: 0.98 }}
              transition={pageTransition}
            >
              View Stats
            </motion.button>
            <motion.button
              onClick={handleReset}
              disabled={resetting}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '14px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                background: 'rgba(99, 102, 241, 0.08)',
                color: '#e2e8f0',
                cursor: resetting ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '0.95rem',
              }}
              whileHover={resetting ? {} : { borderColor: 'rgba(139, 92, 246, 0.5)' }}
              whileTap={{ scale: 0.98 }}
              transition={pageTransition}
            >
              {resetting ? 'Resetting...' : 'Reset Stats'}
            </motion.button>
            <motion.button
              onClick={handleLogout}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
                color: '#94a3b8',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.95rem',
              }}
              whileHover={{ borderColor: 'rgba(139, 92, 246, 0.3)', color: '#e2e8f0' }}
              whileTap={{ scale: 0.98 }}
              transition={pageTransition}
            >
              Log out
            </motion.button>
          </div>

          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: '1.25rem', color: message.startsWith('Stats reset') ? '#10b981' : '#94a3b8' }}
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
