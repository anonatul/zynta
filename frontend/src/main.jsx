import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/Toast'

const NoiseOverlay = () => <div className="noise-overlay" aria-hidden="true" />

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <App />
        <NoiseOverlay />
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
)