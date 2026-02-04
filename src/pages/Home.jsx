import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import Background3D from '../components/Background3D'
import Navigation from '../components/Navigation'

const motionTransition = { type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.45 }
const stagger = 0.08

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
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionTransition, duration: 0.6 }}
        >
          <h1
            className="gradient-text"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.25rem)',
              fontWeight: '800',
              margin: '0 0 1rem 0',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
            }}
          >
            Master Mental Math
          </h1>
          <p style={{
            fontSize: '1.35rem',
            color: 'rgba(203, 213, 225, 0.92)',
            margin: '0 auto 4rem',
            maxWidth: '640px',
            lineHeight: 1.65,
            fontWeight: '400',
          }}>
            Challenge your mind, improve your speed, and track your progress with interactive mental math exercises.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionTransition, delay: 0.15, duration: 0.5 }}
          style={{ marginBottom: '5rem' }}
        >
          <h2 style={{
            fontSize: '1.85rem',
            fontWeight: '700',
            color: '#e2e8f0',
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em',
          }}>
            Daily Challenges
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            One attempt per day per challenge · score = accuracy + speed · leaderboards
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}>
            {[
              { type: 'division', label: 'Division Daily', icon: '➗', desc: '10 division problems (non-even). Get close, answer fast.', color: '#8b5cf6' },
              { type: 'equation', label: 'Equation Daily', icon: '🧮', desc: '10 mixed expressions: (a×b), a÷b, +, −. e.g. 500/19 + (31×45) − 72.', color: '#6366f1' },
              { type: 'multiplication', label: 'Multiplication Daily', icon: '✖️', desc: '10 large number multiplications. Close + fast.', color: '#ec4899' },
            ].map((daily, index) => (
              <Link key={daily.type} to={`/daily?type=${daily.type}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + index * 0.06, ...motionTransition }}
                  className="glass-panel"
                  style={{
                    padding: '1.5rem 1.75rem',
                    cursor: 'pointer',
                    border: `1px solid ${daily.color}50`,
                    boxShadow: `0 0 32px ${daily.color}20`,
                  }}
                  whileHover={{
                    scale: 1.02,
                    borderColor: `${daily.color}99`,
                    boxShadow: `0 0 48px ${daily.color}35`,
                  }}
                  whileTap={{ scale: 0.995 }}
                >
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>{daily.icon}</span>
                  <span style={{ color: daily.color, fontWeight: '700', fontSize: '1.15rem' }}>{daily.label}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.88rem', display: 'block', marginTop: '0.35rem', lineHeight: 1.4 }}>{daily.desc}</span>
                </motion.div>
              </Link>
            ))}
          </div>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#e2e8f0',
            marginBottom: '1.25rem',
            letterSpacing: '-0.02em',
          }}>
            Practice mode
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.75rem',
            marginBottom: '2rem',
          }}>
            {[
              { name: 'Easy', icon: '🌱', description: 'Perfect for beginners', details: 'Single digits (1–9) only. Addition, subtraction, multiplication & division.', time: '60 seconds', difficulty: 'easy', color: '#10b981' },
              { name: 'Medium', icon: '🔥', description: 'Classic Zetamac-style', details: 'Add/sub: 2–100. Mult/div: 2–12 × 2–100.', time: '60 seconds', difficulty: 'medium', color: '#f59e0b', badge: 'Zetamac' },
              { name: 'Hard', icon: '⚡', description: 'Ultimate challenge', details: 'Add/sub: up to 200. Mult/div: up to 50 × 50. All four operations.', time: '60 seconds', difficulty: 'hard', color: '#ef4444' },
            ].map((level, index) => (
              <Link key={level.difficulty} to={`/practice?difficulty=${level.difficulty}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * stagger, ...motionTransition }}
                  className="glass-panel"
                  style={{
                    border: `1px solid ${level.color}35`,
                    padding: '2.25rem',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  whileHover={{
                    scale: 1.02,
                    borderColor: `${level.color}99`,
                    boxShadow: `0 0 48px ${level.color}25, 0 0 80px rgba(139, 92, 246, 0.06)`,
                  }}
                  whileTap={{ scale: 0.995 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2.75rem' }}>{level.icon}</span>
                    {level.badge && (
                      <span style={{ fontSize: '0.7rem', fontWeight: '600', color: level.color, background: `${level.color}22`, padding: '0.25rem 0.5rem', borderRadius: '8px' }}>
                        {level.badge}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.65rem', fontWeight: '700', color: level.color, margin: '0 0 0.5rem 0' }}>
                    {level.name}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 1rem 0' }}>
                    {level.description}
                  </p>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(139, 92, 246, 0.18)' }}>
                    <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: '0 0 0.5rem 0', lineHeight: 1.5 }}>
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

          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#94a3b8', marginBottom: '1.25rem' }}>
            Fun practice
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { name: 'Just Addition', mode: 'addition', icon: '➕' },
              { name: 'Just Division', mode: 'division', icon: '➗' },
              { name: 'Just Multiplication', mode: 'multiplication', icon: '✖️' },
              { name: '2-Digit Multiplication', mode: '2digit-mult', icon: '🔢' },
            ].map((item, index) => (
              <Link key={item.mode} to={`/practice?mode=${item.mode}&difficulty=custom`} style={{ textDecoration: 'none' }}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05, ...motionTransition }}
                  className="glass-panel"
                  style={{
                    padding: '1.2rem 1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                  whileHover={{
                    scale: 1.02,
                    borderColor: 'rgba(139, 92, 246, 0.45)',
                    boxShadow: '0 0 40px rgba(99, 102, 241, 0.15)',
                  }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span style={{ fontSize: '1.65rem' }}>{item.icon}</span>
                  <span style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '1rem' }}>{item.name}</span>
                </motion.div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/practice?mode=custom" style={{ textDecoration: 'none' }}>
              <motion.button
                className="glass-panel"
                style={{
                  padding: '1rem 2.5rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(139, 92, 246, 0.45)',
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: '#e2e8f0',
                  fontSize: '1.05rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 0 32px rgba(99, 102, 241, 0.12)',
                }}
                whileHover={{
                  scale: 1.03,
                  background: 'rgba(99, 102, 241, 0.18)',
                  boxShadow: '0 0 48px rgba(99, 102, 241, 0.2)',
                }}
                whileTap={{ scale: 0.98 }}
                transition={motionTransition}
              >
                🎛️ Create Custom Practice
              </motion.button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, ...motionTransition }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.75rem',
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
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.08, ...motionTransition }}
              className="glass-panel"
              style={{ padding: '2.25rem' }}
              whileHover={{
                scale: 1.02,
                borderColor: 'rgba(139, 92, 246, 0.38)',
                boxShadow: '0 0 48px rgba(99, 102, 241, 0.12), 0 0 96px rgba(139, 92, 246, 0.06)',
              }}
            >
              <div style={{ fontSize: '2.75rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '600', color: '#e2e8f0', margin: '0 0 0.6rem 0' }}>
                {feature.title}
              </h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
