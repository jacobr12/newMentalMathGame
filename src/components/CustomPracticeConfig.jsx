import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function CustomPracticeConfig() {
  const navigate = useNavigate()
  const [operations, setOperations] = useState({
    addition: true,
    subtraction: true,
    multiplication: true,
    division: false,
  })
  const [minNumber, setMinNumber] = useState(1)
  const [maxNumber, setMaxNumber] = useState(50)
  const [timeLimit, setTimeLimit] = useState(60)
  
  const handleOperationToggle = (op) => {
    setOperations(prev => ({
      ...prev,
      [op]: !prev[op]
    }))
  }
  
  const handleStart = () => {
    const selectedOps = Object.entries(operations)
      .filter(([_, selected]) => selected)
      .map(([op, _]) => {
        const opMap = {
          addition: '+',
          subtraction: '-',
          multiplication: '*',
          division: '/',
        }
        return opMap[op]
      })
    
    if (selectedOps.length === 0) {
      alert('Please select at least one operation type!')
      return
    }
    
    if (minNumber >= maxNumber) {
      alert('Minimum number must be less than maximum number!')
      return
    }
    
    if (timeLimit < 10 || timeLimit > 600) {
      alert('Time limit must be between 10 and 600 seconds!')
      return
    }
    
    // Pass settings via URL params
    const params = new URLSearchParams({
      mode: 'custom',
      operations: selectedOps.join(','),
      min: minNumber.toString(),
      max: maxNumber.toString(),
      time: timeLimit.toString(),
    })
    
    navigate(`/practice?${params.toString()}`)
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        background: 'rgba(10, 10, 30, 0.6)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '24px',
        padding: '3rem',
        boxShadow: '0 0 50px rgba(99, 102, 241, 0.12), 0 0 100px rgba(139, 92, 246, 0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
        maxWidth: '600px',
        margin: '2rem auto',
      }}
    >
      <h2 style={{
        fontSize: '2rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 50%, #ec4899 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '2rem',
        textAlign: 'center',
      }}>
        Custom Practice Settings
      </h2>
      
      <div style={{ marginBottom: '2rem' }}>
        <label style={{
          display: 'block',
          color: '#e2e8f0',
          marginBottom: '1rem',
          fontSize: '1.1rem',
          fontWeight: '600',
        }}>
          Operation Types
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
        }}>
          {[
            { key: 'addition', symbol: '+', label: 'Addition' },
            { key: 'subtraction', symbol: '-', label: 'Subtraction' },
            { key: 'multiplication', symbol: '×', label: 'Multiplication' },
            { key: 'division', symbol: '÷', label: 'Division' },
          ].map((op) => (
            <motion.button
              key={op.key}
              onClick={() => handleOperationToggle(op.key)}
              style={{
                padding: '1rem',
                borderRadius: '12px',
                border: `2px solid ${operations[op.key] ? '#6366f1' : 'rgba(99, 102, 241, 0.3)'}`,
                background: operations[op.key] 
                  ? 'rgba(99, 102, 241, 0.2)' 
                  : 'rgba(15, 23, 42, 0.5)',
                color: operations[op.key] ? '#e2e8f0' : '#94a3b8',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span style={{ fontSize: '1.5rem' }}>{op.symbol}</span>
              <span>{op.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <label style={{
          display: 'block',
          color: '#e2e8f0',
          marginBottom: '1rem',
          fontSize: '1.1rem',
          fontWeight: '600',
        }}>
          Number Range
        </label>
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}>
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              color: '#94a3b8',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
            }}>
              Minimum
            </label>
            <motion.input
              type="number"
              value={minNumber}
              onChange={(e) => setMinNumber(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '10px',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                background: 'rgba(15, 23, 42, 0.5)',
                color: '#e2e8f0',
                fontSize: '1rem',
                outline: 'none',
              }}
              whileFocus={{
                borderColor: '#6366f1',
                boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
              }}
            />
          </div>
          
          <span style={{
            color: '#94a3b8',
            fontSize: '1.5rem',
            marginTop: '1.5rem',
          }}>
            to
          </span>
          
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              color: '#94a3b8',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
            }}>
              Maximum
            </label>
            <motion.input
              type="number"
              value={maxNumber}
              onChange={(e) => setMaxNumber(Math.max(minNumber + 1, parseInt(e.target.value) || minNumber + 1))}
              min={minNumber + 1}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '10px',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                background: 'rgba(15, 23, 42, 0.5)',
                color: '#e2e8f0',
                fontSize: '1rem',
                outline: 'none',
              }}
              whileFocus={{
                borderColor: '#6366f1',
                boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
              }}
            />
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <label style={{
          display: 'block',
          color: '#e2e8f0',
          marginBottom: '1rem',
          fontSize: '1.1rem',
          fontWeight: '600',
        }}>
          Time Limit: {timeLimit} seconds
        </label>
        <motion.input
          type="range"
          min="10"
          max="600"
          step="10"
          value={timeLimit}
          onChange={(e) => setTimeLimit(parseInt(e.target.value))}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            background: 'rgba(99, 102, 241, 0.3)',
            outline: 'none',
          }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '0.5rem',
          color: '#94a3b8',
          fontSize: '0.85rem',
        }}>
          <span>10s</span>
          <span>300s</span>
          <span>600s</span>
        </div>
      </div>
      
      <motion.button
        onClick={handleStart}
        style={{
          width: '100%',
          padding: '1rem',
          borderRadius: '12px',
          border: 'none',
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          color: 'white',
          fontSize: '1.2rem',
          fontWeight: '600',
          cursor: 'pointer',
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Start Custom Practice
      </motion.button>
    </motion.div>
  )
}
