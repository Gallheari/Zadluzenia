
import { createTheme } from '@mui/material/styles';

// Create a theme instance.
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9c27b0', // Fioletowy akcent
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#212121', // Ciemne tło
      paper: '#424242',   // Tło dla "papierowych" elementów jak karty
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
  },
});

export default theme;
