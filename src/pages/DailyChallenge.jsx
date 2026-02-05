import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import Background3D from '../components/Background3D'
import Navigation from '../components/Navigation'
import { dailyChallengeAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const pageTransition = { type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.35 }

const CHALLENGE_TYPES = [
  { id: 'division', label: 'Division', desc: '10 division problems (non-even). Close + fast.' },
  { id: 'equation', label: 'Equation', desc: '10 mixed expressions: (a×b), a÷b, +, −. e.g. 500/19 + (31×45) − 72. Close + fast.' },
  { id: 'multiplication', label: 'Large multiplication', desc: '10 big number multiplications. Close + fast.' },
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
  const [result, setResult] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [myScore, setMyScore] = useState(null)
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

  useEffect(() => {
    fetchProblems()
    fetchLeaderboard()
    fetchMyScore()
  }, [fetchProblems, fetchLeaderboard, fetchMyScore])

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
    setProblemStartTime(Date.now())
    setTimeout(() => inputRef.current?.focus(), 100)
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
    setTimeout(() => inputRef.current?.focus(), 50)
  }

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
          {CHALLENGE_TYPES.find((t) => t.id === challengeType)?.desc}. One attempt per day per challenge. Score: accuracy (60%) + speed (40%). Max 1000 pts.
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
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              You&apos;ll get 10 problems. One attempt per day. Type your answer (decimal allowed) and press Enter.
              Your score combines how close you are (60%) and how fast you answer (40%).
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={pageTransition}
            className="glass-panel-strong"
            style={{ padding: '3rem', textAlign: 'center' }}
          >
            <div style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              Problem {currentIndex + 1} of {problems.length}
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
