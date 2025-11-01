import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRoutes from "./routes"

import store from './store'
import { Provider } from 'react-redux'

// Only use StrictMode in development
const isDev = import.meta.env.DEV;

createRoot(document.getElementById('root')).render(
  isDev ? (
    <StrictMode>
      <Provider store={store}>
        <AppRoutes />
      </Provider>
    </StrictMode>
  ) : (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  ),
)
