import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function Navigation() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/daily', label: 'Daily' },
    { path: '/practice', label: 'Practice' },
    { path: '/stats', label: 'Stats' },
  ]

  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'relative',
        zIndex: 100,
        background: 'rgba(10, 10, 30, 0.5)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.25)',
        boxShadow: '0 0 40px rgba(99, 102, 241, 0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
        padding: '1rem 2rem',
      }}
    >
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
              letterSpacing: '0.05em',
              background: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
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
                color: location.pathname === item.path ? '#a78bfa' : 'rgba(226, 232, 240, 0.85)',
                fontWeight: location.pathname === item.path ? '600' : '400',
                position: 'relative',
                fontSize: '0.95rem',
                letterSpacing: '0.02em',
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
                    background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
                    borderRadius: '2px',
                    boxShadow: '0 0 12px rgba(139, 92, 246, 0.5)',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              {item.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link to="/profile" style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 600 }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    background: 'rgba(99, 102, 241, 0.08)',
                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.1)',
                  }}
                >
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}>
                    {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{user && user.name ? user.name.split(' ')[0] : 'Profile'}</span>
                </motion.div>
              </Link>
              <motion.button
                onClick={handleLogout}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.9rem',
                }}
                whileHover={{ scale: 1.03, borderColor: 'rgba(139, 92, 246, 0.3)', color: '#e2e8f0' }}
                whileTap={{ scale: 0.97 }}
              >
                Log out
              </motion.button>
            </div>
          ) : (
            <Link to="/login">
              <motion.button
                style={{
                  padding: '0.5rem 1.5rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(139, 92, 246, 0.5)',
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.9rem',
                  boxShadow: '0 0 24px rgba(99, 102, 241, 0.15)',
                }}
                whileHover={{
                  background: 'rgba(99, 102, 241, 0.2)',
                  scale: 1.05,
                  boxShadow: '0 0 32px rgba(99, 102, 241, 0.25)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
