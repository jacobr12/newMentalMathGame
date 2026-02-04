import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Background3D from '../components/Background3D'
import Navigation from '../components/Navigation'
import { dailyChallengeAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const glassStyle = {
  background: 'rgba(10, 10, 30, 0.5)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(139, 92, 246, 0.3)',
  borderRadius: '20px',
  boxShadow: '0 0 40px rgba(99, 102, 241, 0.12), inset 0 1px 0 rgba(255,255,255,0.04)',
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function DailyChallenge() {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [step, setStep] = useState('intro') // intro | play | results
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [userAnswer, setUserAnswer] = useState('')
  const [problemStartTime, setProblemStartTime] = useState(null)
  const [result, setResult] = useState(null) // { score, breakdown, bestScore, isNewBest }
  const [leaderboard, setLeaderboard] = useState([])
  const [myScore, setMyScore] = useState(null)
  const inputRef = useRef(null)
  const { isAuthenticated } = useAuth()
  const date = todayStr()

  const fetchProblems = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await dailyChallengeAPI.getProblems(date)
      setProblems(data.problems || [])
    } catch (err) {
      setError(err.message || 'Failed to load today\'s challenge')
    } finally {
      setLoading(false)
    }
  }, [date])

  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await dailyChallengeAPI.getLeaderboard(date, 15)
      setLeaderboard(data.leaderboard || [])
    } catch (_) {}
  }, [date])

  const fetchMyScore = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const data = await dailyChallengeAPI.getMyScore(date)
      setMyScore(data.submitted ? data.score : null)
    } catch (_) {}
  }, [date, isAuthenticated])

  useEffect(() => {
    fetchProblems()
    fetchLeaderboard()
    fetchMyScore()
  }, [fetchProblems, fetchLeaderboard, fetchMyScore])

  const startChallenge = () => {
    setStep('play')
    setCurrentIndex(0)
    setAnswers([])
    setUserAnswer('')
    setProblemStartTime(Date.now())
    setTimeout(() => inputRef.current?.focus(), 100)
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
        const data = await dailyChallengeAPI.submit(date, finalAnswers)
        setResult({
          score: data.score,
          bestScore: data.bestScore,
          isNewBest: data.isNewBest,
          breakdown: data.breakdown || [],
        })
      } else {
        const data = await dailyChallengeAPI.getScoreOnly(date, finalAnswers)
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
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: '2.25rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 50%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Daily Challenge
        </motion.h1>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
          Same 10 division problems for everyone. One attempt per day. Score is based on accuracy and speed. Max 1000 points.
        </p>

        {step === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ ...glassStyle, padding: '2.5rem' }}
          >
            <p style={{ color: '#e2e8f0', marginBottom: '1rem' }}>
              Today&apos;s challenge: <strong>{date}</strong>
            </p>
            {myScore != null && (
              <p style={{ color: '#10b981', marginBottom: '1.5rem', fontWeight: '600' }}>
                You&apos;ve already completed today&apos;s challenge. Your score: <strong>{myScore}</strong> pts
              </p>
            )}
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              You&apos;ll get 10 division problems that don&apos;t divide evenly. One attempt per day. Type your answer (decimal allowed) and press Enter. 
              Your score combines how close you are (60%) and how fast you answer (40%).
            </p>
            <motion.button
              onClick={startChallenge}
              disabled={myScore != null}
              style={{
                padding: '1rem 2.5rem',
                borderRadius: '14px',
                border: '1px solid rgba(139, 92, 246, 0.5)',
                background: myScore != null ? 'rgba(100,100,100,0.4)' : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                color: 'white',
                fontWeight: '600',
                fontSize: '1.1rem',
                cursor: myScore != null ? 'not-allowed' : 'pointer',
                boxShadow: myScore != null ? 'none' : '0 0 30px rgba(99, 102, 241, 0.3)',
                opacity: myScore != null ? 0.8 : 1,
              }}
              whileHover={myScore != null ? {} : { scale: 1.03 }}
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
            style={{ ...glassStyle, padding: '3rem', textAlign: 'center' }}
          >
            <div style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              Problem {currentIndex + 1} of {problems.length}
            </div>
            <div style={{ fontSize: '3.5rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '2rem', fontFamily: 'monospace' }}>
              {currentProblem.a} ÷ {currentProblem.b} = ?
            </div>
            <motion.input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
              placeholder="Your answer..."
              style={{
                width: '100%',
                maxWidth: '280px',
                padding: '1.25rem',
                borderRadius: '14px',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                background: 'rgba(10, 10, 30, 0.6)',
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ ...glassStyle, padding: '2rem', marginBottom: '2rem' }}
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ ...glassStyle, padding: '2rem' }}
        >
          <h2 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>Today&apos;s leaderboard</h2>
          {leaderboard.length === 0 ? (
            <p style={{ color: '#64748b' }}>No scores yet. Be the first!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {leaderboard.map((row) => (
                <div
                  key={row.userId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.6rem 1rem',
                    borderRadius: '10px',
                    background: 'rgba(10, 10, 30, 0.4)',
                    border: '1px solid rgba(139, 92, 246, 0.15)',
                  }}
                >
                  <span style={{ color: '#94a3b8', fontWeight: '600' }}>#{row.rank}</span>
                  <span style={{ color: '#e2e8f0' }}>{row.name || 'Anonymous'}</span>
                  <span style={{ color: '#6366f1', fontWeight: '700' }}>{row.score} pts</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
