import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Background3D from '../components/Background3D'
import Navigation from '../components/Navigation'
import { statsAPI } from '../services/api'

const glassStyle = {
  background: 'rgba(10, 10, 30, 0.45)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(139, 92, 246, 0.25)',
  boxShadow: '0 0 40px rgba(99, 102, 241, 0.1), 0 0 80px rgba(139, 92, 246, 0.05), inset 0 1px 0 rgba(255,255,255,0.03)',
}

const StatCard = ({ title, value, subtitle, icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    style={{
      ...glassStyle,
      borderRadius: '20px',
      padding: '2rem',
    }}
    whileHover={{ scale: 1.02, borderColor: 'rgba(139, 92, 246, 0.45)', boxShadow: '0 0 50px rgba(99, 102, 241, 0.15)' }}
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
      background: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 50%, #ec4899 100%)',
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

const CategoryBox = ({ title, attempts, avgTime, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    style={{
      padding: '1.5rem',
      borderRadius: '14px',
      background: 'rgba(10, 10, 30, 0.4)',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 0 20px rgba(99, 102, 241, 0.06)',
    }}
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
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '700',
            margin: '0 0 0.5rem 0',
            background: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 50%, #ec4899 100%)',
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

        {/* Difficulty Stats: High Scores & Average Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            ...glassStyle,
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
          }}
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          style={{
            ...glassStyle,
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
          }}
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            ...glassStyle,
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
          }}
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{
            ...glassStyle,
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
          }}
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{
            ...glassStyle,
            borderRadius: '20px',
            padding: '2rem',
          }}
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
