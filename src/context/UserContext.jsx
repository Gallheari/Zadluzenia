
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, addDoc, updateDoc, deleteDoc, where, query, getDocs, writeBatch } from 'firebase/firestore';

export const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setCurrentUser({ id: user.uid, ...userDoc.data() });
        } else {
          // This case might happen if a user is created in Auth but not in Firestore
          // For this app, we assume that won't happen as we create them together.
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // --- User Management ---
  const addUser = async (name) => {
    // Note: This is a simplified user creation. 
    // In a real app, you would handle this via Firebase Auth and then create the Firestore doc.
    // For this app, we'll just add a document to the 'users' collection.
    const docRef = await addDoc(collection(db, 'users'), { name });
    // Switch to the newly created user
    const newUserDoc = await getDoc(docRef);
    setCurrentUser({ id: docRef.id, ...newUserDoc.data() });
  };

  // --- Subaccount Management ---
  const addSubaccount = async (name) => {
    if (currentUser) {
      await addDoc(collection(db, 'subaccounts'), {
        name,
        userId: currentUser.id,
      });
    }
  };

  const updateSubaccount = async (id, name) => {
    const subaccountRef = doc(db, 'subaccounts', id);
    await updateDoc(subaccountRef, { name });
  };

  const deleteSubaccount = async (id) => {
    const batch = writeBatch(db);
    const subaccountRef = doc(db, 'subaccounts', id);

    const debtsQuery = query(collection(db, 'debts'), where('subaccountId', '==', id));
    const debtsSnapshot = await getDocs(debtsQuery);
    const debtIds = debtsSnapshot.docs.map(d => d.id);

    if (debtIds.length > 0) {
      const repaymentsQuery = query(collection(db, 'repayments'), where('debtId', 'in', debtIds));
      const repaymentsSnapshot = await getDocs(repaymentsQuery);
      repaymentsSnapshot.forEach(repaymentDoc => {
        batch.delete(repaymentDoc.ref);
      });
    }

    debtsSnapshot.forEach(debtDoc => {
      batch.delete(debtDoc.ref);
    });

    batch.delete(subaccountRef);
    await batch.commit();
  };

  // --- Debt Management ---
  const addDebt = async (debtData) => {
    if(currentUser) {
        await addDoc(collection(db, 'debts'), {
            ...debtData,
            owner: currentUser.id,
            paid: false,
            remainingAmount: debtData.amount, // Set initial remaining amount
        });
    }
  };

  const updateDebt = async (id, data) => {
    const debtRef = doc(db, 'debts', id);
    await updateDoc(debtRef, data);
  };

    const addRepayment = async (debtId, amount, date) => {
        const debtRef = doc(db, 'debts', debtId);
        const debtDoc = await getDoc(debtRef);

        if (debtDoc.exists()) {
            const debtData = debtDoc.data();
            const newRemainingAmount = debtData.remainingAmount - amount;

            await updateDoc(debtRef, {
                remainingAmount: newRemainingAmount,
                paid: newRemainingAmount <= 0,
            });

            await addDoc(collection(db, 'repayments'), {
                debtId,
                amount,
                date,
            });
        } else {
            throw new Error("Debt not found!");
        }
    };

  const value = {
    currentUser,
    loading,
    addUser,
    addSubaccount,
    updateSubaccount,
    deleteSubaccount,
    addDebt,
    updateDebt,
    addRepayment,
    setCurrentUser // Exposing setCurrentUser to allow switching in UserSelector
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
}
