
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function UserSelector() {
  const { currentUser, users, addUser, switchUser, deleteUser } = useUser();
  const [newUserName, setNewUserName] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  const handleAddUser = () => {
    if (newUserName.trim() !== '') {
      addUser(newUserName.trim());
      setNewUserName('');
    }
  };

  const handleDeleteUser = () => {
    if (currentUser && deleteConfirmName === currentUser.name) {
      deleteUser(currentUser.id);
      setOpenDeleteDialog(false);
      setDeleteConfirmName('');
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
      {currentUser && (
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="user-select-label">Zalogowany jako</InputLabel>
          <Select
            labelId="user-select-label"
            value={currentUser.id}
            label="Zalogowany jako"
            onChange={(e) => {
              const user = users.find(u => u.id === e.target.value);
              if (user) switchUser(user);
            }}
          >
            {users.map(user => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <TextField
        label="Nowa nazwa użytkownika"
        variant="outlined"
        size="small"
        value={newUserName}
        onChange={(e) => setNewUserName(e.target.value)}
      />
      <Button variant="contained" onClick={handleAddUser}>Dodaj</Button>

      {currentUser && users.length > 0 && (
        <IconButton
          color="error"
          onClick={() => setOpenDeleteDialog(true)}
          sx={{ ml: 1 }}
        >
          <DeleteIcon />
        </IconButton>
      )}

      {/* Okno dialogowe potwierdzenia usunięcia */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Potwierdź usunięcie użytkownika</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Aby trwale usunąć użytkownika <strong>{currentUser?.name}</strong> i wszystkie jego dane (subkonta, długi, historię spłat), wpisz jego nazwę poniżej.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Nazwa użytkownika"
            type="text"
            fullWidth
            variant="standard"
            value={deleteConfirmName}
            onChange={(e) => setDeleteConfirmName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Anuluj</Button>
          <Button
            onClick={handleDeleteUser}
            color="error"
            disabled={deleteConfirmName !== currentUser?.name}
          >
            Zatwierdź usunięcie
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserSelector;
