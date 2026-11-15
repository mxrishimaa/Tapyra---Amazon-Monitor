import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Encontra o elemento vazio do HTML onde o React desenha toda a aplicação.
createRoot(document.getElementById('root')).render(
  // StrictMode ajuda a identificar padrões problemáticos durante o desenvolvimento.
  <StrictMode>
    <App />
  </StrictMode>
)