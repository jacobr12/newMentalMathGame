import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Background3D from '../components/Background3D'
import Navigation from '../components/Navigation'
import { dailyChallengeAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const pageTransition = { type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.35 }

// Must match backend: two-phase speed (full → drop to 50% by T1 → drop to 0 by T2)
const SPEED_PARAMS = {
  division: { graceSeconds: 5, T1: 15, T2: 25 },
  equation: { graceSeconds: 10, T1: 20, T2: 45 },
  multiplication: { graceSeconds: 7, T1: 15, T2: 28 },
}
function speedPtsFromElapsedMs(elapsedMs, type) {
  const p = SPEED_PARAMS[type] || SPEED_PARAMS.division
  const t = elapsedMs / 1000
  if (t <= p.graceSeconds) return 100
  if (t <= p.T1) return Math.round(100 - (t - p.graceSeconds) / (p.T1 - p.graceSeconds) * 50)
  if (t <= p.T2) return Math.round(50 - (t - p.T1) / (p.T2 - p.T1) * 50)
  return 0
}

const CHALLENGE_TYPES = [
  { id: 'division', label: 'Division', desc: '10 division problems. Full speed 0–5s, then drops until 15s, then drops to zero by 25s.', timeHint: 'Division: full speed bonus 0–5s, then score drops until 15s, then drops more after. Don’t go over 25s.' },
  { id: 'equation', label: 'Equation', desc: '10 mixed expressions. Full speed 0–10s, then drops until 20s, then drops to zero by 45s.', timeHint: 'Equation: full speed 0–10s, then drops until 20s, then drops more. Don’t go over 45s.' },
  { id: 'multiplication', label: 'Large multiplication', desc: '10 big multiplications. Full speed 0–7s, then drops until 15s, then drops to zero by 28s.', timeHint: 'Multiplication: full speed 0–7s, then drops until 15s, then drops more. Don’t go over 28s.' },
]
const VALID_TYPES = ['division', 'equation', 'multiplication']

// Daily challenges reset at midnight Pacific — use same date as backend
function todayStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })
}

export default function DailyChallenge() {
  const [searchParams] = useSearchParams()
  const typeFromUrl = searchParams.get('type')
  const initialType = VALID_TYPES.includes(typeFromUrl) ? typeFromUrl : 'division'
  const [challengeType, setChallengeType] = useState(initialType)
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [step, setStep] = useState('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [userAnswer, setUserAnswer] = useState('')
  const [problemStartTime, setProblemStartTime] = useState(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [result, setResult] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [myScore, setMyScore] = useState(null)
  const [historyResults, setHistoryResults] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyTypeFilter, setHistoryTypeFilter] = useState('all')
  const [historyDays, setHistoryDays] = useState(30)
  const inputRef = useRef(null)
  const { isAuthenticated } = useAuth()
  const date = todayStr()

  const fetchProblems = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await dailyChallengeAPI.getProblems(date, challengeType)
      setProblems(data.problems || [])
    } catch (err) {
      setError(err.message || 'Failed to load today\'s challenge')
    } finally {
      setLoading(false)
    }
  }, [date, challengeType])

  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await dailyChallengeAPI.getLeaderboard(date, 15, challengeType)
      setLeaderboard(data.leaderboard || [])
    } catch (_) {}
  }, [date, challengeType])

  const fetchMyScore = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const data = await dailyChallengeAPI.getMyScore(date, challengeType)
      setMyScore(data.submitted ? data.score : null)
    } catch (_) {}
  }, [date, challengeType, isAuthenticated])

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
    fetchProblems()
    fetchLeaderboard()
    fetchMyScore()
  }, [fetchProblems, fetchLeaderboard, fetchMyScore])

  useEffect(() => {
    if (isAuthenticated) fetchHistory()
  }, [isAuthenticated, fetchHistory])

  useEffect(() => {
    if (VALID_TYPES.includes(typeFromUrl)) {
      setChallengeType(typeFromUrl)
      setStep('intro')
      setResult(null)
      setMyScore(null)
    }
  }, [typeFromUrl])

  const startChallenge = () => {
    setStep('play')
    setCurrentIndex(0)
    setAnswers([])
    setUserAnswer('')
    setResult(null)
    const now = Date.now()
    setProblemStartTime(now)
    setElapsedMs(0)
    inputRef.current?.focus()
  }

  const switchType = (type) => {
    if (step === 'play') return
    setChallengeType(type)
    setStep('intro')
    setResult(null)
    setMyScore(null)
  }

  const submitAnswer = () => {
    const raw = userAnswer.trim().replace(/,/g, '.')
    const num = parseFloat(raw)
    if (problems.length === 0 || currentIndex >= problems.length) return
    const problem = problems[currentIndex]
    const timeTaken = Date.now() - (problemStartTime || Date.now())
    const newAnswers = [...answers, { problemIndex: problem.problemIndex, userAnswer: isNaN(num) ? 0 : num, timeTaken }]
    setAnswers(newAnswers)
    setUserAnswer('')
    if (currentIndex + 1 >= problems.length) {
      finishChallenge(newAnswers)
      return
    }
    setCurrentIndex((i) => i + 1)
    setProblemStartTime(Date.now())
    setElapsedMs(0)
    inputRef.current?.focus()
  }

  // Live timer and speed pts during play
  useEffect(() => {
    if (step !== 'play' || problemStartTime == null) return
    const tick = () => setElapsedMs(Date.now() - problemStartTime)
    tick()
    const id = setInterval(tick, 200)
    return () => clearInterval(id)
  }, [step, problemStartTime, currentIndex])

  const finishChallenge = async (finalAnswers) => {
    setStep('results')
    setResult(null)
    try {
      if (isAuthenticated) {
        const data = await dailyChallengeAPI.submit(date, finalAnswers, challengeType)
        setResult({
          score: data.score,
          bestScore: data.bestScore,
          isNewBest: data.isNewBest,
          breakdown: data.breakdown || [],
        })
      } else {
        const data = await dailyChallengeAPI.getScoreOnly(date, finalAnswers, challengeType)
        setResult({
          score: data.score,
          bestScore: data.score,
          isNewBest: false,
          breakdown: data.breakdown || [],
        })
      }
      fetchLeaderboard()
      fetchMyScore()
    } catch (err) {
      if (err.message && err.message.includes('already completed')) {
        fetchMyScore()
      }
      setResult({ score: 0, breakdown: [], error: err.message })
    }
  }

  const currentProblem = problems[currentIndex]

  if (loading && problems.length === 0) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <Background3D />
        <Navigation />
        <div style={{ position: 'relative', zIndex: 10, padding: '4rem', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8' }}>Loading today&apos;s challenge...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <Background3D />
        <Navigation />
        <div style={{ position: 'relative', zIndex: 10, padding: '4rem', textAlign: 'center' }}>
          <p style={{ color: '#ef4444' }}>{error}</p>
          <Link to="/" style={{ color: '#a78bfa', marginTop: '1rem', display: 'inline-block' }}>Back to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Background3D />
      <Navigation />
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '700px', margin: '0 auto', padding: '3rem 2rem' }}>
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={pageTransition}
          className="gradient-text"
          style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.5rem' }}
        >
          Daily Challenge
        </motion.h1>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {CHALLENGE_TYPES.map(({ id, label }) => (
            <motion.button
              key={id}
              type="button"
              onClick={() => switchType(id)}
              transition={pageTransition}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '14px',
                border: challengeType === id ? '1px solid rgba(139, 92, 246, 0.6)' : '1px solid rgba(139, 92, 246, 0.25)',
                background: challengeType === id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(12, 12, 28, 0.5)',
                color: challengeType === id ? '#e2e8f0' : '#94a3b8',
                fontWeight: challengeType === id ? '600' : '500',
                cursor: step === 'play' ? 'default' : 'pointer',
                fontSize: '0.95rem',
              }}
              whileHover={step !== 'play' ? { borderColor: 'rgba(139, 92, 246, 0.5)', background: 'rgba(139, 92, 246, 0.12)' } : {}}
              whileTap={step !== 'play' ? { scale: 0.98 } : {}}
            >
              {label}
            </motion.button>
          ))}
        </div>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
          {CHALLENGE_TYPES.find((t) => t.id === challengeType)?.desc} One attempt per day. Score = accuracy × speed. Max 1000 pts.
        </p>

        {step === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={pageTransition}
            className="glass-panel"
            style={{ padding: '2.5rem' }}
          >
            <p style={{ color: '#e2e8f0', marginBottom: '1rem' }}>
              Today&apos;s challenge: <strong>{date}</strong> · <strong>{CHALLENGE_TYPES.find((t) => t.id === challengeType)?.label}</strong>
            </p>
            {myScore != null && (
              <p style={{ color: '#10b981', marginBottom: '1.5rem', fontWeight: '600' }}>
                You&apos;ve already completed today&apos;s challenge. Your score: <strong>{myScore}</strong> pts
              </p>
            )}
            <p style={{ color: '#94a3b8', marginBottom: '0.75rem', lineHeight: 1.6 }}>
              You&apos;ll get 10 problems. One attempt per day. Type your answer (decimal allowed) and press Enter.
            </p>
            <p style={{ color: '#94a3b8', marginBottom: '0.5rem', lineHeight: 1.6 }}>
              <strong style={{ color: '#e2e8f0' }}>Scoring:</strong> Get in the ballpark—guess if you need to; it&apos;s better to answer close and fast than to take too long. A <strong>Speed</strong> number (max 100 pts per problem) is shown and drops as time passes. Stay under the limit or you get 0 speed pts.
            </p>
            <p style={{ color: '#a78bfa', marginBottom: '1.5rem', lineHeight: 1.6, fontSize: '0.95rem' }}>
              {CHALLENGE_TYPES.find((t) => t.id === challengeType)?.timeHint}
            </p>
            <motion.button
              onClick={startChallenge}
              disabled={myScore != null}
              transition={pageTransition}
              style={{
                padding: '1rem 2.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(139, 92, 246, 0.5)',
                background: myScore != null ? 'rgba(80,80,80,0.4)' : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                color: 'white',
                fontWeight: '600',
                fontSize: '1.1rem',
                cursor: myScore != null ? 'not-allowed' : 'pointer',
                boxShadow: myScore != null ? 'none' : '0 0 36px rgba(99, 102, 241, 0.28)',
                opacity: myScore != null ? 0.8 : 1,
              }}
              whileHover={myScore != null ? {} : { scale: 1.02, boxShadow: '0 0 44px rgba(99, 102, 241, 0.35)' }}
              whileTap={myScore != null ? {} : { scale: 0.98 }}
            >
              {myScore != null ? 'Already completed' : 'Start challenge'}
            </motion.button>
          </motion.div>
        )}

        {step === 'play' && currentProblem != null && (
          <motion.div
            key={currentIndex}
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0 }}
            className="glass-panel-strong"
            style={{ padding: '3rem', textAlign: 'center' }}
          >
            <div style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              Problem {currentIndex + 1} of {problems.length}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                Time: <strong style={{ color: '#e2e8f0' }}>{(elapsedMs / 1000).toFixed(1)}s</strong>
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                Speed: <strong style={{ color: speedPtsFromElapsedMs(elapsedMs, challengeType) >= 50 ? '#86efac' : speedPtsFromElapsedMs(elapsedMs, challengeType) > 0 ? '#fcd34d' : '#f87171' }}>{speedPtsFromElapsedMs(elapsedMs, challengeType)} pts</strong>
              </span>
            </div>
            <div style={{ fontSize: challengeType === 'equation' ? '2rem' : '3.5rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '2rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {challengeType === 'equation' && currentProblem.expression != null
                ? `${String(currentProblem.expression).replace(/\*/g, '×').replace(/\//g, '÷')} = ?`
                : challengeType === 'multiplication'
                  ? `${currentProblem.a} × ${currentProblem.b} = ?`
                  : `${currentProblem.a} ÷ ${currentProblem.b} = ?`}
            </div>
            <motion.input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
              placeholder="Your answer..."
              className="focus-ring"
              style={{
                width: '100%',
                maxWidth: '280px',
                padding: '1.25rem',
                borderRadius: '16px',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                background: 'rgba(12, 12, 28, 0.6)',
                color: '#e2e8f0',
                fontSize: '1.75rem',
                textAlign: 'center',
                outline: 'none',
              }}
              autoFocus
            />
            <div style={{ marginTop: '1.5rem' }}>
              <motion.button
                onClick={submitAnswer}
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'rgba(139, 92, 246, 0.8)',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 'results' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={pageTransition}
            className="glass-panel"
            style={{ padding: '2rem', marginBottom: '2rem' }}
          >
            <h2 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>Your result</h2>
            {result?.error && <p style={{ color: '#ef4444' }}>{result.error}</p>}
            {result && !result.error && (
              <>
                <p style={{ fontSize: '2.5rem', fontWeight: '700', color: '#6366f1', marginBottom: '0.5rem' }}>
                  {result.score} pts
                </p>
                {result.isNewBest && <p style={{ color: '#10b981' }}>New best for today!</p>}
                {result.breakdown?.length > 0 && (
                  <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                    {result.breakdown.map((r, i) => (
                      <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(139,92,246,0.2)', color: '#94a3b8', fontSize: '0.9rem' }}>
                        #{i + 1}: your {r.userAnswer} (actual {typeof r.correctAnswer === 'number' ? r.correctAnswer.toFixed(2) : r.correctAnswer}) · {r.problemScore?.toFixed(1)} pts · {(r.timeTaken / 1000).toFixed(1)}s
                      </div>
                    ))}
                  </div>
                )}
                {!isAuthenticated && (
                  <p style={{ color: '#f59e0b', marginTop: '1rem', fontSize: '0.95rem' }}>
                    Sign in to save your score and appear on the leaderboard.
                  </p>
                )}
                <motion.button
                  onClick={() => { setStep('intro'); setResult(null); }}
                  style={{
                    marginTop: '1.5rem',
                    padding: '0.6rem 1.5rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    background: 'transparent',
                    color: '#a78bfa',
                    cursor: 'pointer',
                  }}
                  whileHover={{ scale: 1.03 }}
                >
                  Play again
                </motion.button>
              </>
            )}
          </motion.div>
        )}

        {/* Your past results (signed-in only) */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, ...pageTransition }}
            className="glass-panel"
            style={{ padding: '2rem', marginBottom: '2rem' }}
          >
            <h2 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>Your past results</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Your scores over time and how you compared to the average score that day for each challenge.
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
                  {CHALLENGE_TYPES.map((t) => (
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
                const typesToShow = historyTypeFilter === 'all' ? VALID_TYPES : [historyTypeFilter]
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
                      const label = CHALLENGE_TYPES.find((t) => t.id === typeId)?.label || typeId
                      return (
                        <div key={typeId}>
                          <h3 style={{ color: '#a78bfa', fontSize: '1rem', marginBottom: '0.75rem' }}>{label}</h3>
                          <div style={{ width: '100%', height: 240 }}>
                            <ResponsiveContainer>
                              <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
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
          </motion.div>
        )}

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...pageTransition }}
          className="glass-panel"
          style={{ padding: '2rem' }}
        >
          <h2 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>Today&apos;s leaderboard · {CHALLENGE_TYPES.find((t) => t.id === challengeType)?.label}</h2>
          {leaderboard.length === 0 ? (
            <p style={{ color: '#64748b' }}>No scores yet. Be the first!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {leaderboard.map((row) => (
                <motion.div
                  key={row.userId}
                  layout
                  transition={pageTransition}
                  whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.08)' }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.6rem 1rem',
                    borderRadius: '12px',
                    background: 'rgba(12, 12, 28, 0.45)',
                    border: '1px solid rgba(139, 92, 246, 0.12)',
                  }}
                >
                  <span style={{ color: '#94a3b8', fontWeight: '600' }}>#{row.rank}</span>
                  <span style={{ color: '#e2e8f0' }}>{row.name || 'Anonymous'}</span>
                  <span style={{ color: '#6366f1', fontWeight: '700' }}>{row.score} pts</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
