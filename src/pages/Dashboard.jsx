import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import Subaccounts from '../components/Subaccounts';
import { useUser } from '../context/UserContext';

function Dashboard() {
  const { currentUser } = useUser();
  const [debts, setDebts] = useState([]);

  useEffect(() => {
    if (!currentUser) {
        setDebts([]);
        return;
    }
    const fetchDebts = async () => {
      const q = query(collection(db, "debts"), where("owner", "==", currentUser.id));
      const debtsQuerySnapshot = await getDocs(q);
      const debtsList = await Promise.all(debtsQuerySnapshot.docs.map(async (debtDoc) => {
        const debtData = debtDoc.data();
        const subaccountDoc = await getDoc(doc(db, "subaccounts", debtData.subaccountId));
        const subaccountName = subaccountDoc.exists() ? subaccountDoc.data().name : "Nieznane subkonto";
        return {
          id: debtDoc.id,
          ...debtData,
          subaccountName: subaccountName
        };
      }));
      setDebts(debtsList);
    };

    fetchDebts();
  }, [currentUser]);

  return (
    <div>
      <h1>Panel główny</h1>
        {currentUser ? (
            <>
             <p>Witaj w aplikacji do śledzenia długów, {currentUser.name}.</p>
            <Subaccounts />
            <h2>Lista długów</h2>
            {debts.length > 0 ? (
                <ul>
                {debts.map(debt => (
                    <li key={debt.id} style={{ textDecoration: debt.paid ? 'line-through' : 'none' }}>
                    {debt.description} - {debt.amount} zł (Subkonto: {debt.subaccountName})
                    </li>
                ))}
                </ul>
            ) : (
                <p>Brak długów do wyświetlenia.</p>
            )}
            </>
        ) : (
            <p>Wybierz użytkownika, aby zobaczyć jego długi.</p>
        )}
    </div>
  );
}

export default Dashboard;
