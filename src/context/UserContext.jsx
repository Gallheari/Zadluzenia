
import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
        
        if (usersList.length > 0) {
          const lastUserId = localStorage.getItem('lastUser');
          const foundUser = usersList.find(u => u.id === lastUserId);
          setCurrentUser(foundUser || usersList[0]);
        } else {
          // Jeśli nie ma użytkowników, utwórz domyślnego
          const defaultUser = { name: 'Domyślny użytkownik' };
          const docRef = await addDoc(collection(db, 'users'), defaultUser);
          const newUser = { id: docRef.id, ...defaultUser };
          setUsers([newUser]);
          setCurrentUser(newUser);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania użytkowników: ", error);
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
        console.error("Błąd podczas dodawania użytkownika: ", error);
      }
    }
  };

  const switchUser = (user) => {
    setCurrentUser(user);
    if (user) {
        localStorage.setItem('lastUser', user.id);
    } else {
        localStorage.removeItem('lastUser');
    }
  };

  const deleteUser = async (userId) => {
    try {
      // Kaskadowe usuwanie danych
      const collections = ['subaccounts', 'debts', 'repayments'];
      for (const coll of collections) {
        const q = query(collection(db, coll), where("userId", "==", userId));
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);
      }

      // Usunięcie użytkownika
      await deleteDoc(doc(db, 'users', userId));

      // Aktualizacja stanu lokalnego
      const remainingUsers = users.filter(u => u.id !== userId);
      setUsers(remainingUsers);

      if (remainingUsers.length > 0) {
        switchUser(remainingUsers[0]);
      } else {
        // Jeśli nie ma więcej użytkowników, stwórz nowego domyślnego
        const defaultUser = { name: 'Domyślny użytkownik' };
        const docRef = await addDoc(collection(db, 'users'), defaultUser);
        const newUser = { id: docRef.id, ...defaultUser };
        setUsers([newUser]);
        switchUser(newUser);
      }

    } catch (error) {
      console.error("Błąd podczas usuwania użytkownika: ", error);
    }
  };

  const value = { currentUser, users, addUser, switchUser, deleteUser, loading };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};
