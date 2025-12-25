import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'uno.css' // ✅ This line enables UnoCSS
import './index.css'
import './responsive.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
