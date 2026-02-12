import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { useUser } from '../context/UserContext';

function Subaccounts() {
  const { currentUser } = useUser();
  const [subaccounts, setSubaccounts] = useState([]);
  const [newSubaccount, setNewSubaccount] = useState('');

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
    };

    fetchSubaccounts();
  }, [currentUser]);

  const handleAddSubaccount = async () => {
    if (newSubaccount.trim() === '' || !currentUser) return;

    try {
      const docRef = await addDoc(collection(db, "subaccounts"), {
        name: newSubaccount,
        owner: currentUser.id
      });
      setSubaccounts([...subaccounts, { id: docRef.id, name: newSubaccount, owner: currentUser.id }]);
      setNewSubaccount('');
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div>
      <h2>Subkonta</h2>
      {currentUser ? (
        <>
          <ul>
            {subaccounts.map(subaccount => (
              <li key={subaccount.id}>{subaccount.name}</li>
            ))}
          </ul>
          <input
            type="text"
            value={newSubaccount}
            onChange={(e) => setNewSubaccount(e.target.value)}
            placeholder="Nazwa nowego subkonta"
          />
          <button onClick={handleAddSubaccount}>Dodaj subkonto</button>
        </>
      ) : (
        <p>Wybierz użytkownika, aby zarządzać subkontami.</p>
      )}
    </div>
  );
}

export default Subaccounts;
