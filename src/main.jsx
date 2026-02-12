
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AppThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppThemeProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </AppThemeProvider>
  </StrictMode>,
);
