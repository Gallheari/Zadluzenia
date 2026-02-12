import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { useUser } from '../context/UserContext';

function RepayDebt() {
  const { currentUser } = useUser();
  const [activeDebts, setActiveDebts] = useState([]);

  useEffect(() => {
    if (!currentUser) {
        setActiveDebts([]);
        return;
    }
    const fetchActiveDebts = async () => {
      const q = query(collection(db, "debts"), where("owner", "==", currentUser.id), where("paid", "==", false));
      const querySnapshot = await getDocs(q);
      const debtsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActiveDebts(debtsList);
    };

    fetchActiveDebts();
  }, [currentUser]);

  const handleRepayDebt = async (debtId) => {
    const debtRef = doc(db, "debts", debtId);
    try {
      await updateDoc(debtRef, {
        paid: true
      });
      // Update the list of active debts locally
      setActiveDebts(activeDebts.filter(debt => debt.id !== debtId));
      alert("Dług został spłacony!");
    } catch (error) {
      console.error("Błąd podczas spłacania długu: ", error);
      alert("Wystąpił błąd podczas spłacania długu.");
    }
  };

  return (
    <div>
      <h1>Spłać dług</h1>
      {currentUser ? (
        <>
            {activeDebts.length > 0 ? (
                <ul>
                {activeDebts.map(debt => (
                    <li key={debt.id} onClick={() => handleRepayDebt(debt.id)} style={{ cursor: 'pointer' }}>
                    {debt.description} - {debt.amount} zł
                    </li>
                ))}
                </ul>
            ) : (
                <p>Brak aktywnych długów do spłacenia.</p>
            )}
        </>
        ) : (
        <p>Wybierz użytkownika, aby spłacić długi.</p>
        )}
    </div>
  );
}

export default RepayDebt;
