import { motion } from 'framer-motion'
import Background3D from '../components/Background3D'
import Navigation from '../components/Navigation'

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

export default function Stats() {
  // Mock data - will be replaced with backend data later
  const stats = {
    totalProblems: 1247,
    correctAnswers: 1034,
    accuracy: 83,
    streak: 12,
    averageTime: '3.2s',
    level: 8,
  }
  
  const accuracy = stats.accuracy
  const correctRate = ((stats.correctAnswers / stats.totalProblems) * 100).toFixed(1)
  
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Background3D />
      <Navigation />
      
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1200px',
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
            Track your progress and improve your mental math skills
          </p>
        </motion.div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem',
        }}>
          <StatCard
            title="Total Problems"
            value={stats.totalProblems.toLocaleString()}
            subtitle="All time"
            icon="📊"
            delay={0.1}
          />
          <StatCard
            title="Accuracy"
            value={`${accuracy}%`}
            subtitle={`${stats.correctAnswers} correct`}
            icon="🎯"
            delay={0.2}
          />
          <StatCard
            title="Current Streak"
            value={stats.streak}
            subtitle="Days in a row"
            icon="🔥"
            delay={0.3}
          />
          <StatCard
            title="Average Time"
            value={stats.averageTime}
            subtitle="Per problem"
            icon="⚡"
            delay={0.4}
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '20px',
            padding: '3rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          }}
        >
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#e2e8f0',
            margin: '0 0 2rem 0',
          }}>
            Progress Overview
          </h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
              color: '#94a3b8',
              fontSize: '0.9rem',
            }}>
              <span>Overall Accuracy</span>
              <span>{correctRate}%</span>
            </div>
            <div style={{
              height: '12px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.2)',
              overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${correctRate}%` }}
                transition={{ duration: 1, delay: 0.6 }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1, #ec4899)',
                  borderRadius: '10px',
                }}
              />
            </div>
          </div>
          
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
              color: '#94a3b8',
              fontSize: '0.9rem',
            }}>
              <span>Level Progress</span>
              <span>Level {stats.level}</span>
            </div>
            <div style={{
              height: '12px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.2)',
              overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                transition={{ duration: 1, delay: 0.7 }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1, #ec4899)',
                  borderRadius: '10px',
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
