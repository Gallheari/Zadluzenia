import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
        if (usersList.length > 0) {
          const lastUser = localStorage.getItem('lastUser');
          const foundUser = usersList.find(u => u.id === lastUser);
          setCurrentUser(foundUser || usersList[0]);
        } else {
          // If no users, create a default one
          const defaultUser = { name: 'Default User' };
          const docRef = await addDoc(collection(db, 'users'), defaultUser);
          const newUser = { id: docRef.id, ...defaultUser };
          setUsers([newUser]);
          setCurrentUser(newUser);
        }
      } catch (error) {
        console.error("Error fetching users: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const addUser = async (name) => {
    if (name && !users.find(u => u.name === name)) {
      try {
        const docRef = await addDoc(collection(db, 'users'), { name });
        const newUser = { id: docRef.id, name };
        setUsers([...users, newUser]);
        switchUser(newUser);
      } catch (error) {
        console.error("Error adding user: ", error);
      }
    }
  };

  const switchUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem('lastUser', user.id);
  };

  const value = { currentUser, users, addUser, switchUser, loading };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};
