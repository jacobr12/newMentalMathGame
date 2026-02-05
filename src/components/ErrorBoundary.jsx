import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info?.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#050308',
            color: '#e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'system-ui, sans-serif',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              padding: '2rem',
              background: 'rgba(12, 12, 28, 0.9)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '16px',
              boxShadow: '0 0 40px rgba(239, 68, 68, 0.15)',
            }}
          >
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#fca5a5' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
              The app crashed. Try refreshing the page. If it keeps happening, check the browser console (F12) for details.
            </p>
            <p
              style={{
                color: '#64748b',
                fontSize: '0.8rem',
                marginBottom: '1.25rem',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
              }}
              title={this.state.error?.stack}
            >
              {this.state.error?.message || String(this.state.error)}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '10px',
                border: '1px solid rgba(139, 92, 246, 0.5)',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#e2e8f0',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
