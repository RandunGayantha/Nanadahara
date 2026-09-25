import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import SetupRequired from './pages/SetupRequired.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { firebaseConfigured } from './lib/firebase.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>{firebaseConfigured ? <App /> : <SetupRequired />}</ErrorBoundary>
  </StrictMode>
)
