import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/context/AuthProvider'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
            <AuthProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    </StrictMode>,
)