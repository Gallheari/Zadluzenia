
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Ikona księżyca (ciemny motyw)
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Ikona słońca (jasny motyw)
import { useThemeContext } from '../context/ThemeContext'; // Import hooka

function Navbar() {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeContext(); // Używamy hooka do zmiany motywu

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <AccountBalanceWalletIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Menedżer Zadłużeń
          </Typography>
          <Button color="inherit" onClick={() => navigate('/')}>Panel główny</Button>
          <Button color="inherit" onClick={() => navigate('/add')}>Dodaj dług</Button>
          <Button color="inherit" onClick={() => navigate('/repay')}>Spłać dług</Button>
          
          {/* Przełącznik motywu */}
          <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;
