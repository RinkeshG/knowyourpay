import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('App error:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 480, margin: '40px auto', lineHeight: 1.6 }}>
          <h1 style={{ fontSize: 20, marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ color: '#64748b', marginBottom: 16 }}>The app failed to load. Try refreshing. If you just deployed, add the Firebase env vars in Vercel (Settings → Environment Variables), then redeploy.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', cursor: 'pointer', fontSize: 14 }}>Reload</button>
        </div>
      )
    }
    return this.props.children
  }
}

const root = document.getElementById('root')
if (!root) {
  document.body.innerHTML = '<p style="font-family:system-ui;padding:24px">Root element not found.</p>'
} else {
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}
