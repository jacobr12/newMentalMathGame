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
  const [editingScoreId, setEditingScoreId] = useState(null)
  const [editingScoreValue, setEditingScoreValue] = useState('')
  const [scoreUpdateError, setScoreUpdateError] = useState('')
  const [scoreUpdating, setScoreUpdating] = useState(false)

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
    setEditingScoreId(null)
    setScoreUpdateError('')
    try {
      const data = await adminAPI.getDailyChallengeResults(resultsDate, resultsType)
      setResults(data)
    } catch (err) {
      setResultsError(err.message || 'Failed to load results')
    } finally {
      setResultsLoading(false)
    }
  }

  const startEditScore = (row) => {
    setEditingScoreId(row._id)
    setEditingScoreValue(row.score != null ? String(row.score) : '')
    setScoreUpdateError('')
  }

  const cancelEditScore = () => {
    setEditingScoreId(null)
    setEditingScoreValue('')
    setScoreUpdateError('')
  }

  const saveScore = async (row) => {
    const val = parseFloat(editingScoreValue)
    if (!Number.isFinite(val) || val < 0) {
      setScoreUpdateError('Enter a valid non-negative number')
      return
    }
    setScoreUpdating(true)
    setScoreUpdateError('')
    try {
      await adminAPI.updateDailyChallengeScore(row.user?._id, resultsDate, resultsType, val)
      setEditingScoreId(null)
      setEditingScoreValue('')
      await loadResults()
    } catch (err) {
      setScoreUpdateError(err.message || 'Failed to update score')
    } finally {
      setScoreUpdating(false)
    }
  }

  // Build chart data from results: per problem index, avg score and avg time (sec)
  const chartData = results?.results?.length
    ? (() => {
        const byIndex = {}
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

  // Grouped bar data: one row per question, one key per user (time in sec, then points)
  const CHART_COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#6366f1', '#22d3ee', '#34d399', '#fbbf24', '#f472b6', '#fb923c']
  const { groupedBarDataTime, groupedBarDataPoints, userChartKeys } = results?.results?.length
    ? (() => {
        const rows = results.results
        const keys = rows.map((r, i) => ({
          key: `user_${i}`,
          name: r.user?.name || r.user?.email || `User ${i + 1}`,
          color: CHART_COLORS[i % CHART_COLORS.length],
        }))
        const byQuestionTime = {}
        const byQuestionPoints = {}
        for (let q = 0; q < 10; q++) {
          byQuestionTime[q] = { question: `Q${q + 1}` }
          byQuestionPoints[q] = { question: `Q${q + 1}` }
          keys.forEach((k, i) => {
            byQuestionTime[q][k.key] = 0
            byQuestionPoints[q][k.key] = 0
          })
        }
        rows.forEach((r, userIdx) => {
          const k = keys[userIdx].key
          ;(r.answers || []).forEach((a) => {
            const q = a.problemIndex
            if (byQuestionTime[q]) byQuestionTime[q][k] = Math.round((a.timeTaken ?? 0) / 1000 * 100) / 100
            if (byQuestionPoints[q]) byQuestionPoints[q][k] = a.problemScore ?? 0
          })
        })
        const groupedBarDataTime = Object.keys(byQuestionTime)
          .sort((a, b) => Number(a) - Number(b))
          .map((q) => byQuestionTime[q])
        const groupedBarDataPoints = Object.keys(byQuestionPoints)
          .sort((a, b) => Number(a) - Number(b))
          .map((q) => byQuestionPoints[q])
        return { groupedBarDataTime, groupedBarDataPoints, userChartKeys: keys }
      })()
    : { groupedBarDataTime: [], groupedBarDataPoints: [], userChartKeys: [] }

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
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                {results.results?.length ?? 0} submission(s) for {results.date} ({results.type || 'division'}).
              </p>
              {scoreUpdateError && <p style={{ color: '#fca5a5', fontSize: '0.9rem', marginBottom: '1rem' }}>{scoreUpdateError}</p>}
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
                  {groupedBarDataTime.length > 0 && userChartKeys.length > 0 && (
                    <>
                      <h3 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>Time per person per question (seconds)</h3>
                      <div style={{ width: '100%', height: Math.max(280, userChartKeys.length * 24 + 180) }}>
                        <ResponsiveContainer>
                          <BarChart data={groupedBarDataTime} margin={{ top: 8, right: 8, left: 8, bottom: 8 }} barCategoryGap="15%" barGap={2}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                            <XAxis dataKey="question" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} label={{ value: 'Time (s)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 11 } }} />
                            <Tooltip
                              contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px' }}
                              labelStyle={{ color: '#e2e8f0' }}
                            />
                            <Legend />
                            {userChartKeys.map((u) => (
                              <Bar key={u.key} dataKey={u.key} name={u.name} fill={u.color} radius={[2, 2, 0, 0]} />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <h3 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>Points per person per question</h3>
                      <div style={{ width: '100%', height: Math.max(280, userChartKeys.length * 24 + 180) }}>
                        <ResponsiveContainer>
                          <BarChart data={groupedBarDataPoints} margin={{ top: 8, right: 8, left: 8, bottom: 8 }} barCategoryGap="15%" barGap={2}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                            <XAxis dataKey="question" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} label={{ value: 'Points', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 11 } }} />
                            <Tooltip
                              contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px' }}
                              labelStyle={{ color: '#e2e8f0' }}
                            />
                            <Legend />
                            {userChartKeys.map((u) => (
                              <Bar key={u.key} dataKey={u.key} name={u.name} fill={u.color} radius={[2, 2, 0, 0]} />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  )}
                </div>
              )}
              {results.results?.length === 0 ? (
                <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>No submissions for this date and type.</p>
              ) : (
                <>
              {/* Summary: one row per user, total score + edit */}
              <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.25)' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem', color: '#94a3b8', fontWeight: '600', whiteSpace: 'nowrap' }}>User</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem', color: '#94a3b8', fontWeight: '600', minWidth: '140px' }}>Total score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((row) => (
                      <tr key={row._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '0.5rem', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: '500' }}>{row.user?.name || '—'}</span>
                          {row.user?.email && <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem' }}>{row.user.email}</span>}
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: '600', whiteSpace: 'nowrap' }}>
                          {editingScoreId === row._id ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editingScoreValue}
                                onChange={(e) => setEditingScoreValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && saveScore(row)}
                                style={{
                                  width: '72px',
                                  padding: '0.25rem 0.4rem',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(139, 92, 246, 0.5)',
                                  background: 'rgba(15, 23, 42, 0.8)',
                                  color: '#e2e8f0',
                                  fontSize: '0.85rem',
                                }}
                              />
                              <motion.button type="button" onClick={() => saveScore(row)} disabled={scoreUpdating} style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', border: 'none', background: 'rgba(34, 197, 94, 0.3)', color: '#86efac', cursor: scoreUpdating ? 'wait' : 'pointer', fontSize: '0.8rem' }}>{scoreUpdating ? '…' : 'Save'}</motion.button>
                              <motion.button type="button" onClick={cancelEditScore} disabled={scoreUpdating} style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', border: 'none', background: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8', cursor: scoreUpdating ? 'wait' : 'pointer', fontSize: '0.8rem' }}>Cancel</motion.button>
                            </span>
                          ) : (
                            <>
                              {row.score != null ? row.score.toFixed(2) : '—'}
                              <motion.button type="button" onClick={() => startEditScore(row)} style={{ marginLeft: '0.5rem', padding: '0.15rem 0.4rem', borderRadius: '6px', border: '1px solid rgba(139, 92, 246, 0.4)', background: 'transparent', color: '#a78bfa', cursor: 'pointer', fontSize: '0.75rem' }} whileHover={{ background: 'rgba(139, 92, 246, 0.2)' }}>Edit</motion.button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* By question: for each question, show each person's guess, time, points */}
              <h3 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '0.75rem' }}>By question</h3>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((problemIndex) => {
                const correctAnswer = results.results[0]?.answers?.find((a) => a.problemIndex === problemIndex)?.correctAnswer
                return (
                  <div
                    key={problemIndex}
                    style={{
                      marginBottom: '1.25rem',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      background: 'rgba(15, 23, 42, 0.4)',
                    }}
                  >
                    <div style={{ color: '#a78bfa', fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                      Question {problemIndex + 1}
                      {correctAnswer != null && (
                        <span style={{ color: '#94a3b8', fontWeight: '500', marginLeft: '0.5rem' }}> · Correct answer: {typeof correctAnswer === 'number' ? correctAnswer : Number(correctAnswer).toFixed(4)}</span>
                      )}
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.2)' }}>
                            <th style={{ textAlign: 'left', padding: '0.4rem 0.5rem', color: '#94a3b8', fontWeight: '600' }}>User</th>
                            <th style={{ textAlign: 'right', padding: '0.4rem 0.5rem', color: '#94a3b8', fontWeight: '600', whiteSpace: 'nowrap' }}>Guess</th>
                            <th style={{ textAlign: 'right', padding: '0.4rem 0.5rem', color: '#94a3b8', fontWeight: '600', whiteSpace: 'nowrap' }}>Time</th>
                            <th style={{ textAlign: 'right', padding: '0.4rem 0.5rem', color: '#94a3b8', fontWeight: '600', whiteSpace: 'nowrap' }}>Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.results.map((row) => {
                            const a = (row.answers || []).find((ans) => ans.problemIndex === problemIndex)
                            const correct = a && a.userAnswer != null && a.correctAnswer != null && Math.abs(Number(a.userAnswer) - Number(a.correctAnswer)) < 1e-6
                            return (
                              <tr key={row._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '0.4rem 0.5rem' }}>
                                  <span style={{ fontWeight: '500' }}>{row.user?.name || row.user?.email || '—'}</span>
                                </td>
                                <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>
                                  {a != null ? (
                                    <span style={{ color: correct ? '#86efac' : '#fca5a5', fontWeight: '500' }}>{a.userAnswer != null ? Number(a.userAnswer) : '—'}</span>
                                  ) : (
                                    <span style={{ color: '#64748b' }}>—</span>
                                  )}
                                </td>
                                <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', color: '#94a3b8' }}>
                                  {a?.timeTaken != null ? `${(a.timeTaken / 1000).toFixed(1)}s` : '—'}
                                </td>
                                <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', color: '#c4b5fd' }}>
                                  {a?.problemScore != null ? a.problemScore.toFixed(1) : '—'}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
                </>
              )}
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
