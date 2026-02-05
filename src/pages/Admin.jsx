import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Background3D from '../components/Background3D'
import Navigation from '../components/Navigation'
import { useAuth } from '../context/AuthContext'
import { adminAPI } from '../services/api'

const pageTransition = { type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.35 }

function todayPacific() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })
}

export default function Admin() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resetDate, setResetDate] = useState(todayPacific())
  const [resetType, setResetType] = useState('')
  const [resetting, setResetting] = useState(false)
  const [resetMessage, setResetMessage] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) return
    let cancelled = false
    setLoading(true)
    setError('')
    adminAPI
      .getUsers()
      .then((data) => {
        if (!cancelled) setUsers(data.users || [])
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load users')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [isAuthenticated, user?.isAdmin])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }
    if (user && user.isAdmin === false) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleReset = async () => {
    if (!confirm('Reset daily challenge for this date? All submissions for that day will be deleted.')) return
    setResetting(true)
    setResetMessage('')
    try {
      const data = await adminAPI.resetDailyChallenge(resetDate, resetType || null)
      setResetMessage(data.message || `Reset complete. Deleted: ${data.deletedCount ?? 0} submission(s).`)
    } catch (err) {
      setResetMessage(err.message || 'Reset failed')
    } finally {
      setResetting(false)
    }
  }

  if (!user) return null
  if (user.isAdmin === false) return null

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Background3D />
      <Navigation />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
        <motion.h1
          className="gradient-text"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={pageTransition}
          style={{ fontSize: '2rem', marginBottom: '0.5rem' }}
        >
          Admin
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05, ...pageTransition }}
          style={{ color: '#94a3b8', marginBottom: '2rem' }}
        >
          Manage users and reset daily challenge
        </motion.p>

        {/* Reset daily challenge */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...pageTransition }}
          className="glass-panel"
          style={{ padding: '2rem', marginBottom: '2rem' }}
        >
          <h2 style={{ color: '#e2e8f0', fontSize: '1.25rem', marginBottom: '1rem' }}>Reset daily challenge</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.95rem' }}>
            Delete all submissions for a given date (and optionally one challenge type). Users can re-attempt that day after reset.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.35rem' }}>Date</label>
              <input
                type="date"
                value={resetDate}
                onChange={(e) => setResetDate(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: '#e2e8f0',
                  fontSize: '0.95rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.35rem' }}>Type (optional)</label>
              <select
                value={resetType}
                onChange={(e) => setResetType(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: '#e2e8f0',
                  fontSize: '0.95rem',
                  minWidth: '140px',
                }}
              >
                <option value="">All types</option>
                <option value="division">Division</option>
                <option value="equation">Equation</option>
                <option value="multiplication">Multiplication</option>
              </select>
            </div>
            <motion.button
              onClick={handleReset}
              disabled={resetting}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '10px',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                cursor: resetting ? 'wait' : 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
              }}
              whileHover={!resetting ? { background: 'rgba(239, 68, 68, 0.25)' } : {}}
              whileTap={!resetting ? { scale: 0.98 } : {}}
            >
              {resetting ? 'Resetting…' : 'Reset'}
            </motion.button>
          </div>
          {resetMessage && (
            <p style={{ color: resetMessage.startsWith('Reset') ? '#86efac' : '#fca5a5', fontSize: '0.9rem' }}>
              {resetMessage}
            </p>
          )}
        </motion.section>

        {/* Users list */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, ...pageTransition }}
          className="glass-panel"
          style={{ padding: '2rem' }}
        >
          <h2 style={{ color: '#e2e8f0', fontSize: '1.25rem', marginBottom: '1rem' }}>All profiles</h2>
          {error && <p style={{ color: '#fca5a5', marginBottom: '1rem' }}>{error}</p>}
          {loading ? (
            <p style={{ color: '#94a3b8' }}>Loading…</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.25)' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', color: '#94a3b8', fontWeight: '600' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', color: '#94a3b8', fontWeight: '600' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', color: '#94a3b8', fontWeight: '600' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{u.name || '—'}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{u.email || '—'}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#94a3b8' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && !loading && <p style={{ color: '#94a3b8', marginTop: '1rem' }}>No users yet.</p>}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  )
}
