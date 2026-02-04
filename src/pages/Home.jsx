import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Background3D from '../components/Background3D'
import Navigation from '../components/Navigation'

const glassPanel = {
  background: 'rgba(10, 10, 30, 0.45)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(139, 92, 246, 0.25)',
  borderRadius: '20px',
  boxShadow: '0 0 40px rgba(99, 102, 241, 0.12), 0 0 80px rgba(139, 92, 246, 0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
}

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Background3D />
      <Navigation />

      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 2rem',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1 style={{
            fontSize: '4.5rem',
            fontWeight: '800',
            margin: '0 0 1rem 0',
            lineHeight: '1.1',
            letterSpacing: '0.02em',
            background: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 40%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 80px rgba(139, 92, 246, 0.3)',
          }}>
            Master Mental Math
          </h1>

          <p style={{
            fontSize: '1.5rem',
            color: 'rgba(203, 213, 225, 0.95)',
            margin: '0 0 4rem 0',
            maxWidth: '700px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6',
          }}>
            Challenge your mind, improve your speed, and track your progress with interactive mental math exercises.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
          style={{ marginBottom: '5rem' }}
        >
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#e2e8f0',
            marginBottom: '2rem',
            textAlign: 'center',
            letterSpacing: '0.03em',
          }}>
            Choose Your Challenge
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <Link to="/daily" style={{ textDecoration: 'none' }}>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                style={{
                  ...glassPanel,
                  padding: '1.5rem 2rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem',
                  border: '1px solid rgba(139, 92, 246, 0.5)',
                  boxShadow: '0 0 40px rgba(139, 92, 246, 0.15)',
                }}
                whileHover={{
                  scale: 1.02,
                  borderColor: 'rgba(139, 92, 246, 0.8)',
                  boxShadow: '0 0 60px rgba(139, 92, 246, 0.25)',
                }}
              >
                <span style={{ fontSize: '2rem' }}>📅</span>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ color: '#a78bfa', fontWeight: '700', fontSize: '1.2rem' }}>Daily Challenge</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block' }}>10 division problems · one attempt per day · leaderboard</span>
                </div>
              </motion.div>
            </Link>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
          }}>
            {[
              { name: 'Easy', icon: '🌱', description: 'Perfect for beginners', details: 'Single digits (1–9) only. Addition, subtraction, multiplication & division (e.g. 48÷8=6, 14−9=5).', time: '60 seconds', difficulty: 'easy', color: '#10b981' },
              { name: 'Medium', icon: '🔥', description: 'Classic Zetamac-style', details: 'Add/sub: 2–100. Mult/div: 2–12 × 2–100. Also known as Zetamac mode.', time: '60 seconds', difficulty: 'medium', color: '#f59e0b', badge: 'Zetamac' },
              { name: 'Hard', icon: '⚡', description: 'Ultimate challenge', details: 'Add/sub: up to 200. Mult/div: up to 50 × 50. All four operations.', time: '60 seconds', difficulty: 'hard', color: '#ef4444' },
            ].map((level, index) => (
              <Link key={level.difficulty} to={`/practice?difficulty=${level.difficulty}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  style={{
                    ...glassPanel,
                    border: `1px solid ${level.color}40`,
                    padding: '2.5rem',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  whileHover={{
                    scale: 1.03,
                    borderColor: level.color,
                    boxShadow: `0 0 50px ${level.color}30, 0 0 90px rgba(139, 92, 246, 0.08)`,
                  }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '3rem' }}>{level.icon}</span>
                    {level.badge && (
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: level.color, background: `${level.color}22`, padding: '0.25rem 0.5rem', borderRadius: '8px' }}>
                        {level.badge}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: level.color, margin: '0 0 0.5rem 0' }}>
                    {level.name}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 1rem 0' }}>
                    {level.description}
                  </p>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0 0 0.5rem 0', lineHeight: '1.5' }}>
                      {level.details}
                    </p>
                    <p style={{ color: '#a78bfa', fontSize: '0.85rem', margin: 0, fontWeight: '600' }}>
                      ⏱ {level.time}
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          <h3 style={{ fontSize: '1.35rem', fontWeight: '600', color: '#94a3b8', marginBottom: '1.25rem', textAlign: 'center' }}>
            Fun practice
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {[
              { name: 'Just Addition', mode: 'addition', icon: '➕' },
              { name: 'Just Division', mode: 'division', icon: '➗' },
              { name: 'Just Multiplication', mode: 'multiplication', icon: '✖️' },
              { name: '2-Digit Multiplication', mode: '2digit-mult', icon: '🔢' },
            ].map((item, index) => (
              <Link key={item.mode} to={`/practice?mode=${item.mode}&difficulty=custom`} style={{ textDecoration: 'none' }}>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  style={{
                    ...glassPanel,
                    padding: '1.25rem 1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                  whileHover={{
                    scale: 1.02,
                    borderColor: 'rgba(139, 92, 246, 0.5)',
                    boxShadow: '0 0 40px rgba(99, 102, 241, 0.2)',
                  }}
                >
                  <span style={{ fontSize: '1.75rem' }}>{item.icon}</span>
                  <span style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '1rem' }}>{item.name}</span>
                </motion.div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/practice?mode=custom" style={{ textDecoration: 'none' }}>
              <motion.button
                style={{
                  padding: '1rem 3rem',
                  borderRadius: '14px',
                  border: '1px solid rgba(139, 92, 246, 0.5)',
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: '#e2e8f0',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 0 30px rgba(99, 102, 241, 0.15)',
                }}
                whileHover={{
                  scale: 1.05,
                  background: 'rgba(99, 102, 241, 0.2)',
                  boxShadow: '0 0 50px rgba(99, 102, 241, 0.25)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                🎛️ Create Custom Practice
              </motion.button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginTop: '4rem',
          }}
        >
          {[
            { icon: '⚡', title: 'Fast Calculations', description: 'Improve your speed and accuracy with timed challenges' },
            { icon: '📊', title: 'Track Progress', description: 'Monitor your improvement with detailed statistics' },
            { icon: '🎯', title: 'Custom Practice', description: 'Create your own practice sessions tailored to your needs' },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              style={{
                ...glassPanel,
                padding: '2.5rem',
              }}
              whileHover={{
                scale: 1.02,
                borderColor: 'rgba(139, 92, 246, 0.4)',
                boxShadow: '0 0 50px rgba(99, 102, 241, 0.15), 0 0 100px rgba(139, 92, 246, 0.08)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#e2e8f0', margin: '0 0 0.75rem 0' }}>
                {feature.title}
              </h3>
              <p style={{ color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
