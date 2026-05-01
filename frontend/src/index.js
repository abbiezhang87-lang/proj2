import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

import App from './App';
import store from './store';

// Warm, light palette that matches the Figma wireframes.
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6b8e7f', dark: '#5a7d6e' },
    background: { default: '#f5f3ee', paper: '#ffffff' },
    text: { primary: '#2d3033', secondary: '#6d7280' },
    divider: '#ece8e1',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: { fontWeight: 600, letterSpacing: '-0.3px' },
    h5: { fontWeight: 600, letterSpacing: '-0.2px' },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
