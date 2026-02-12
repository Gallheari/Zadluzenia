import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { useUser } from '../context/UserContext';

function AddDebt() {
  const { currentUser } = useUser();
  const [subaccounts, setSubaccounts] = useState([]);
  const [selectedSubaccount, setSelectedSubaccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

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
      if (subaccountsList.length > 0) {
        setSelectedSubaccount(subaccountsList[0].id);
      }
    };

    fetchSubaccounts();
  }, [currentUser]);

  const handleAddDebt = async (e) => {
    e.preventDefault();
    if (!selectedSubaccount || !amount || !description || !currentUser) {
      alert("Proszę wypełnić wszystkie pola i wybrać użytkownika.");
      return;
    }

    try {
      await addDoc(collection(db, "debts"), {
        subaccountId: selectedSubaccount,
        amount: parseFloat(amount),
        description: description,
        createdAt: serverTimestamp(),
        paid: false,
        owner: currentUser.id
      });
      alert("Dług został dodany!");
      setAmount('');
      setDescription('');
    } catch (error) {
      console.error("Błąd podczas dodawania długu: ", error);
      alert("Wystąpił błąd podczas dodawania długu.");
    }
  };

  return (
    <div>
      <h1>Dodaj dług</h1>
       {currentUser ? (
      <form onSubmit={handleAddDebt}>
        <div>
          <label>Subkonto:</label>
          <select value={selectedSubaccount} onChange={(e) => setSelectedSubaccount(e.target.value)}>
            {subaccounts.map(subaccount => (
              <option key={subaccount.id} value={subaccount.id}>
                {subaccount.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Kwota:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Kwota długu"
          />
        </div>
        <div>
          <label>Opis:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Opis długu"
          />
        </div>
        <button type="submit">Dodaj dług</button>
      </form>
        ) : (
        <p>Wybierz użytkownika, aby dodać dług.</p>
      )}
    </div>
  );
}

export default AddDebt;
