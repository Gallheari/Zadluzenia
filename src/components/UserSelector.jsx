
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { Select, MenuItem, FormControl, InputLabel, Button, TextField, Box, Typography, Grid } from '@mui/material';

function UserSelector() {
  const { currentUser, setCurrentUser, addUser } = useUser();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
      
      // Set initial selected user if currentUser is available
      if (currentUser) {
        setSelectedUserId(currentUser.id);
      } else if (usersList.length > 0) {
        // Or default to the first user if no one is selected
        setSelectedUserId(usersList[0].id);
        const userDoc = await getDoc(doc(db, 'users', usersList[0].id));
        setCurrentUser({ id: usersList[0].id, ...userDoc.data() });
      }
    };

    fetchUsers();
  }, [currentUser, setCurrentUser]);

  const handleUserChange = async (event) => {
    const userId = event.target.value;
    setSelectedUserId(userId);
    if (userId) {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if(userDoc.exists()){
        setCurrentUser({ id: userId, ...userDoc.data() });
      }
    } else {
      setCurrentUser(null);
    }
  };

  const handleAddUser = async () => {
    if (newUserName.trim() !== '') {
      await addUser(newUserName.trim());
      setNewUserName('');
      setShowAddUser(false);
      // The user will be switched automatically by the context
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6">Zarządzanie użytkownikami</Typography>
      <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="user-select-label">Wybierz użytkownika</InputLabel>
            <Select
              labelId="user-select-label"
              value={selectedUserId}
              onChange={handleUserChange}
              label="Wybierz użytkownika"
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button variant="outlined" onClick={() => setShowAddUser(!showAddUser)} fullWidth>
            {showAddUser ? 'Anuluj' : 'Dodaj nowego użytkownika'}
          </Button>
        </Grid>
      </Grid>

      {showAddUser && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>Nowy użytkownik</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                    <TextField
                    label="Nazwa użytkownika"
                    variant="outlined"
                    fullWidth
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Button variant="contained" color="primary" onClick={handleAddUser} fullWidth sx={{height: '100%'}}>
                        Dodaj
                    </Button>
                </Grid>
            </Grid>
        </Box>
      )}
    </Box>
  );
}

export default UserSelector;
