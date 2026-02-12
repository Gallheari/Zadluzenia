
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, query, where, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useUser } from '../context/UserContext';
import { Box, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Snackbar, Alert, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Button } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import PaymentIcon from '@mui/icons-material/Payment';

function RepayDebt() {
  const { currentUser } = useUser();
  const [activeDebts, setActiveDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [openRepayDialog, setOpenRepayDialog] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [repaymentAmount, setRepaymentAmount] = useState('');

  useEffect(() => {
    if (!currentUser) {
      setActiveDebts([]);
      setLoading(false);
      return;
    }

    const fetchActiveDebts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "debts"), where("owner", "==", currentUser.id), where("paid", "==", false));
        const querySnapshot = await getDocs(q);
        const debtsList = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
          const debtData = docSnapshot.data();
          const subaccountDoc = await getDoc(doc(db, "subaccounts", debtData.subaccountId));
          const subaccountName = subaccountDoc.exists() ? subaccountDoc.data().name : "Nieznane";
          return {
            id: docSnapshot.id,
            subaccountName,
            ...debtData,
            // Zapewnienie wstecznej kompatybilności
            remainingAmount: debtData.remainingAmount ?? debtData.amount
          };
        }));
        setActiveDebts(debtsList);
      } catch (error) {
        console.error("Błąd podczas pobierania długów: ", error);
      }
      setLoading(false);
    };

    fetchActiveDebts();
  }, [currentUser]);

  const handleOpenRepayDialog = (debt) => {
    setSelectedDebt(debt);
    setOpenRepayDialog(true);
    setRepaymentAmount(''); // Reset amount on open
  };

  const handleCloseRepayDialog = () => {
    setOpenRepayDialog(false);
    setSelectedDebt(null);
  };

  const handleConfirmRepayment = async () => {
    if (!selectedDebt || !repaymentAmount || isNaN(repaymentAmount) || parseFloat(repaymentAmount) <= 0) {
        setSnackbarMessage("Wprowadź poprawną kwotę spłaty.");
        setSnackbarSeverity('warning');
        setOpenSnackbar(true);
        return;
    }

    const amountToRepay = parseFloat(repaymentAmount);
    const remaining = selectedDebt.remainingAmount - amountToRepay;

    if (amountToRepay > selectedDebt.remainingAmount) {
        setSnackbarMessage(`Kwota spłaty nie może być większa niż pozostała kwota długu (${selectedDebt.remainingAmount.toFixed(2)} zł).`);
        setSnackbarSeverity('warning');
        setOpenSnackbar(true);
        return;
    }

    const debtRef = doc(db, "debts", selectedDebt.id);

    try {
        await addDoc(collection(db, "repayments"), {
            debtId: selectedDebt.id,
            amount: amountToRepay,
            createdAt: serverTimestamp(),
            owner: currentUser.id,
        });

        await updateDoc(debtRef, {
            remainingAmount: remaining,
            paid: remaining <= 0
        });

        // Update local state
        const updatedDebts = activeDebts.map(debt =>
            debt.id === selectedDebt.id ? { ...debt, remainingAmount: remaining, paid: remaining <= 0 } : debt
        ).filter(debt => !debt.paid);
        setActiveDebts(updatedDebts);

        setSnackbarMessage("Spłata została pomyślnie zapisana!");
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        handleCloseRepayDialog();
    } catch (error) {
        console.error("Błąd podczas zapisywania spłaty: ", error);
        setSnackbarMessage("Wystąpił błąd podczas zapisywania spłaty.");
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
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Spłać Dług</Typography>
      {loading ? (
        <CircularProgress />
      ) : currentUser ? (
        activeDebts.length > 0 ? (
          <List>
            {activeDebts.map(debt => (
              <ListItem key={debt.id} divider>
                <ListItemText
                  primary={debt.description}
                  secondary={`Pozostało: ${debt.remainingAmount.toFixed(2)} zł / ${debt.amount.toFixed(2)} zł (Subkonto: ${debt.subaccountName})`}
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Spłać ten dług">
                    <IconButton edge="end" aria-label="repay" onClick={() => handleOpenRepayDialog(debt)}>
                      <PaymentIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>Brak aktywnych długów do spłacenia.</Typography>
        )
      ) : (
        <Typography>Wybierz użytkownika, aby zobaczyć długi do spłacenia.</Typography>
      )}

      {/* Dialog do spłaty */}
      <Dialog open={openRepayDialog} onClose={handleCloseRepayDialog}>
        <DialogTitle>Spłata Długu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Wprowadź kwotę, którą chcesz spłacić dla długu: <b>{selectedDebt?.description}</b>.
            Pozostało: <b>{selectedDebt?.remainingAmount != null ? selectedDebt.remainingAmount.toFixed(2) : 'N/A'} zł</b>.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="amount"
            label="Kwota spłaty"
            type="number"
            fullWidth
            variant="standard"
            value={repaymentAmount}
            onChange={(e) => setRepaymentAmount(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRepayDialog}>Anuluj</Button>
          <Button onClick={handleConfirmRepayment}>Spłać</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default RepayDebt;
