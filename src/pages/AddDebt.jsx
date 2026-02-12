
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { useUser } from '../context/UserContext';
import { Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert } from '@mui/material';

function AddDebt() {
  const { currentUser } = useUser();
  const [subaccounts, setSubaccounts] = useState([]);
  const [selectedSubaccount, setSelectedSubaccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    if (!currentUser) {
      setSubaccounts([]);
      return;
    }
    const fetchSubaccounts = async () => {
      const q = query(collection(db, "subaccounts"), where("owner", "==", currentUser.id));
      const querySnapshot = await getDocs(q);
      const subaccountsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubaccounts(subaccountsList);
      if (subaccountsList.length > 0) {
        setSelectedSubaccount(subaccountsList[0].id);
      } else {
        setSelectedSubaccount('');
      }
    };

    fetchSubaccounts();
  }, [currentUser]);

  const handleAddDebt = async (e) => {
    e.preventDefault();
    if (!selectedSubaccount || !amount || !description || !currentUser) {
      setSnackbarMessage("Proszę wypełnić wszystkie pola.");
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
      return;
    }

    const debtAmount = parseFloat(amount);

    try {
      await addDoc(collection(db, "debts"), {
        subaccountId: selectedSubaccount,
        amount: debtAmount,
        remainingAmount: debtAmount, // Ustawienie początkowej pozostałej kwoty
        description: description,
        createdAt: serverTimestamp(),
        paid: false,
        owner: currentUser.id
      });
      setSnackbarMessage("Dług został pomyślnie dodany!");
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setAmount('');
      setDescription('');
    } catch (error) {
      console.error("Błąd podczas dodawania długu: ", error);
      setSnackbarMessage("Wystąpił błąd podczas dodawania długu.");
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Box component="form" onSubmit={handleAddDebt} sx={{ maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Dodaj Dług</Typography>
      {currentUser ? (
        <>
          <FormControl fullWidth margin="normal">
            <InputLabel id="subaccount-select-label">Subkonto</InputLabel>
            <Select
              labelId="subaccount-select-label"
              value={selectedSubaccount}
              label="Subkonto"
              onChange={(e) => setSelectedSubaccount(e.target.value)}
              disabled={subaccounts.length === 0}
            >
              {subaccounts.map(subaccount => (
                <MenuItem key={subaccount.id} value={subaccount.id}>
                  {subaccount.name}
                </MenuItem>
              ))}
            </Select>
            {subaccounts.length === 0 && <Typography variant="caption" color="textSecondary">Najpierw dodaj subkonto na panelu głównym.</Typography>}
          </FormControl>
          <TextField
            label="Kwota"
            type="number"
            fullWidth
            margin="normal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <TextField
            label="Opis"
            type="text"
            fullWidth
            margin="normal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Dodaj Dług
          </Button>
        </>
      ) : (
        <Typography>Wybierz użytkownika, aby dodać dług.</Typography>
      )}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AddDebt;
