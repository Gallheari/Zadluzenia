import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

function UserSelector() {
  const { currentUser, users, addUser, switchUser } = useUser();
  const [newUserName, setNewUserName] = useState('');

  const handleAddUser = () => {
    if (newUserName.trim() !== '') {
      addUser(newUserName.trim());
      setNewUserName('');
    }
  };

  return (
    <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
      {currentUser && (
        <div>
          <span>Zalogowany jako: </span>
          <select
            value={currentUser.id}
            onChange={(e) => {
              const user = users.find(u => u.id === e.target.value);
              if (user) switchUser(user);
            }}
          >
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div style={{ marginTop: '10px' }}>
        <input
          type="text"
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          placeholder="Nowa nazwa użytkownika"
        />
        <button onClick={handleAddUser}>Dodaj użytkownika</button>
      </div>
    </div>
  );
}

export default UserSelector;
