
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import Subaccounts from './Subaccounts';
import Debts from './Debts';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import generatePDF from '../utils/generatePDF';

function Dashboard() {
  const { currentUser, loading } = useUser();
  const [subaccounts, setSubaccounts] = useState([]);
  const [debts, setDebts] = useState([]);
  const [repayments, setRepayments] = useState([]);

  useEffect(() => {
    if (currentUser) {
        // Subaccounts listener
        const subaccountsQuery = query(collection(db, 'subaccounts'), where('userId', '==', currentUser.id));
        const unsubscribeSubaccounts = onSnapshot(subaccountsQuery, (snapshot) => {
            const subaccountsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSubaccounts(subaccountsList);
        });

        // Debts listener
        const debtsQuery = query(collection(db, 'debts'), where('userId', '==', currentUser.id));
        const unsubscribeDebts = onSnapshot(debtsQuery, (snapshot) => {
            const debtsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDebts(debtsList);
        });

        // Repayments listener
        const repaymentsQuery = query(collection(db, 'repayments'), where('userId', '==', currentUser.id));
        const unsubscribeRepayments = onSnapshot(repaymentsQuery, (snapshot) => {
            const repaymentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRepayments(repaymentsList);
        });

        return () => {
            unsubscribeSubaccounts();
            unsubscribeDebts();
            unsubscribeRepayments();
        };
    }
}, [currentUser]);


  const handleExportPDF = () => {
    if (currentUser) {
      const debtsWithSubaccountNames = debts.map(debt => {
        const subaccount = subaccounts.find(s => s.id === debt.subaccountId);
        return { ...debt, subaccountName: subaccount ? subaccount.name : "Brak subkonta" };
    });
      generatePDF(currentUser, subaccounts, debtsWithSubaccountNames, repayments);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Witaj, {currentUser ? currentUser.name : 'Użytkowniku'}!
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleExportPDF}
        sx={{ mb: 3 }}
      >
        Eksportuj do PDF
      </Button>
      <Subaccounts />
      <Debts />
    </Box>
  );
}

export default Dashboard;
