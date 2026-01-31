import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Background3D from '../components/Background3D'
import Navigation from '../components/Navigation'
import { statsAPI } from '../services/api'

const StatCard = ({ title, value, subtitle, icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    style={{
      backdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    }}
    whileHover={{ scale: 1.05, borderColor: 'rgba(99, 102, 241, 0.6)' }}
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
    <p style={{
      fontSize: '2.5rem',
      fontWeight: '700',
      margin: '0 0 0.25rem 0',
      background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}>
      {value}
    </p>
    {subtitle && (
      <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
        {subtitle}
      </p>
    )}
  </motion.div>
)

const CategoryBox = ({ title, correct, attempts, avgTime, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    style={{
      padding: '1.5rem',
      borderRadius: '12px',
      background: 'rgba(0,0,0,0.2)',
      border: '1px solid rgba(99, 102, 241, 0.2)',
      backdropFilter: 'blur(10px)',
    }}
  >
    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'capitalize' }}>{title}</div>
    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#6366f1', marginBottom: '0.5rem' }}>{correct}/{attempts}</div>
    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
      Accuracy: {attempts > 0 ? Math.round((correct / attempts) * 100) : 0}%
    </div>
    {avgTime !== undefined && (
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
  const correctAnswers = stats.correctAnswers || 0
  const accuracy = stats.accuracy ?? (totalProblems > 0 ? Math.round((correctAnswers / totalProblems) * 100) : 0)
  const currentStreak = stats.currentStreak || 0
  const averageTime = stats.averageTime ? `${stats.averageTime}s` : '0s'
  
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
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '700',
            margin: '0 0 0.5rem 0',
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
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
            title="Accuracy"
            value={`${accuracy}%`}
            subtitle={`${correctAnswers} correct`}
            icon="🎯"
            delay={0.2}
          />
          <StatCard
            title="Current Streak"
            value={currentStreak}
            subtitle="Days in a row"
            icon="🔥"
            delay={0.3}
          />
          <StatCard
            title="Avg Time"
            value={averageTime}
            subtitle="Per problem"
            icon="⚡"
            delay={0.4}
          />
        </div>

        {/* Difficulty Stats: High Scores & Average Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{ color: '#e2e8f0', fontSize: '1.8rem', marginTop: 0, marginBottom: '1.5rem' }}>
            Difficulty Breakdown
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {['easy', 'medium', 'hard', 'custom'].map((d) => {
              const high = stats.highestScoreByDifficulty?.[d] ?? 0
              const avg = stats.averageScoreByDifficulty?.[d] ?? 0
              const attempts = stats.difficultyStats?.[d]?.problems ?? 0
              const correct = stats.difficultyStats?.[d]?.correct ?? 0
              return (
                <div key={d} style={{ padding: '1.5rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <div style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'capitalize', marginBottom: '0.5rem', fontWeight: 600 }}>
                    {d} Mode
                  </div>
                  <div style={{ fontSize: '1.5rem', color: '#6366f1', fontWeight: 700, marginBottom: '0.5rem' }}>
                    High: {high}
                  </div>
                  <div style={{ fontSize: '1rem', color: '#ec4899', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Avg: {avg.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {correct}/{attempts} problems correct
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Operation Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{ color: '#e2e8f0', fontSize: '1.8rem', marginTop: 0, marginBottom: '1.5rem' }}>
            By Operation
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {Object.entries(stats.operationStats || {}).map(([op, data]) => (
              <CategoryBox
                key={op}
                title={`${op}${op === 'add' ? ' (+)' : op === 'sub' ? ' (-)' : op === 'mul' ? ' (×)' : op === 'div' ? ' (÷)' : ''}`}
                correct={data.correct || 0}
                attempts={data.attempts || 0}
                avgTime={(data.avgTime || 0).toFixed(2)}
              />
            ))}
          </div>
        </motion.div>

        {/* Digit Category Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{ color: '#e2e8f0', fontSize: '1.8rem', marginTop: 0, marginBottom: '1.5rem' }}>
            By Digit Difficulty
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {Object.entries(stats.digitCategoryStats || {}).map(([digit, data]) => (
              <CategoryBox
                key={digit}
                title={`${digit} Digit${digit === '3d+' ? '+' : ''}`}
                correct={data.correct || 0}
                attempts={data.attempts || 0}
                avgTime={(data.avgTime || 0).toFixed(2)}
              />
            ))}
          </div>
        </motion.div>

        {/* Combined Category Stats */}
        {Object.keys(stats.combinedCategoryStats || {}).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <h2 style={{ color: '#e2e8f0', fontSize: '1.8rem', marginTop: 0, marginBottom: '1.5rem' }}>
              Operation + Digit Combinations
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {Object.entries(stats.combinedCategoryStats || {}).map(([key, data]) => (
                <CategoryBox
                  key={key}
                  title={key}
                  correct={data.correct || 0}
                  attempts={data.attempts || 0}
                  avgTime={(data.avgTime || 0).toFixed(2)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
