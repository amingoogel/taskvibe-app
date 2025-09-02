import React, { useMemo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import './index.css';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

const Main = () => {
  const [mode, setMode] = useState(localStorage.getItem('colorMode') || 'light');
  useEffect(() => {
    if (mode === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [mode]);
  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      setMode((prevMode) => {
        const newMode = prevMode === 'light' ? 'dark' : 'light';
        localStorage.setItem('colorMode', newMode);
        return newMode;
      });
    },
  }), []);
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: '#8B5CF6' },
      secondary: { main: '#A855F7' },
      background: {
        default: mode === 'light' ? '#f3f4f6' : '#18181b',
        paper: mode === 'light' ? '#fff' : '#27272a',
      },
    },
    typography: {
      fontFamily: [
        'Vazirmatn', 'Roboto', 'Arial', 'sans-serif'
      ].join(','),
    },
  }), [mode]);
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export { ColorModeContext };

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <Main />
    </BrowserRouter>
  </Provider>
);