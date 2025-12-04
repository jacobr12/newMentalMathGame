import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Background3D from '../components/Background3D'
import Navigation from '../components/Navigation'

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
          transition={{ duration: 0.6 }}
        >
          <h1 style={{
            fontSize: '4.5rem',
            fontWeight: '800',
            margin: '0 0 1rem 0',
            lineHeight: '1.1',
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Master Mental Math
          </h1>
          
          <p style={{
            fontSize: '1.5rem',
            color: '#cbd5e1',
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
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            marginBottom: '5rem',
          }}
        >
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#e2e8f0',
            marginBottom: '2rem',
            textAlign: 'center',
          }}>
            Choose Your Challenge
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
          }}>
            {[
              {
                name: 'Easy',
                icon: '🌱',
                description: 'Perfect for beginners',
                details: 'Numbers 1-50, Addition, Subtraction, Multiplication',
                time: '60 seconds',
                difficulty: 'easy',
                color: '#10b981',
              },
              {
                name: 'Medium',
                icon: '🔥',
                description: 'For the experienced',
                details: 'Numbers 1-100, Addition, Subtraction, Multiplication',
                time: '60 seconds',
                difficulty: 'medium',
                color: '#f59e0b',
              },
              {
                name: 'Hard',
                icon: '⚡',
                description: 'Ultimate challenge',
                details: 'Numbers 1-500, Addition, Subtraction, Multiplication',
                time: '60 seconds',
                difficulty: 'hard',
                color: '#ef4444',
              },
            ].map((level, index) => (
              <Link
                key={level.difficulty}
                to={`/practice?difficulty=${level.difficulty}`}
                style={{ textDecoration: 'none' }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  style={{
                    backdropFilter: 'blur(20px)',
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    border: `1px solid ${level.color}40`,
                    borderRadius: '20px',
                    padding: '2.5rem',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    borderColor: level.color,
                    boxShadow: `0 15px 40px ${level.color}40`,
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    {level.icon}
                  </div>
                  <h3 style={{
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    color: level.color,
                    margin: '0 0 0.5rem 0',
                  }}>
                    {level.name}
                  </h3>
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '0.95rem',
                    margin: '0 0 1rem 0',
                  }}>
                    {level.description}
                  </p>
                  <div style={{
                    marginTop: 'auto',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(99, 102, 241, 0.2)',
                  }}>
                    <p style={{
                      color: '#cbd5e1',
                      fontSize: '0.9rem',
                      margin: '0 0 0.5rem 0',
                      lineHeight: '1.5',
                    }}>
                      {level.details}
                    </p>
                    <p style={{
                      color: '#6366f1',
                      fontSize: '0.85rem',
                      margin: 0,
                      fontWeight: '600',
                    }}>
                      ⏱ {level.time}
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <Link to="/practice?mode=custom" style={{ textDecoration: 'none' }}>
              <motion.button
                style={{
                  padding: '1rem 3rem',
                  borderRadius: '12px',
                  border: '2px solid #6366f1',
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: '#e2e8f0',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
                whileHover={{ 
                  scale: 1.05,
                  background: 'rgba(99, 102, 241, 0.2)',
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
            {
              icon: '⚡',
              title: 'Fast Calculations',
              description: 'Improve your speed and accuracy with timed challenges',
            },
            {
              icon: '📊',
              title: 'Track Progress',
              description: 'Monitor your improvement with detailed statistics',
            },
            {
              icon: '🎯',
              title: 'Custom Practice',
              description: 'Create your own practice sessions tailored to your needs',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              style={{
                backdropFilter: 'blur(20px)',
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '20px',
                padding: '2.5rem',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              }}
              whileHover={{ 
                scale: 1.05,
                borderColor: 'rgba(99, 102, 241, 0.6)',
                boxShadow: '0 15px 40px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#e2e8f0',
                margin: '0 0 0.75rem 0',
              }}>
                {feature.title}
              </h3>
              <p style={{
                color: '#94a3b8',
                lineHeight: '1.6',
                margin: 0,
              }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
