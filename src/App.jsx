
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Dashboard from './pages/Dashboard';
import AddDebt from './pages/AddDebt';
import RepayDebt from './pages/RepayDebt';
import Navbar from './components/Navbar';
import UserSelector from './components/UserSelector';
import { useThemeContext } from './context/ThemeContext'; // Import hooka
import { createTheme } from '@mui/material/styles';

// Palety kolorów - te same co w ThemeContext.jsx, dla spójności
const lightThemePalette = {
  primary: { main: '#1976d2' },
  secondary: { main: '#dc004e' },
  background: { default: '#f4f5f7', paper: '#ffffff' },
  text: { primary: '#333333', secondary: '#555555' },
};

const darkThemePalette = {
  primary: { main: '#90caf9' },
  secondary: { main: '#f48fb1' },
  background: { default: '#121212', paper: '#1e1e1e' },
  text: { primary: '#e0e0e0', secondary: '#b0b0b0' },
};

// Główny komponent aplikacji
function App() {
  const { mode } = useThemeContext(); // Używamy hooka do pobrania trybu

  // Tworzymy motyw w oparciu o aktualny tryb
  const theme = React.useMemo(() => createTheme({
    palette: {
      mode,
      ...(mode === 'light' ? lightThemePalette : darkThemePalette),
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <BrowserRouter>
          <Navbar />
          <Container sx={{ mt: 4, mb: 4 }}>
            <UserSelector />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add" element={<AddDebt />} />
              <Route path="/repay" element={<RepayDebt />} />
            </Routes>
          </Container>
        </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
