import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// MUI ThemeProvider will be used if MUI is installed. We keep the import dynamic for now.
let Root = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// If MUI is installed, try to enhance the root with ThemeProvider and CssBaseline
try {
  // dynamic import so the file doesn't crash if packages are not installed yet
  // eslint-disable-next-line no-undef
  const { ThemeProvider } = await import('@mui/material/styles')
  const { CssBaseline } = await import('@mui/material')
  const themeModule = await import('./theme.js')
  Root = (
    <React.StrictMode>
      <ThemeProvider theme={themeModule.default}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </React.StrictMode>
  )
} catch (e) {
  // If imports fail (MUI not installed), fall back to the plain app.
  // This keeps the repo runnable before npm install.
}

ReactDOM.createRoot(document.getElementById('root')).render(Root)
