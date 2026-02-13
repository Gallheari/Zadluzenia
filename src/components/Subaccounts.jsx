
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Tooltip,
  Paper,
  Grid
} from '@mui/material';
import { Edit, Delete, Visibility, Add } from '@mui/icons-material';
import RepaymentHistory from './RepaymentHistory';

function Subaccounts() {
  const { currentUser, updateSubaccount, deleteSubaccount, addSubaccount } = useUser();
  const [subaccounts, setSubaccounts] = useState([]);
  const [newSubaccountName, setNewSubaccountName] = useState('');
  const [editingSubaccount, setEditingSubaccount] = useState(null);
  const [editName, setEditName] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingSubaccount, setDeletingSubaccount] = useState(null);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [historySubaccount, setHistorySubaccount] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const q = query(collection(db, 'subaccounts'), where('userId', '==', currentUser.id));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const subaccountsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSubaccounts(subaccountsList);
      });
      return () => unsubscribe();
    } else {
      setSubaccounts([]);
    }
  }, [currentUser]);

  const handleAddSubaccount = async () => {
    if (newSubaccountName.trim() !== '' && currentUser) {
        await addSubaccount(newSubaccountName.trim());
        setNewSubaccountName('');
        setShowAddForm(false);
    }
  };

  const handleOpenEditDialog = (subaccount) => {
    setEditingSubaccount(subaccount);
    setEditName(subaccount.name);
    setOpenEditDialog(true);
  };

  const handleUpdateSubaccount = async () => {
    if (editingSubaccount && editName.trim() !== '') {
      await updateSubaccount(editingSubaccount.id, editName.trim());
      setOpenEditDialog(false);
      setEditingSubaccount(null);
    }
  };

  const handleOpenDeleteDialog = (subaccount) => {
    setDeletingSubaccount(subaccount);
    setOpenDeleteDialog(true);
  };

  const handleDeleteSubaccount = async () => {
    if (deletingSubaccount) {
      await deleteSubaccount(deletingSubaccount.id);
      setOpenDeleteDialog(false);
      setDeletingSubaccount(null);
    }
  };

  const handleOpenHistoryDialog = (subaccount) => {
    setHistorySubaccount(subaccount);
    setOpenHistoryDialog(true);
  };

  return (
    <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
            Subkonta
            </Typography>
            <Tooltip title="Dodaj nowe subkonto">
            <IconButton onClick={() => setShowAddForm(!showAddForm)}>
                <Add />
            </IconButton>
            </Tooltip>
        </Box>

        {showAddForm && (
            <Paper sx={{ p: 2, mb: 3, mt: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={9}>
                        <TextField
                            label="Nazwa nowego subkonta"
                            variant="outlined"
                            fullWidth
                            value={newSubaccountName}
                            onChange={(e) => setNewSubaccountName(e.target.value)}
                            autoFocus
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button variant="contained" fullWidth onClick={handleAddSubaccount} sx={{height: '100%'}}>Dodaj</Button>
                    </Grid>
                </Grid>
            </Paper>
        )}

      <List sx={{ pt: showAddForm ? 0 : 2 }}>
        {subaccounts.map(subaccount => (
          <Paper key={subaccount.id} sx={{ mb: 1 }}>
            <ListItem 
              secondaryAction={
                <Box>
                  <Tooltip title="Historia spłat">
                    <IconButton edge="end" aria-label="history" onClick={() => handleOpenHistoryDialog(subaccount)}>
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edytuj">
                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditDialog(subaccount)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Usuń">
                    <IconButton edge="end" aria-label="delete" onClick={() => handleOpenDeleteDialog(subaccount)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemText primary={subaccount.name} />
            </ListItem>
          </Paper>
        ))}
      </List>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edytuj nazwę subkonta</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nowa nazwa"
            type="text"
            fullWidth
            variant="outlined"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Anuluj</Button>
          <Button onClick={handleUpdateSubaccount}>Zapisz</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Potwierdź usunięcie</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Czy na pewno chcesz usunąć subkonto "{deletingSubaccount?.name}"? Spowoduje to usunięcie wszystkich powiązanych z nim długów i historii spłat.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Anuluj</Button>
          <Button onClick={handleDeleteSubaccount} color="error">Usuń</Button>
        </DialogActions>
      </Dialog>

      {historySubaccount && (
        <RepaymentHistory 
          open={openHistoryDialog} 
          onClose={() => setOpenHistoryDialog(false)} 
          subaccountId={historySubaccount.id} 
          subaccountName={historySubaccount.name}
        />
      )}
    </Box>
  );
}

export default Subaccounts;
