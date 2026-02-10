import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Background3D from '../components/Background3D'
import Navigation from '../components/Navigation'
import CustomPracticeConfig from '../components/CustomPracticeConfig'
import { statsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

function generateProblem(difficulty = 'easy', customSettings = null, mode = null) {
  let a, b, answer, operator

  // —— Practice modes (single operation) ——
  if (mode === 'addition') {
    a = rand(2, 100)
    b = rand(2, 100)
    return { a, b, operator: '+', answer: a + b }
  }
  if (mode === 'subtraction') {
    a = rand(2, 100)
    b = rand(2, 100)
    if (b > a) [a, b] = [b, a]
    return { a, b, operator: '-', answer: a - b }
  }
  if (mode === 'multiplication') {
    a = rand(2, 100)
    b = rand(2, 100)
    return { a, b, operator: '*', answer: a * b }
  }
  if (mode === '2digit-mult') {
    a = rand(10, 99)
    b = rand(10, 99)
    return { a, b, operator: '*', answer: a * b }
  }
  if (mode === 'division') {
    b = rand(2, 12)
    answer = rand(2, 100)
    a = b * answer
    return { a, b, operator: '/', answer }
  }

  // —— Custom mode (URL params) ——
  if (customSettings && customSettings.operations && customSettings.operations.length > 0) {
    const ops = customSettings.operations
    const minNum = customSettings.min ?? 1
    const maxNum = customSettings.max ?? 50
    operator = ops[Math.floor(Math.random() * ops.length)]

    switch (operator) {
      case '+':
        a = rand(minNum, maxNum)
        b = rand(minNum, maxNum)
        answer = a + b
        break
      case '-':
        a = rand(minNum, maxNum)
        b = rand(minNum, Math.min(a, maxNum))
        answer = a - b
        break
      case '*':
        a = rand(minNum, maxNum)
        b = rand(minNum, maxNum)
        answer = a * b
        break
      case '/':
        answer = rand(minNum, Math.min(20, maxNum))
        if (answer === 0) answer = 1
        b = rand(minNum, Math.min(20, maxNum))
        if (b === 0) b = 1
        a = b * answer
        if (a > maxNum) {
          b = Math.floor(maxNum / answer) || minNum
          a = b * answer
        }
        break
      default:
        a = rand(minNum, maxNum)
        b = rand(minNum, maxNum)
        answer = a + b
    }
    return { a, b, operator, answer }
  }

  // —— Easy: single digit only (1–9), all four operations ——
  if (difficulty === 'easy') {
    operator = ['+', '-', '*', '/'][rand(0, 3)]
    switch (operator) {
      case '+':
        a = rand(1, 9)
        b = rand(1, 9)
        answer = a + b
        break
      case '-':
        a = rand(1, 9)
        b = rand(1, 9)
        if (b > a) [a, b] = [b, a]
        answer = a - b
        break
      case '*':
        a = rand(1, 9)
        b = rand(1, 9)
        answer = a * b
        break
      case '/':
        b = rand(1, 9)
        if (b === 0) b = 1
        answer = rand(1, 9)
        a = b * answer
        break
      default:
        a = rand(1, 9)
        b = rand(1, 9)
        answer = a + b
    }
    return { a, b, operator, answer }
  }

  // —— Medium (Zetamac): add/sub 2–100, mult 2–12 × 2–100, div divisor 2–12 quotient 2–100 ——
  if (difficulty === 'medium') {
    operator = ['+', '-', '*', '/'][rand(0, 3)]
    switch (operator) {
      case '+':
        a = rand(2, 100)
        b = rand(2, 100)
        answer = a + b
        break
      case '-':
        a = rand(2, 100)
        b = rand(2, 100)
        if (b > a) [a, b] = [b, a]
        answer = a - b
        break
      case '*':
        a = rand(2, 12)
        b = rand(2, 100)
        answer = a * b
        break
      case '/':
        b = rand(2, 12)
        answer = rand(2, 100)
        a = b * answer
        break
      default:
        a = rand(2, 100)
        b = rand(2, 100)
        answer = a + b
    }
    return { a, b, operator, answer }
  }

  // —— Hard: larger numbers ——
  if (difficulty === 'hard') {
    operator = ['+', '-', '*', '/'][rand(0, 3)]
    switch (operator) {
      case '+':
        a = rand(1, 200)
        b = rand(1, 200)
        answer = a + b
        break
      case '-':
        a = rand(1, 200)
        b = rand(1, 200)
        if (b > a) [a, b] = [b, a]
        answer = a - b
        break
      case '*':
        a = rand(2, 50)
        b = rand(2, 50)
        answer = a * b
        break
      case '/':
        b = rand(2, 50)
        answer = rand(2, 50)
        a = b * answer
        break
      default:
        a = rand(1, 200)
        b = rand(1, 200)
        answer = a + b
    }
    return { a, b, operator, answer }
  }

  // Fallback: easy
  a = rand(1, 9)
  b = rand(1, 9)
  return { a, b, operator: '+', answer: a + b }
}

export default function Practice() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const mode = searchParams.get('mode')
  const difficultyParam = searchParams.get('difficulty')
  
  const [difficulty, setDifficulty] = useState(difficultyParam || 'easy')
  const [customSettings, setCustomSettings] = useState(null)
  const [problem, setProblem] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(60)
  const [isChecking, setIsChecking] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [sessionSaved, setSessionSaved] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const inputRef = useRef(null)
  const startTimeRef = useRef(null)
  const { isAuthenticated } = useAuth()
  
  // COMPLETELY REWRITTEN: Track problems in a more reliable way
  const problemsRef = useRef([])
  const currentProblemStartRef = useRef(null)
  const savingRef = useRef(false)
  const gameSessionIdRef = useRef(null) // Unique ID for each game session
  
  // Parse custom settings from URL params
  useEffect(() => {
    if (mode === 'custom') {
      const operations = searchParams.get('operations')?.split(',') || []
      const min = parseInt(searchParams.get('min')) || 1
      const max = parseInt(searchParams.get('max')) || 50
      const time = parseInt(searchParams.get('time')) || 60
      
      if (operations.length > 0 && min && max && time) {
        setCustomSettings({
          operations,
          min,
          max,
          time,
        })
        setTimeRemaining(time)
        setShowConfig(false)
      } else {
        setShowConfig(true)
      }
    } else {
      setShowConfig(false)
      setCustomSettings(null)
    }
  }, [mode, searchParams])
  
  const generateNewProblem = useCallback(() => {
    const newProb = generateProblem(difficulty, customSettings, mode)
    setProblem(newProb)
    setUserAnswer('')
    setIsChecking(false)

    // Create a new problem entry with unique ID
    const problemId = Date.now() + Math.random()
    const problemEntry = {
      id: problemId,
      a: newProb.a,
      b: newProb.b,
      operator: newProb.operator,
      correct: false,
      attempted: false,
      timeTaken: 0,
      startTime: Date.now(),
    }

    problemsRef.current.push(problemEntry)
    currentProblemStartRef.current = problemEntry.startTime

    console.log('📝 New problem generated. Total problems so far:', problemsRef.current.length)

    // Focus input immediately
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [difficulty, customSettings, mode])
  
  // Start game when settings are ready
  useEffect(() => {
    if (showConfig) return
    
    // Generate unique session ID
    gameSessionIdRef.current = `session-${Date.now()}-${Math.random()}`
    
    setGameStarted(true)
    const initialTime = customSettings?.time || 60
    setTimeRemaining(initialTime)
    setScore(0)
    startTimeRef.current = Date.now()
    problemsRef.current = [] // Clear previous problems
    setSessionSaved(false)
    savingRef.current = false
    
    console.log('🎮 Starting new game session:', gameSessionIdRef.current)
    generateNewProblem()
  }, [difficulty, customSettings, generateNewProblem, showConfig])
  
  // Countdown timer
  useEffect(() => {
    if (!gameStarted || showConfig) return
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [gameStarted, showConfig])

  // Save session function - completely rewritten
  const saveSession = useCallback(async () => {
    if (savingRef.current) {
      console.log('⏭️ Save already in progress, skipping')
      return
    }
    
    if (sessionSaved) {
      console.log('⏭️ Session already saved, skipping')
      return
    }
    
    savingRef.current = true
    
    try {
      if (!isAuthenticated) {
        console.warn('⚠️ Not authenticated, cannot save stats')
        savingRef.current = false
        return
      }

      // Get all problems from the ref
      const allProblems = [...problemsRef.current]
      const actualProblemCount = allProblems.length
      const actualScore = allProblems.filter(p => p.correct && p.attempted).length
      
      // Calculate total time elapsed
      const initialTime = customSettings?.time || 60
      const timeElapsed = Math.max(1, Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000))
      
      // Prepare problems array for backend (ensure all have valid data)
      const problemsForBackend = allProblems.map(p => ({
        a: Number(p.a) || 0,
        b: Number(p.b) || 0,
        operator: p.operator || '+',
        correct: Boolean(p.correct && p.attempted),
        attempted: Boolean(p.attempted),
        timeTaken: Math.max(0, Number(p.timeTaken) || 0),
      }))
      
      // Category for stats (matches Home page: easy, medium, hard, addition, division, multiplication, 2digit-mult, custom)
      const category = ['addition', 'division', 'multiplication', '2digit-mult'].includes(mode)
        ? mode
        : (mode === 'custom' ? 'custom' : difficulty);

      const payload = {
        score: actualScore,
        timeLimit: initialTime,
        difficulty: mode === 'custom' ? 'custom' : difficulty,
        category,
        operations: customSettings?.operations || [],
        timeElapsed,
        totalProblems: actualProblemCount,
        problems: problemsForBackend,
      }

      console.log('💾 Saving session:', {
        sessionId: gameSessionIdRef.current,
        score: actualScore,
        totalProblems: actualProblemCount,
        problemsArrayLength: problemsForBackend.length,
        difficulty: payload.difficulty,
        problems: problemsForBackend.map(p => `${p.a}${p.operator}${p.b}=${p.correct}`).slice(0, 5) // Show first 5
      })
      
      const result = await statsAPI.saveSession(payload)
      console.log('✅ Session saved successfully!', result)
      setSessionSaved(true)
    } catch (err) {
      console.error('❌ Failed to save session:', err)
      console.error('Error details:', err.message, err.stack)
      savingRef.current = false
    }
  }, [isAuthenticated, sessionSaved, customSettings, difficulty, mode])

  // When time runs out, save session
  useEffect(() => {
    if (timeRemaining === 0 && gameStarted && !sessionSaved && !savingRef.current) {
      console.log('⏰ Timer reached 0, saving session...')
      console.log('📊 Problems tracked:', problemsRef.current.length)
      saveSession()
    }
  }, [timeRemaining, gameStarted, sessionSaved, saveSession])
  
  // Focus input when problem changes (no delay for instant feel)
  useEffect(() => {
    if (problem && !showConfig && inputRef.current) {
      inputRef.current.focus()
    }
  }, [problem, showConfig])
  
  // Auto-check answer when user types
  useEffect(() => {
    if (!problem || isChecking || !userAnswer || timeRemaining <= 0 || showConfig) return
    
    const answerNum = parseInt(userAnswer)
    if (isNaN(answerNum)) return
    
    if (answerNum === problem.answer) {
      setScore(prev => prev + 1)

      // Find and update the current problem in the problems array
      const currentProblem = problemsRef.current[problemsRef.current.length - 1]
      if (currentProblem && currentProblem.startTime === currentProblemStartRef.current) {
        const timeTaken = Date.now() - currentProblem.startTime
        currentProblem.correct = true
        currentProblem.attempted = true
        currentProblem.timeTaken = timeTaken
        
        console.log('✅ Problem answered correctly:', {
          problem: `${currentProblem.a}${currentProblem.operator}${currentProblem.b}`,
          timeTaken: `${(timeTaken / 1000).toFixed(2)}s`,
          totalProblems: problemsRef.current.length
        })
      }

      // Generate next problem immediately (no delay, no checking state)
      generateNewProblem()
    }
  }, [userAnswer, problem, isChecking, generateNewProblem, timeRemaining, showConfig])
  
  // Show config if in custom mode without settings
  if (mode === 'custom' && showConfig) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <Background3D />
        <Navigation />
        <CustomPracticeConfig />
      </div>
    )
  }
  
  if (!problem && !showConfig) return null
  
  const displayOperator = problem?.operator === '*' ? '×' : problem?.operator === '/' ? '÷' : problem?.operator
  
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Background3D />
      <Navigation />
      
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '900px',
        margin: '0 auto',
        padding: '3rem 2rem',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>
            {mode === 'custom' ? 'Custom Practice' : 'Practice Mode'}
          </h1>
          
          {mode !== 'custom' && (
            <div className="glass-panel" style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', margin: 0 }}>
              {['easy', 'medium', 'hard'].map((level) => (
                <motion.button
                  key={level}
                  onClick={() => {
                    navigate(`/practice?difficulty=${level}`)
                    setDifficulty(level)
                  }}
                  style={{
                    padding: '0.5rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: difficulty === level
                      ? 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)'
                      : 'transparent',
                    color: difficulty === level ? 'white' : '#94a3b8',
                    fontWeight: difficulty === level ? '600' : '400',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {level}
                </motion.button>
              ))}
            </div>
          )}
          
          {mode === 'custom' && (
            <motion.button
              onClick={() => navigate('/practice?mode=custom')}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                border: '1px solid #6366f1',
                background: 'rgba(99, 102, 241, 0.1)',
                color: '#e2e8f0',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
              whileHover={{ scale: 1.05 }}
            >
              Change Settings
            </motion.button>
          )}
        </div>
        
        {mode === 'custom' && customSettings && (
          <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', fontSize: '0.9rem', color: '#94a3b8' }}>
            <strong style={{ color: '#e2e8f0' }}>Custom Settings:</strong> {' '}
            Operations: {customSettings.operations.map(op => op === '*' ? '×' : op === '/' ? '÷' : op).join(', ')} | {' '}
            Range: {customSettings.min}-{customSettings.max} | {' '}
            Time: {customSettings.time}s
          </div>
        )}
        
        <motion.div
          key={problem?.a + problem?.b + problem?.operator}
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0 }}
          className="glass-panel-strong"
          style={{
            padding: '4rem',
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '3rem',
            fontSize: '1.1rem',
            color: '#94a3b8',
          }}>
            <div>
              Score: <span style={{ color: '#6366f1', fontWeight: '600', fontSize: '1.5rem' }}>
                {score}
              </span>
            </div>
            <div>
              Problems: <span style={{ color: '#6366f1', fontWeight: '600', fontSize: '1.5rem' }}>
                {problemsRef.current.length}
              </span>
            </div>
            <div>
              Time: <span style={{ 
                color: timeRemaining <= 10 ? '#ef4444' : '#6366f1', 
                fontWeight: '600',
                fontSize: '1.5rem'
              }}>
                {timeRemaining}s
              </span>
            </div>
          </div>
          
          <div style={{
            fontSize: '5rem',
            fontWeight: '700',
            color: '#e2e8f0',
            marginBottom: '3rem',
            fontFamily: 'monospace',
          }}>
            {problem?.a} {displayOperator} {problem?.b} = ?
          </div>
          
          <motion.input
            ref={inputRef}
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={isChecking || timeRemaining <= 0}
            autoFocus
            className="focus-ring"
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              background: 'rgba(12, 12, 28, 0.6)',
              color: '#e2e8f0',
              fontSize: '2rem',
              fontWeight: '600',
              textAlign: 'center',
              outline: 'none',
              fontFamily: 'inherit',
              boxShadow: '0 0 32px rgba(99, 102, 241, 0.08)',
            }}
            whileFocus={{
              borderColor: 'rgba(139, 92, 246, 0.6)',
              boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.2), 0 0 48px rgba(99, 102, 241, 0.12)',
            }}
          />
          
          {timeRemaining <= 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '2rem',
              }}
            >
              <p style={{
                color: '#ef4444',
                fontSize: '1.2rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
              }}>
                Time's up! Final Score: {score} / {problemsRef.current.length}
              </p>
              {!isAuthenticated && (
                <p style={{
                  color: '#fbbf24',
                  fontSize: '0.9rem',
                  marginTop: '0.5rem',
                }}>
                  ⚠️ Sign in to save your stats
                </p>
              )}
              {isAuthenticated && sessionSaved && (
                <p style={{
                  color: '#10b981',
                  fontSize: '0.9rem',
                  marginTop: '0.5rem',
                }}>
                  ✅ Stats saved! ({problemsRef.current.length} problems)
                </p>
              )}
              {isAuthenticated && !sessionSaved && (
                <p style={{
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                  marginTop: '0.5rem',
                }}>
                  Saving stats...
                </p>
              )}
            </motion.div>
          )}
          
          {!userAnswer && timeRemaining > 0 && (
            <p style={{
              color: '#64748b',
              marginTop: '1rem',
              fontSize: '0.9rem',
            }}>
              Type your answer to continue
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
