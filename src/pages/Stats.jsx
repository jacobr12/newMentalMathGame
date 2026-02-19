import { motion } from 'framer-motion'
import { useEffect, useState, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Background3D from '../components/Background3D'
import Navigation from '../components/Navigation'
import { statsAPI, dailyChallengeAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const DAILY_CHALLENGE_TYPES = [
  { id: 'division', label: 'Division' },
  { id: 'equation', label: 'Equation' },
  { id: 'multiplication', label: 'Large multiplication' },
]
const DAILY_VALID_TYPES = ['division', 'equation', 'multiplication']

function todayPacific() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })
}

const statTransition = { type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.35 }

const StatCard = ({ title, value, subtitle, icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, ...statTransition }}
    className="glass-panel"
    style={{ padding: '2rem' }}
    whileHover={{ scale: 1.02, borderColor: 'rgba(139, 92, 246, 0.4)', boxShadow: '0 0 48px rgba(99, 102, 241, 0.12)' }}
  >
    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
    <h3 style={{
      color: '#94a3b8',
      fontSize: '0.9rem',
      fontWeight: '500',
      margin: '0 0 0.5rem 0',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    }}>
      {title}
    </h3>
    <p className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '700', margin: '0 0 0.25rem 0' }}>
      {value}
    </p>
    {subtitle && (
      <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
        {subtitle}
      </p>
    )}
  </motion.div>
)

const CategoryBox = ({ title, attempts, avgTime, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, ...statTransition }}
    className="glass-panel"
    style={{
      padding: '1.5rem',
      borderColor: 'rgba(139, 92, 246, 0.18)',
    }}
    whileHover={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}
  >
    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'capitalize' }}>{title}</div>
    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#6366f1', marginBottom: '0.5rem' }}>
      {attempts} {attempts === 1 ? 'problem' : 'problems'}
    </div>
    {avgTime !== undefined && avgTime > 0 && (
      <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
        Avg time: {avgTime}s
      </div>
    )}
  </motion.div>
)

export default function Stats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { isAuthenticated } = useAuth()
  const [historyResults, setHistoryResults] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyTypeFilter, setHistoryTypeFilter] = useState('all')
  const [historyDays, setHistoryDays] = useState(30)
  const [whoDidDate, setWhoDidDate] = useState(todayPacific())
  const [whoDidType, setWhoDidType] = useState('division')
  const [whoDidList, setWhoDidList] = useState([])
  const [whoDidLoading, setWhoDidLoading] = useState(false)
  const [whoDidFetched, setWhoDidFetched] = useState(false)
  const [whoDidMyResult, setWhoDidMyResult] = useState(null)
  const [whoDidProblems, setWhoDidProblems] = useState([])

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      try {
        const data = await statsAPI.getStats()
        setStats(data)
      } catch (err) {
        console.error('Error loading stats:', err)
        setError(err.message || 'Failed to load stats')
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) return
    setHistoryLoading(true)
    try {
      const data = await dailyChallengeAPI.getMyHistory({
        type: historyTypeFilter === 'all' ? undefined : historyTypeFilter,
        days: historyDays,
      })
      setHistoryResults(data.results || [])
    } catch (_) {
      setHistoryResults([])
    } finally {
      setHistoryLoading(false)
    }
  }, [isAuthenticated, historyTypeFilter, historyDays])

  useEffect(() => {
    if (isAuthenticated) fetchHistory()
  }, [isAuthenticated, fetchHistory])

  const fetchWhoDidDay = useCallback(async () => {
    setWhoDidLoading(true)
    setWhoDidFetched(false)
    setWhoDidMyResult(null)
    setWhoDidProblems([])
    try {
      const [leaderData, myResultData, problemsData] = await Promise.all([
        dailyChallengeAPI.getLeaderboard(whoDidDate, 50, whoDidType),
        dailyChallengeAPI.getMyResult(whoDidDate, whoDidType).catch(() => null),
        dailyChallengeAPI.getProblems(whoDidDate, whoDidType).catch(() => ({ problems: [] })),
      ])
      setWhoDidList(leaderData.leaderboard || [])
      setWhoDidMyResult(myResultData && myResultData.score != null ? myResultData : null)
      setWhoDidProblems(problemsData?.problems || [])
    } catch (_) {
      setWhoDidList([])
    } finally {
      setWhoDidLoading(false)
      setWhoDidFetched(true)
    }
  }, [whoDidDate, whoDidType])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <Background3D />
        <Navigation />
        <div style={{ position: 'relative', zIndex: 10, padding: '4rem' }}>
          <p style={{ color: '#94a3b8' }}>Loading statistics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <Background3D />
        <Navigation />
        <div style={{ position: 'relative', zIndex: 10, padding: '4rem' }}>
          <p style={{ color: '#ef4444' }}>{error}</p>
        </div>
      </div>
    )
  }

  const totalProblems = stats.totalProblems || 0
  const currentStreak = stats.currentStreak || 0
  const averageTime = stats.averageTime ? `${stats.averageTime.toFixed(2)}s` : '0.00s'
  
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Background3D />
      <Navigation />
      
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '3rem 2rem',
      }}>
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={statTransition}
        >
          <h1 className="gradient-text" style={{ fontSize: '3rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
            Your Statistics
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: '0 0 3rem 0' }}>
            Track your progress across all categories
          </p>
        </motion.div>

        {/* Overall Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem',
        }}>
          <StatCard
            title="Total Problems"
            value={totalProblems.toLocaleString()}
            subtitle="All time"
            icon="📊"
            delay={0.1}
          />
          <StatCard
            title="Current Streak"
            value={currentStreak}
            subtitle="Days in a row"
            icon="🔥"
            delay={0.2}
          />
          <StatCard
            title="Avg Time"
            value={averageTime}
            subtitle="Per problem"
            icon="⚡"
            delay={0.3}
          />
        </div>

        {/* Daily challenge past results (signed-in only) */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, ...statTransition }}
            className="glass-panel"
            style={{ padding: '2rem', marginBottom: '2rem' }}
          >
            <h2 style={{ color: '#e2e8f0', fontSize: '1.8rem', marginTop: 0, marginBottom: '0.5rem' }}>
              Daily challenge history
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Your past scores and how you compared to the average score that day for each challenge type.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Challenge type</label>
                <select
                  value={historyTypeFilter}
                  onChange={(e) => setHistoryTypeFilter(e.target.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    background: 'rgba(15, 23, 42, 0.6)',
                    color: '#e2e8f0',
                    fontSize: '0.9rem',
                    minWidth: '140px',
                  }}
                >
                  <option value="all">All types</option>
                  {DAILY_CHALLENGE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Time range</label>
                <select
                  value={historyDays}
                  onChange={(e) => setHistoryDays(Number(e.target.value))}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    background: 'rgba(15, 23, 42, 0.6)',
                    color: '#e2e8f0',
                    fontSize: '0.9rem',
                    minWidth: '130px',
                  }}
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </div>
            </div>
            {historyLoading ? (
              <p style={{ color: '#94a3b8' }}>Loading history…</p>
            ) : historyResults.length === 0 ? (
              <p style={{ color: '#64748b' }}>No past results in this range. Complete daily challenges to see your history here.</p>
            ) : (
              (() => {
                const typesToShow = historyTypeFilter === 'all' ? DAILY_VALID_TYPES : [historyTypeFilter]
                const buildChartData = (type) => {
                  const filtered = historyResults.filter((r) => r.type === type)
                  return [...filtered].sort((a, b) => a.date.localeCompare(b.date)).map((r) => ({
                    date: r.date,
                    score: r.score,
                    avgScoreThatDay: r.avgScoreThatDay,
                  }))
                }
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {typesToShow.map((typeId) => {
                      const chartData = buildChartData(typeId)
                      if (chartData.length === 0) return null
                      const label = DAILY_CHALLENGE_TYPES.find((t) => t.id === typeId)?.label || typeId
                      const allValues = chartData.flatMap((d) => [d.score, d.avgScoreThatDay].filter((v) => v != null && Number.isFinite(v)))
                      const dataMin = allValues.length ? Math.min(...allValues) : 0
                      const dataMax = allValues.length ? Math.max(...allValues) : 1000
                      const range = dataMax - dataMin
                      const padding = range < 1 ? 25 : Math.max(20, range * 0.12)
                      const yMin = Math.max(0, dataMin - padding)
                      const yMax = Math.min(1000, dataMax + padding)
                      const yDomain = [yMin, yMax]
                      return (
                        <div key={typeId}>
                          <h3 style={{ color: '#a78bfa', fontSize: '1rem', marginBottom: '0.75rem' }}>{label}</h3>
                          <div style={{ width: '100%', height: 240 }}>
                            <ResponsiveContainer>
                              <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={yDomain} />
                                <Tooltip
                                  contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px' }}
                                  labelStyle={{ color: '#e2e8f0' }}
                                  formatter={(value, name) => [value != null ? Number(value).toFixed(1) : '—', name]}
                                  labelFormatter={(label) => `Date: ${label}`}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="score" name="Your score" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                                <Line type="monotone" dataKey="avgScoreThatDay" name="Avg that day" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={{ fill: '#64748b' }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()
            )}
            {/* Who did this day? */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <h3 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '0.75rem' }}>Who did this day?</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
                See who completed a daily challenge on a specific date.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Date</label>
                  <input
                    type="date"
                    value={whoDidDate}
                    onChange={(e) => setWhoDidDate(e.target.value)}
                    style={{
                      padding: '0.45rem 0.6rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      background: 'rgba(15, 23, 42, 0.6)',
                      color: '#e2e8f0',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Challenge</label>
                  <select
                    value={whoDidType}
                    onChange={(e) => setWhoDidType(e.target.value)}
                    style={{
                      padding: '0.45rem 0.6rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      background: 'rgba(15, 23, 42, 0.6)',
                      color: '#e2e8f0',
                      fontSize: '0.9rem',
                      minWidth: '130px',
                    }}
                  >
                    {DAILY_CHALLENGE_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <motion.button
                  type="button"
                  onClick={fetchWhoDidDay}
                  disabled={whoDidLoading}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(139, 92, 246, 0.5)',
                    background: 'rgba(139, 92, 246, 0.2)',
                    color: '#c4b5fd',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    cursor: whoDidLoading ? 'wait' : 'pointer',
                  }}
                  whileHover={!whoDidLoading ? { background: 'rgba(139, 92, 246, 0.3)' } : {}}
                  whileTap={!whoDidLoading ? { scale: 0.98 } : {}}
                >
                  {whoDidLoading ? 'Loading…' : 'Show'}
                </motion.button>
              </div>
              {whoDidList.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  padding: '1rem',
                  borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(139, 92, 246, 0.15)',
                }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem', width: '100%', marginBottom: '0.25rem' }}>
                    {whoDidDate} · {DAILY_CHALLENGE_TYPES.find((t) => t.id === whoDidType)?.label} — {whoDidList.length} {whoDidList.length === 1 ? 'person' : 'people'}
                  </span>
                  {whoDidList.map((row) => (
                    <span
                      key={row.userId || row.name}
                      style={{
                        padding: '0.35rem 0.6rem',
                        borderRadius: '8px',
                        background: 'rgba(139, 92, 246, 0.12)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        color: '#e2e8f0',
                        fontSize: '0.85rem',
                      }}
                    >
                      #{row.rank} {row.name || 'Anonymous'} <span style={{ color: '#a78bfa', fontWeight: '600' }}>{row.score} pts</span>
                    </span>
                  ))}
                </div>
              )}
              {whoDidMyResult && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                }}>
                  <h4 style={{ color: '#e2e8f0', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Your result · {whoDidMyResult.score?.toFixed(1)} pts</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(whoDidMyResult.answers || []).sort((a, b) => (a.problemIndex ?? 0) - (b.problemIndex ?? 0)).map((a, i) => {
                      const prob = whoDidProblems.find((p) => p.problemIndex === a.problemIndex)
                      const problemText = prob
                        ? (prob.expression != null ? prob.expression : whoDidType === 'multiplication' ? `${prob.a} × ${prob.b}` : `${prob.a} ÷ ${prob.b}`)
                        : `Q${(a.problemIndex ?? i) + 1}`
                      const correct = a.userAnswer != null && a.correctAnswer != null && Math.abs(Number(a.userAnswer) - Number(a.correctAnswer)) < 1e-6
                      return (
                        <div
                          key={a.problemIndex ?? i}
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            background: 'rgba(139, 92, 246, 0.08)',
                            border: '1px solid rgba(139, 92, 246, 0.15)',
                            fontSize: '0.85rem',
                          }}
                        >
                          <span style={{ color: '#94a3b8', minWidth: '1.5rem' }}>#{((a.problemIndex ?? i) + 1)}</span>
                          <span style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>{problemText}</span>
                          <span style={{ color: '#64748b' }}>→</span>
                          <span style={{ color: correct ? '#86efac' : '#fca5a5', fontWeight: '600' }}>{a.userAnswer != null ? Number(a.userAnswer) : '—'}</span>
                          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                            (correct: {a.correctAnswer != null ? Number(a.correctAnswer).toFixed(4) : '—'})
                          </span>
                          <span style={{ color: '#a78bfa', marginLeft: 'auto' }}>{a.problemScore != null ? a.problemScore.toFixed(1) : '—'} pts</span>
                          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{(a.timeTaken / 1000).toFixed(1)}s</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {whoDidFetched && !whoDidMyResult && whoDidList.length > 0 && (
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.75rem' }}>You didn’t do this challenge on this date.</p>
              )}
              {whoDidList.length === 0 && !whoDidLoading && (
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  {whoDidFetched ? 'No one completed this challenge on this date.' : 'Pick a date and challenge, then click Show to see who completed it.'}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Difficulty Stats: High Scores & Average Scores */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, ...statTransition }}
          className="glass-panel"
          style={{ padding: '2rem', marginBottom: '2rem' }}
        >
          <h2 style={{ color: '#e2e8f0', fontSize: '1.8rem', marginTop: 0, marginBottom: '1.5rem' }}>
            Difficulty Breakdown
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {['easy', 'medium', 'hard', 'custom'].map((d) => {
              const high = stats.highestScoreByDifficulty?.[d] ?? 0
              const avg = stats.averageScoreByDifficulty?.[d] ?? 0
              const attempts = stats.difficultyStats?.[d]?.problems ?? 0
              const correct = stats.difficultyStats?.[d]?.correct ?? 0
              const sessions = stats.sessionCountByDifficulty?.[d] ?? 0
              return (
                <motion.div
                  key={d}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '14px',
                    background: 'rgba(10, 10, 30, 0.4)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.06)',
                  }}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(99,102,241,0.4)' }}
                >
                  <div style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'capitalize', marginBottom: '1rem', fontWeight: 600 }}>
                    {d} Mode
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Best Score</div>
                    <div style={{ fontSize: '1.8rem', color: '#6366f1', fontWeight: 700 }}>
                      {high}
                    </div>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Average Score</div>
                    <div style={{ fontSize: '1.3rem', color: '#ec4899', fontWeight: 600 }}>
                      {avg > 0 ? avg.toFixed(1) : '0.0'}
                    </div>
                    {sessions > 0 && (
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                        from {sessions} session{sessions !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(99,102,241,0.1)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Problems Solved</div>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                      {attempts} {attempts === 1 ? 'problem' : 'problems'}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Category Stats (matches Home page: Easy, Medium, Hard, practice modes, Custom) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, ...statTransition }}
          className="glass-panel"
          style={{ padding: '2rem', marginBottom: '2rem' }}
        >
          <h2 style={{ color: '#e2e8f0', fontSize: '1.8rem', marginTop: 0, marginBottom: '0.5rem' }}>
            By Category
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Same categories as on the Home page
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {[
              { key: 'easy', label: 'Easy' },
              { key: 'medium', label: 'Medium' },
              { key: 'hard', label: 'Hard' },
              { key: 'addition', label: 'Just Addition' },
              { key: 'division', label: 'Just Division' },
              { key: 'multiplication', label: 'Just Multiplication' },
              { key: '2digit-mult', label: '2-Digit Multiplication' },
              { key: 'custom', label: 'Custom' },
            ].map(({ key, label }) => {
              const data = stats.categoryStats?.[key] || {}
              const high = data.highScore ?? 0
              const avg = data.avgScore ?? 0
              const problems = data.problems ?? 0
              const sessions = data.sessionCount ?? 0
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '14px',
                    background: 'rgba(10, 10, 30, 0.4)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.06)',
                  }}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(139, 92, 246, 0.35)' }}
                >
                  <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.75rem', fontWeight: 600 }}>
                    {label}
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Best</span>
                    <div style={{ fontSize: '1.5rem', color: '#6366f1', fontWeight: 700 }}>{high}</div>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Avg</span>
                    <div style={{ fontSize: '1.1rem', color: '#ec4899', fontWeight: 600 }}>
                      {avg > 0 ? avg.toFixed(1) : '0.0'}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', borderTop: '1px solid rgba(139,92,246,0.15)', paddingTop: '0.5rem' }}>
                    {problems} problems · {sessions} session{sessions !== 1 ? 's' : ''}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Operation Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, ...statTransition }}
          className="glass-panel"
          style={{ padding: '2rem', marginBottom: '2rem' }}
        >
          <h2 style={{ color: '#e2e8f0', fontSize: '1.8rem', marginTop: 0, marginBottom: '1.5rem' }}>
            By Operation
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {Object.entries(stats.operationStats || {}).map(([op, data]) => {
              const opSymbol = op === 'add' ? '+' : op === 'sub' ? '-' : op === 'mul' ? '×' : op === 'div' ? '÷' : ''
              return (
                <CategoryBox
                  key={op}
                  title={`${op.charAt(0).toUpperCase() + op.slice(1)} (${opSymbol})`}
                  attempts={data.attempts || 0}
                  avgTime={data.avgTime || 0}
                />
              )
            })}
          </div>
        </motion.div>

        {/* Digit Category Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, ...statTransition }}
          className="glass-panel"
          style={{ padding: '2rem', marginBottom: '2rem' }}
        >
          <h2 style={{ color: '#e2e8f0', fontSize: '1.8rem', marginTop: 0, marginBottom: '1.5rem' }}>
            By Digit Difficulty
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {Object.entries(stats.digitCategoryStats || {}).map(([digit, data]) => {
              const digitLabel = digit === '1d' ? 'Single Digit' : digit === '2d' ? '2 Digit' : '3+ Digit'
              return (
                <CategoryBox
                  key={digit}
                  title={digitLabel}
                  attempts={data.attempts || 0}
                  avgTime={data.avgTime || 0}
                />
              )
            })}
          </div>
        </motion.div>

        {/* Combined Category Stats: full grid for every operation × digit */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, ...statTransition }}
          className="glass-panel"
          style={{ padding: '2rem' }}
        >
          <h2 style={{ color: '#e2e8f0', fontSize: '1.8rem', marginTop: 0, marginBottom: '0.5rem' }}>
            Operation + Digit Combinations
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Digit = lowest number in the problem (for ÷, lowest of divisor or quotient).
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(140px, 1fr) repeat(3, 1fr)',
            gap: '1rem',
            alignItems: 'stretch',
          }}>
            <div style={{ padding: '0.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }} />
            {['1d', '2d', '3d+'].map((d) => (
              <div key={d} style={{ padding: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center' }}>
                {d === '1d' ? 'Single digit' : d === '2d' ? '2 digit' : '3+ digit'}
              </div>
            ))}
            {[
              { op: 'add', label: 'Addition (+)' },
              { op: 'sub', label: 'Subtraction (−)' },
              { op: 'mul', label: 'Multiplication (×)' },
              { op: 'div', label: 'Division (÷)' },
            ].map(({ op, label }) => {
              const combined = stats.combinedCategoryStats || {}
              const isMap = combined instanceof Map
              const getData = (key) => (isMap ? combined.get(key) || {} : combined[key] || {})
              return (
                <div key={op} style={{ display: 'contents' }}>
                  <div style={{ padding: '0.75rem', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                    {label}
                  </div>
                  {['1d', '2d', '3d+'].map((digit) => {
                    const key = `${op}_${digit}`
                    const data = getData(key)
                    const attempts = data.attempts || 0
                    const avgTime = data.avgTime
                    return (
                      <div
                        key={key}
                        style={{
                          padding: '1rem',
                          borderRadius: '12px',
                          background: 'rgba(10, 10, 30, 0.4)',
                          border: '1px solid rgba(139, 92, 246, 0.2)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          minHeight: '60px',
                        }}
                      >
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#6366f1' }}>
                          {attempts} {attempts === 1 ? 'problem' : 'problems'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                          {avgTime != null && avgTime > 0 ? `Avg ${avgTime}s` : '—'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
