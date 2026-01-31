import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Background3D from '../components/Background3D'
import Navigation from '../components/Navigation'
import { useAuth } from '../context/AuthContext'
import { statsAPI } from '../services/api'

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
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Profile</h1>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Account information and settings</p>

        <div style={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(15,23,42,0.7)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)' }}>
          <p style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}><strong>Name:</strong> {user?.name}</p>
          <p style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}><strong>Email:</strong> {user?.email}</p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={() => navigate('/stats')} style={{ padding: '0.6rem 1rem', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#6366f1,#ec4899)', color: 'white', cursor: 'pointer' }}>View Stats</button>
            <button onClick={handleReset} disabled={resetting} style={{ padding: '0.6rem 1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' }}>{resetting ? 'Resetting...' : 'Reset Stats'}</button>
            <button onClick={handleLogout} style={{ padding: '0.6rem 1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' }}>Log out</button>
          </div>

          {message && <p style={{ marginTop: '1rem', color: '#94a3b8' }}>{message}</p>}
        </div>
      </div>
    </div>
  )
}
