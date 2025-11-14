import React from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { ErrorBoundary } from './Components/ErrorBoundary'
import { SidebarProvider } from './context/SidebarContext'
import { NotificationProvider } from './context/NotificationContext'
import App from './App'
import './index.css'

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <SidebarProvider>
            <App />
          </SidebarProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
)