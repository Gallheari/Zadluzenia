
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { collection, addDoc, onSnapshot, query, where, doc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Box,
  Button,
  TextField,
  List,
  ListItem,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  Grid,
  Paper,
} from '@mui/material';
import { Edit, Delete, Payment, Add } from '@mui/icons-material';
import PayDebt from './PayDebt';

function Debts() {
  const { currentUser, updateDebt } = useUser();
  const [debts, setDebts] = useState([]);
  const [subaccounts, setSubaccounts] = useState([]);
  const [newDebt, setNewDebt] = useState({ description: '', amount: '', subaccountId: '' });
  const [payingDebt, setPayingDebt] = useState(null);
  const [editingDebt, setEditingDebt] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const subaccountsQuery = query(collection(db, 'subaccounts'), where('userId', '==', currentUser.id));
      const debtsQuery = query(collection(db, 'debts'), where('userId', '==', currentUser.id));

      const unsubscribeSubaccounts = onSnapshot(subaccountsQuery, (snapshot) => {
        const subaccountsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSubaccounts(subaccountsList);
      });

      const unsubscribeDebts = onSnapshot(debtsQuery, async (snapshot) => {
        const debtsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const debtsWithSubaccountNames = await Promise.all(debtsList.map(async (debt) => {
            const subaccount = subaccounts.find(s => s.id === debt.subaccountId);
            return { ...debt, subaccountName: subaccount ? subaccount.name : "Brak subkonta" };
        }));
        setDebts(debtsWithSubaccountNames);
      });

      return () => {
        unsubscribeSubaccounts();
        unsubscribeDebts();
      };
    } else {
      setSubaccounts([]);
      setDebts([]);
    }
  }, [currentUser, subaccounts]);

  const handleAddDebt = async () => {
    if (newDebt.description.trim() !== '' && newDebt.amount > 0 && newDebt.subaccountId && currentUser) {
        const amount = parseFloat(newDebt.amount);
        await addDoc(collection(db, 'debts'), {
            ...newDebt,
            amount,
            remainingAmount: amount, 
            userId: currentUser.id,
            createdAt: new Date(),
        });
        setNewDebt({ description: '', amount: '', subaccountId: '' });
        setShowAddForm(false);
    }
  };

  const handleDeleteDebt = async (debtId) => {
    try {
      const batch = writeBatch(db);
      const repaymentsQuery = query(collection(db, 'repayments'), where('debtId', '==', debtId));
      const repaymentsSnapshot = await getDocs(repaymentsQuery);
      repaymentsSnapshot.forEach(doc => batch.delete(doc.ref));
      
      batch.delete(doc(db, 'debts', debtId));
      await batch.commit();

    } catch (error) {
      console.error("Błąd podczas usuwania długu: ", error);
    }
  };

  const handleOpenEditDialog = (debt) => {
    setEditingDebt(debt);
    setOpenEditDialog(true);
  };

  const handleUpdateDebt = async () => {
    if (editingDebt) {
      await updateDebt(editingDebt.id, {
        description: editingDebt.description,
        amount: parseFloat(editingDebt.amount),
      });
      setOpenEditDialog(false);
      setEditingDebt(null);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
                Długi
            </Typography>
            <Tooltip title="Dodaj nowy dług">
                <IconButton onClick={() => setShowAddForm(!showAddForm)}>
                    <Add />
                </IconButton>
            </Tooltip>
      </Box>
      
      {showAddForm && (
        <Paper sx={{ p: 2, mb: 3, mt: 2 }}>
            <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
                <TextField
                label="Opis długu"
                variant="outlined"
                fullWidth
                value={newDebt.description}
                onChange={(e) => setNewDebt({ ...newDebt, description: e.target.value })}
                autoFocus
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                label="Kwota"
                variant="outlined"
                type="number"
                fullWidth
                value={newDebt.amount}
                onChange={(e) => setNewDebt({ ...newDebt, amount: e.target.value })}
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                <InputLabel>Subkonto</InputLabel>
                <Select
                    value={newDebt.subaccountId}
                    label="Subkonto"
                    onChange={(e) => setNewDebt({ ...newDebt, subaccountId: e.target.value })}
                >
                    {subaccounts.map(sub => (
                    <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>
                    ))}
                </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
                <Button variant="contained" fullWidth onClick={handleAddDebt} sx={{height: '100%'}}>Dodaj</Button>
            </Grid>
            </Grid>
        </Paper>
      )}

      <List sx={{ pt: showAddForm ? 0 : 2 }}>
        {debts.map(debt => (
          <Paper key={debt.id} sx={{ mb: 2, p: 2 }}>
            <ListItem 
              sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start' }}
              secondaryAction={
                <Box sx={{ mt: { xs: 2, sm: 0 }, ml: { sm: 2 } }}>
                    <Tooltip title="Spłać">
                        <IconButton onClick={() => setPayingDebt(debt)}><Payment /></IconButton>
                    </Tooltip>
                    <Tooltip title="Edytuj">
                        <IconButton onClick={() => handleOpenEditDialog(debt)}><Edit /></IconButton>
                    </Tooltip>
                    <Tooltip title="Usuń">
                        <IconButton onClick={() => handleDeleteDebt(debt.id)}><Delete /></IconButton>
                    </Tooltip>
                </Box>
              }
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{debt.description}</Typography>
                <Typography variant="body2" color="text.secondary">{`Subkonto: ${debt.subaccountName}`}</Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1}}>
                  <Typography variant="body1">Kwota: <strong>{debt.amount.toFixed(2)} zł</strong></Typography>
                  <Typography variant="body1" color="error">Pozostało: <strong>{debt.remainingAmount.toFixed(2)} zł</strong></Typography>
                </Box>
              </Box>
            </ListItem>
          </Paper>
        ))}
      </List>

      {payingDebt && (
        <PayDebt 
          debt={payingDebt} 
          open={!!payingDebt} 
          onClose={() => setPayingDebt(null)} 
        />
      )}

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edytuj dług</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Opis"
            type="text"
            fullWidth
            variant="outlined"
            value={editingDebt?.description || ''}
            onChange={(e) => setEditingDebt({ ...editingDebt, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Kwota"
            type="number"
            fullWidth
            variant="outlined"
            value={editingDebt?.amount || ''}
            onChange={(e) => setEditingDebt({ ...editingDebt, amount: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Anuluj</Button>
          <Button onClick={handleUpdateDebt}>Zapisz</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default Debts;
