import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/unbounded'
import '@fontsource/chakra-petch/500.css'
import '@fontsource/chakra-petch/600.css'
import '@fontsource/chakra-petch/700.css'
import '@fontsource-variable/saira'
import './styles/global.css'
import './components/fx/shell.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
