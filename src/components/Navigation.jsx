import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Navigation() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/practice', label: 'Practice' },
    { path: '/stats', label: 'Stats' },
  ]
  
  return (
    <nav style={{
      position: 'relative',
      zIndex: 100,
      backdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
      padding: '1rem 2rem',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <motion.h1
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            whileHover={{ scale: 1.05 }}
          >
            MathMaster
          </motion.h1>
        </Link>
        
        <div style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'center',
        }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                textDecoration: 'none',
                color: location.pathname === item.path ? '#6366f1' : '#e2e8f0',
                fontWeight: location.pathname === item.path ? '600' : '400',
                position: 'relative',
              }}
            >
              {location.pathname === item.path && (
                <motion.div
                  layoutId="activeTab"
                  style={{
                    position: 'absolute',
                    bottom: '-8px',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, #6366f1, #ec4899)',
                    borderRadius: '2px',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              {item.label}
            </Link>
          ))}
          
          <Link to="/login">
            <motion.button
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                border: '1px solid #6366f1',
                background: 'rgba(99, 102, 241, 0.1)',
                color: '#e2e8f0',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.9rem',
              }}
              whileHover={{ 
                background: 'rgba(99, 102, 241, 0.2)',
                scale: 1.05 
              }}
              whileTap={{ scale: 0.95 }}
            >
              Sign In
            </motion.button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
