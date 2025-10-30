import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRoutes from "./routes"

// Only use StrictMode in development
const isDev = import.meta.env.DEV;

createRoot(document.getElementById('root')).render(
  isDev ? (
    <StrictMode>
      <AppRoutes />
    </StrictMode>
  ) : (
    <AppRoutes />
  ),
)
