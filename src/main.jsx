import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SolanaWalletContextProvider } from './contexts/SolanaWalletContext'
import { LendingProvider } from './contexts/LendingContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SolanaWalletContextProvider>
        <LendingProvider>
          <App />
        </LendingProvider>
      </SolanaWalletContextProvider>
    </BrowserRouter>
  </StrictMode>,
)
