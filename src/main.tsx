import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import './index.css'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      paper: '#0e1526',
      default: '#0e1526',
    },
    primary: {
      main: '#00b0ff',
    },
  },
});

(window as any).global = window;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
    <CssBaseline />

    <App />
    </ThemeProvider>
  </React.StrictMode>,
)
