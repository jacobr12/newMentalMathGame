import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const navTransition = { type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.35 }

export default function Navigation() {
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/daily', label: 'Daily' },
    { path: '/practice', label: 'Practice' },
    { path: '/stats', label: 'Stats' },
    ...(user?.isAdmin ? [{ path: '/admin', label: 'Admin' }] : []),
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...navTransition, duration: 0.5 }}
      className="glass-panel"
      style={{
        position: 'relative',
        zIndex: 100,
        margin: 0,
        borderRadius: 0,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: '1px solid rgba(139, 92, 246, 0.22)',
        boxShadow: '0 0 48px rgba(99, 102, 241, 0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
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
          <motion.span
            className="gradient-text"
            style={{
              display: 'inline-block',
              fontSize: '1.45rem',
              fontWeight: '700',
              letterSpacing: '-0.02em',
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            MathMaster
          </motion.span>
        </Link>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                textDecoration: 'none',
                color: location.pathname === item.path ? '#a78bfa' : 'rgba(226, 232, 240, 0.82)',
                fontWeight: location.pathname === item.path ? '600' : '500',
                position: 'relative',
                fontSize: '0.95rem',
                letterSpacing: '0.01em',
                padding: '0.35rem 0',
              }}
            >
              {location.pathname === item.path && (
                <motion.div
                  layoutId="activeTab"
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
                    borderRadius: '2px',
                    boxShadow: '0 0 14px rgba(139, 92, 246, 0.45)',
                  }}
                  transition={{ type: 'spring', stiffness: 480, damping: 32 }}
                />
              )}
              {item.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link to="/profile" style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={navTransition}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '14px',
                    border: '1px solid rgba(139, 92, 246, 0.28)',
                    background: 'rgba(99, 102, 241, 0.08)',
                    boxShadow: '0 0 24px rgba(99, 102, 241, 0.08)',
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
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: '500' }}>
                    {user?.name ? user.name.split(' ')[0] : 'Profile'}
                  </span>
                </motion.div>
              </Link>
              <motion.button
                onClick={handleLogout}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.9rem',
                }}
                whileHover={{ borderColor: 'rgba(139, 92, 246, 0.35)', color: '#e2e8f0' }}
                whileTap={{ scale: 0.97 }}
                transition={navTransition}
              >
                Log out
              </motion.button>
            </div>
          ) : (
            <Link to="/login">
              <motion.button
                style={{
                  padding: '0.5rem 1.5rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(139, 92, 246, 0.45)',
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  boxShadow: '0 0 28px rgba(99, 102, 241, 0.12)',
                }}
                whileHover={{
                  background: 'rgba(99, 102, 241, 0.2)',
                  boxShadow: '0 0 36px rgba(99, 102, 241, 0.22)',
                }}
                whileTap={{ scale: 0.97 }}
                transition={navTransition}
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
