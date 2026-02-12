
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { useUser } from '../context/UserContext';
import { Box, TextField, Button, List, ListItem, ListItemText, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';

// Funkcja do formatowania daty
const formatDate = (timestamp) => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toLocaleString('pl-PL');
  }
  return 'Brak daty';
};

function Subaccounts() {
  const { currentUser } = useUser();
  const [subaccounts, setSubaccounts] = useState([]);
  const [newSubaccount, setNewSubaccount] = useState('');
  const [loading, setLoading] = useState(true);

  // Stany do obsługi okna dialogowego historii
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedSubaccount, setSelectedSubaccount] = useState(null);
  const [repaymentHistory, setRepaymentHistory] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      setSubaccounts([]);
      setLoading(false);
      return;
    }
    const fetchSubaccounts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "subaccounts"), where("owner", "==", currentUser.id));
        const querySnapshot = await getDocs(q);
        const subaccountsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSubaccounts(subaccountsList);
      } catch (error) {
        console.error("Błąd podczas pobierania subkont: ", error);
      }
      setLoading(false);
    };

    fetchSubaccounts();
  }, [currentUser]);

  const handleAddSubaccount = async () => {
    if (newSubaccount.trim() === '') return;
    try {
      const docRef = await addDoc(collection(db, "subaccounts"), {
        name: newSubaccount,
        owner: currentUser.id
      });
      setSubaccounts([...subaccounts, { id: docRef.id, name: newSubaccount, owner: currentUser.id }]);
      setNewSubaccount('');
    } catch (error) {
      console.error("Błąd podczas dodawania subkonta: ", error);
    }
  };

  const handleOpenHistory = async (subaccount) => {
    setSelectedSubaccount(subaccount);
    setOpenHistoryDialog(true);
    setHistoryLoading(true);

    try {
      // 1. Znajdź wszystkie długi dla danego subkonta
      const debtsQuery = query(collection(db, 'debts'), where('subaccountId', '==', subaccount.id));
      const debtsSnapshot = await getDocs(debtsQuery);
      const debtsMap = new Map(debtsSnapshot.docs.map(doc => [doc.id, doc.data()]));
      const debtIds = Array.from(debtsMap.keys());

      if (debtIds.length === 0) {
        setRepaymentHistory([]);
        setHistoryLoading(false);
        return;
      }

      // 2. Znajdź wszystkie spłaty dla tych długów
      const repaymentsQuery = query(collection(db, 'repayments'), where('debtId', 'in', debtIds));
      const repaymentsSnapshot = await getDocs(repaymentsQuery);
      const history = repaymentsSnapshot.docs.map(doc => {
        const repaymentData = doc.data();
        const debt = debtsMap.get(repaymentData.debtId);
        return {
          id: doc.id,
          ...repaymentData,
          debtDescription: debt ? debt.description : 'Nieznany dług'
        };
      }).sort((a, b) => b.createdAt - a.createdAt); // Sortuj od najnowszych

      setRepaymentHistory(history);
    } catch (error) {
      console.error("Błąd podczas pobierania historii spłat: ", error);
      setRepaymentHistory([]);
    }

    setHistoryLoading(false);
  };

  const handleCloseHistory = () => {
    setOpenHistoryDialog(false);
    setSelectedSubaccount(null);
    setRepaymentHistory([]);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <TextField
          label="Nowe subkonto"
          variant="outlined"
          size="small"
          value={newSubaccount}
          onChange={(e) => setNewSubaccount(e.target.value)}
          sx={{ flexGrow: 1, mr: 1 }}
        />
        <Button variant="contained" onClick={handleAddSubaccount}>Dodaj</Button>
      </Box>
      {loading ? (
        <Typography>Ładowanie...</Typography>
      ) : (
        <List>
          {subaccounts.map((sub) => (
            <ListItem key={sub.id} divider secondaryAction={
              <IconButton edge="end" aria-label="historia" onClick={() => handleOpenHistory(sub)}>
                <HistoryIcon />
              </IconButton>
            }>
              <ListItemText primary={sub.name} />
            </ListItem>
          ))}
        </List>
      )}

      {/* Okno dialogowe historii spłat */}
      <Dialog open={openHistoryDialog} onClose={handleCloseHistory} fullWidth maxWidth="md">
        <DialogTitle>Historia spłat dla: {selectedSubaccount?.name}</DialogTitle>
        <DialogContent dividers>
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
          ) : repaymentHistory.length > 0 ? (
            <List>
              {repaymentHistory.map(repayment => (
                <ListItem key={repayment.id}>
                  <ListItemText 
                    primary={`Kwota: ${repayment.amount.toFixed(2)} zł`}
                    secondary={`Data: ${formatDate(repayment.createdAt)} | Dług: ${repayment.debtDescription}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography sx={{ p: 2 }}>Brak historii spłat dla tego subkonta.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistory}>Zamknij</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Subaccounts;
