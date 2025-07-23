import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import ReactDOM from 'react-dom/client';
import App from './App';

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <SnackbarProvider dense autoHideDuration={8000} preventDuplicate>
        <CssBaseline />
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>
);
