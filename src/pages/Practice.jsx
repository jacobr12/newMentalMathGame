import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Background3D from '../components/Background3D'
import Navigation from '../components/Navigation'
import CustomPracticeConfig from '../components/CustomPracticeConfig'

function generateProblem(difficulty = 'easy', customSettings = null) {
  let a, b, answer, operator
  let ops = ['+', '-', '*']
  let minNum = 1
  let maxNum = 50
  
  if (customSettings) {
    // Custom mode
    ops = customSettings.operations
    minNum = customSettings.min
    maxNum = customSettings.max
  } else {
    // Preset difficulty mode
    switch (difficulty) {
      case 'easy':
        minNum = 1
        maxNum = 50
        break
      case 'medium':
        minNum = 1
        maxNum = 100
        break
      case 'hard':
        minNum = 1
        maxNum = 500
        break
      default:
        minNum = 1
        maxNum = 50
    }
  }
  
  // Select random operator
  operator = ops[Math.floor(Math.random() * ops.length)]
  
  // Generate numbers based on operation to ensure valid answers
  switch (operator) {
    case '+':
      a = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum
      b = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum
      answer = a + b
      break
    case '-':
      // Ensure result is non-negative or within range
      a = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum
      b = Math.floor(Math.random() * (a - minNum + 1)) + minNum
      answer = a - b
      break
    case '*':
      a = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum
      b = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum
      answer = a * b
      break
    case '/':
      // For division, ensure whole number result: a ÷ b = answer (so a = b × answer)
      // Generate answer (quotient) first, then divisor b, then calculate a
      answer = Math.floor(Math.random() * (Math.min(maxNum, 20) - minNum + 1)) + minNum
      if (answer === 0) answer = 1
      
      // Generate divisor b
      b = Math.floor(Math.random() * (Math.min(maxNum, 20) - minNum + 1)) + minNum
      if (b === 0) b = 1
      
      // Calculate dividend a = b × answer
      a = b * answer
      
      // If a is out of range, adjust b
      if (a > maxNum) {
        b = Math.floor(maxNum / answer)
        if (b < minNum) b = minNum
        a = b * answer
        // If still out of range, reduce answer
        while (a > maxNum && answer > 1) {
          answer--
          b = Math.floor(maxNum / answer)
          if (b < minNum) b = minNum
          a = b * answer
        }
      }
      break
    default:
      a = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum
      b = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum
      answer = a + b
  }
  
  return { a, b, operator, answer }
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
  const [showConfig, setShowConfig] = useState(false)
  const inputRef = useRef(null)
  
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
    setProblem(generateProblem(difficulty, customSettings))
    setUserAnswer('')
    setIsChecking(false)
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 50)
  }, [difficulty, customSettings])
  
  // Start game when settings are ready
  useEffect(() => {
    if (showConfig) return // Don't start if showing config
    
    setGameStarted(true)
    const initialTime = customSettings?.time || 60
    setTimeRemaining(initialTime)
    setScore(0)
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
  
  // Focus input when problem changes
  useEffect(() => {
    if (problem && !isChecking && !showConfig) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 50)
    }
  }, [problem, isChecking, showConfig])
  
  // Auto-check answer when user types
  useEffect(() => {
    if (!problem || isChecking || !userAnswer || timeRemaining <= 0 || showConfig) return
    
    const answerNum = parseInt(userAnswer)
    if (isNaN(answerNum)) return
    
    if (answerNum === problem.answer) {
      setIsChecking(true)
      setScore(prev => prev + 1)
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
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            margin: 0,
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {mode === 'custom' ? 'Custom Practice' : 'Practice Mode'}
          </h1>
          
          {mode !== 'custom' && (
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              padding: '0.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}>
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
          <div style={{
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            fontSize: '0.9rem',
            color: '#94a3b8',
          }}>
            <strong style={{ color: '#e2e8f0' }}>Custom Settings:</strong> {' '}
            Operations: {customSettings.operations.map(op => op === '*' ? '×' : op === '/' ? '÷' : op).join(', ')} | {' '}
            Range: {customSettings.min}-{customSettings.max} | {' '}
            Time: {customSettings.time}s
          </div>
        )}
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          key={problem?.a + problem?.b + problem?.operator}
          style={{
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '30px',
            padding: '4rem',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
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
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '1.5rem',
              borderRadius: '15px',
              border: '2px solid rgba(99, 102, 241, 0.3)',
              background: 'rgba(15, 23, 42, 0.5)',
              color: '#e2e8f0',
              fontSize: '2rem',
              fontWeight: '600',
              textAlign: 'center',
              outline: 'none',
              fontFamily: 'monospace',
            }}
            whileFocus={{
              borderColor: '#6366f1',
              boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.1)',
            }}
          />
          
          {timeRemaining <= 0 && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                color: '#ef4444',
                marginTop: '2rem',
                fontSize: '1.2rem',
                fontWeight: '600',
              }}
            >
              Time's up! Final Score: {score}
            </motion.p>
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
