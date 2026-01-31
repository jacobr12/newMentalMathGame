import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function Navigation() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: 'Home' },
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
          
          {isAuthenticated ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link to="/profile" style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 600 }}>
                <motion.div whileHover={{ scale: 1.05 }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 16, background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                    {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span style={{ color: '#e2e8f0' }}>{user && user.name ? user.name.split(' ')[0] : 'Profile'}</span>
                </motion.div>
              </Link>
              <motion.button
                onClick={handleLogout}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'transparent',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.9rem',
                }}
                whileHover={{ scale: 1.03 }}
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
          )}
        </div>
      </div>
    </nav>
  )
}
