import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts'
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

  // Daily challenge results (admin view)
  const [resultsDate, setResultsDate] = useState(todayPacific())
  const [resultsType, setResultsType] = useState('division')
  const [results, setResults] = useState(null)
  const [resultsLoading, setResultsLoading] = useState(false)
  const [resultsError, setResultsError] = useState('')
  const [showCharts, setShowCharts] = useState(false)

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

  const loadResults = async () => {
    setResultsLoading(true)
    setResultsError('')
    setResults(null)
    try {
      const data = await adminAPI.getDailyChallengeResults(resultsDate, resultsType)
      setResults(data)
    } catch (err) {
      setResultsError(err.message || 'Failed to load results')
    } finally {
      setResultsLoading(false)
    }
  }

  // Build chart data from results: per problem index, avg score and avg time (sec)
  const chartData = results?.results?.length
    ? (() => {
        const byIndex = {}
        const n = results.results.length
        results.results.forEach((r) => {
          (r.answers || []).forEach((a) => {
            const i = a.problemIndex
            if (byIndex[i] == null) byIndex[i] = { sumScore: 0, sumTime: 0, count: 0 }
            byIndex[i].sumScore += a.problemScore ?? 0
            byIndex[i].sumTime += (a.timeTaken ?? 0) / 1000
            byIndex[i].count += 1
          })
        })
        return Object.keys(byIndex)
          .sort((a, b) => Number(a) - Number(b))
          .map((i) => ({
            problem: `Q${Number(i) + 1}`,
            avgScore: byIndex[i].count ? Math.round((byIndex[i].sumScore / byIndex[i].count) * 100) / 100 : 0,
            avgTimeSec: byIndex[i].count ? Math.round((byIndex[i].sumTime / byIndex[i].count) * 100) / 100 : 0,
          }))
      })()
    : []

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

        {/* Daily challenge results */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, ...pageTransition }}
          className="glass-panel"
          style={{ padding: '2rem', marginBottom: '2rem' }}
        >
          <h2 style={{ color: '#e2e8f0', fontSize: '1.25rem', marginBottom: '1rem' }}>Daily challenge results</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.95rem' }}>
            View everyone&apos;s answers and scores per question for a given date and challenge type.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.35rem' }}>Date</label>
              <input
                type="date"
                value={resultsDate}
                onChange={(e) => setResultsDate(e.target.value)}
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
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.35rem' }}>Type</label>
              <select
                value={resultsType}
                onChange={(e) => setResultsType(e.target.value)}
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
                <option value="division">Division</option>
                <option value="equation">Equation</option>
                <option value="multiplication">Multiplication</option>
              </select>
            </div>
            <motion.button
              onClick={loadResults}
              disabled={resultsLoading}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '10px',
                border: '1px solid rgba(139, 92, 246, 0.5)',
                background: 'rgba(139, 92, 246, 0.2)',
                color: '#c4b5fd',
                cursor: resultsLoading ? 'wait' : 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
              }}
              whileHover={!resultsLoading ? { background: 'rgba(139, 92, 246, 0.3)' } : {}}
              whileTap={!resultsLoading ? { scale: 0.98 } : {}}
            >
              {resultsLoading ? 'Loading…' : 'Load results'}
            </motion.button>
          </div>
          {resultsError && <p style={{ color: '#fca5a5', marginBottom: '1rem', fontSize: '0.9rem' }}>{resultsError}</p>}
          {results && (
            <>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                {results.results?.length ?? 0} submission(s) for {results.date} ({results.type || 'division'}).
              </p>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={showCharts}
                    onChange={(e) => setShowCharts(e.target.checked)}
                  />
                  Show visualizations
                </label>
              </div>
              {showCharts && chartData.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '0.75rem' }}>Average score per question</h3>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                        <XAxis dataKey="problem" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px' }}
                          labelStyle={{ color: '#e2e8f0' }}
                        />
                        <Bar dataKey="avgScore" name="Avg score" fill="rgba(139, 92, 246, 0.8)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <h3 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>Average time per question (seconds)</h3>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                        <XAxis dataKey="problem" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px' }}
                          labelStyle={{ color: '#e2e8f0' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="avgTimeSec" name="Avg time (s)" stroke="#a78bfa" strokeWidth={2} dot={{ fill: '#7c3aed' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.25)' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem', color: '#94a3b8', fontWeight: '600', whiteSpace: 'nowrap' }}>User</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem', color: '#94a3b8', fontWeight: '600' }}>Total</th>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => (
                        <th key={idx} style={{ textAlign: 'center', padding: '0.5rem', color: '#94a3b8', fontWeight: '600', minWidth: '72px' }} title={`Question ${idx + 1}`}>
                          Q{idx + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((row) => {
                      const answersByIndex = {}
                      ;(row.answers || []).forEach((a) => { answersByIndex[a.problemIndex] = a })
                      return (
                        <tr key={row._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <td style={{ padding: '0.5rem', whiteSpace: 'nowrap' }}>
                            <span style={{ fontWeight: '500' }}>{row.user?.name || '—'}</span>
                            {row.user?.email && <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem' }}>{row.user.email}</span>}
                          </td>
                          <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: '600' }}>{row.score != null ? row.score.toFixed(2) : '—'}</td>
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => {
                            const a = answersByIndex[idx]
                            if (!a) return <td key={idx} style={{ padding: '0.35rem', textAlign: 'center', color: '#64748b' }}>—</td>
                            const correct = a.userAnswer != null && a.correctAnswer != null && Math.abs(Number(a.userAnswer) - Number(a.correctAnswer)) < 1e-6
                            return (
                              <td key={idx} style={{ padding: '0.35rem', textAlign: 'center', minWidth: '72px' }} title={`Correct: ${a.correctAnswer != null ? a.correctAnswer : '?'} | ${(a.timeTaken / 1000).toFixed(1)}s`}>
                                <span style={{ color: correct ? '#86efac' : '#fca5a5' }}>{a.userAnswer != null ? Number(a.userAnswer) : '—'}</span>
                                <span style={{ color: '#64748b', fontSize: '0.75rem' }}> / {a.problemScore != null ? a.problemScore.toFixed(0) : '—'}</span>
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {results.results?.length === 0 && <p style={{ color: '#94a3b8', marginTop: '1rem' }}>No submissions for this date and type.</p>}
            </>
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
