import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AppProvider } from './Context/AppContext'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="47416955148-nadi1v295l9u6f6flfqkoknsa5nj91qi.apps.googleusercontent.com">
      <AppProvider>
      <App />
      </AppProvider>
    </GoogleOAuthProvider>
    
  </StrictMode>,
)
