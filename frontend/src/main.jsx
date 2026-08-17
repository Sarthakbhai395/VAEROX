import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { WishlistProvider } from './contexts/WishlistContext'
import { ModeProvider } from './contexts/ModeContext'
import { NotificationProvider } from './contexts/NotificationContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ModeProvider>
                <App />
              </ModeProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </Router>
  </React.StrictMode>,
)
