
import React, { createContext, useState, useMemo, useContext } from 'react';
import { createTheme } from '@mui/material/styles';

// Definicje palet kolorów
const lightThemePalette = {
  primary: { main: '#1976d2' }, // Niebieski
  secondary: { main: '#dc004e' }, // Różowy
  background: { default: '#f4f5f7', paper: '#ffffff' },
  text: { primary: '#333333', secondary: '#555555' },
};

const darkThemePalette = {
  primary: { main: '#90caf9' }, // Jasnoniebieski
  secondary: { main: '#f48fb1' }, // Jasnoróżowy
  background: { default: '#121212', paper: '#1e1e1e' },
  text: { primary: '#e0e0e0', secondary: '#b0b0b0' },
};

// Kontekst do przechowywania stanu motywu
export const ThemeContext = createContext({
  toggleTheme: () => {},
  mode: 'light',
});

export const useThemeContext = () => useContext(ThemeContext);

export const AppThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      ...(mode === 'light' ? lightThemePalette : darkThemePalette),
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'unset'
                }
            }
        }
    }
  }), [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const contextValue = useMemo(() => ({
    toggleTheme,
    mode,
  }), [mode]);

  return (
    <ThemeContext.Provider value={contextValue}>
        {children}
    </ThemeContext.Provider>
  );
};
