import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import App from './App.jsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const isClerkKeyConfigured = PUBLISHABLE_KEY && !PUBLISHABLE_KEY.includes('YOUR_CLERK_PUBLISHABLE_KEY_HERE')

export const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: '#F62440',
    colorBackground: '#161622',
    colorSurface: '#161622',
    colorText: '#ffffff',
    colorTextSecondary: '#9ca3af',
    colorInputBackground: '#0d0d14',
    colorInputText: '#ffffff',
    borderRadius: '1rem',
  },
  elements: {
    card: 'bg-[#161622]/95 border border-white/10 shadow-2xl rounded-2xl backdrop-blur-xl',
    headerTitle: 'font-heading font-bold text-white text-xl',
    headerSubtitle: 'text-gray-400 text-sm',
    socialButtonsBlockButton: 'bg-[#0d0d14] border border-white/10 hover:bg-white/10 text-white transition-all',
    socialButtonsBlockButtonText: 'text-white font-medium',
    formButtonPrimary: 'bg-[#F62440] hover:bg-[#F62440]/90 text-white font-bold py-3 shadow-[0_0_15px_rgba(246,36,64,0.4)] transition-all',
    formFieldLabel: 'text-gray-300 font-medium text-sm',
    formFieldInput: 'bg-[#0d0d14] border border-white/10 text-white focus:border-[#F62440] rounded-xl',
    footer: 'bg-[#161622]/95 border-t border-white/10 rounded-b-2xl',
    footerActionText: 'text-gray-400',
    footerActionLink: 'text-[#F62440] hover:text-[#F62440]/80 font-medium',
    dividerLine: 'bg-white/10',
    dividerText: 'text-gray-400 text-xs uppercase tracking-wider',
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isClerkKeyConfigured ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/login" appearance={clerkAppearance}>
        <App />
      </ClerkProvider>
    ) : (
      <App />
    )}
  </React.StrictMode>,
)

