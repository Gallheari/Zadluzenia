
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import Subaccounts from '../components/Subaccounts';
import { useUser } from '../context/UserContext';
import { Grid, Card, CardContent, Typography, CircularProgress, Paper, Box } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

// Komponent do wyświetlania pojedynczej statystyki
const StatCard = ({ title, value, icon }) => (
  <Card elevation={3} sx={{ display: 'flex', alignItems: 'center', p: 2, height: '100%' }}>
    {icon}
    <Box sx={{ ml: 2 }}>
      <Typography variant="h6" component="div">{title}</Typography>
      <Typography variant="h4">{value}</Typography>
    </Box>
  </Card>
);

function Dashboard() {
  const { currentUser } = useUser();
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subaccountsData, setSubaccountsData] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      setDebts([]);
      setSubaccountsData([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Pobieranie długów
        const debtsQuery = query(collection(db, "debts"), where("owner", "==", currentUser.id));
        const debtsSnapshot = await getDocs(debtsQuery);
        const debtsList = await Promise.all(debtsSnapshot.docs.map(async (debtDoc) => {
          const debtData = debtDoc.data();
          return {
            id: debtDoc.id,
            ...debtData,
            remainingAmount: debtData.remainingAmount ?? debtData.amount
          };
        }));
        setDebts(debtsList);

        // Pobieranie subkont i agregacja danych
        const subaccountsQuery = query(collection(db, "subaccounts"), where("owner", "==", currentUser.id));
        const subaccountsSnapshot = await getDocs(subaccountsQuery);
        const subaccountsList = subaccountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const aggregatedData = subaccountsList.map(sub => {
          const debtsForSub = debtsList.filter(d => d.subaccountId === sub.id);
          return {
            name: sub.name,
            totalDebt: debtsForSub.reduce((acc, d) => acc + d.amount, 0)
          };
        }).filter(s => s.totalDebt > 0);

        setSubaccountsData(aggregatedData);

      } catch (error) {
        console.error("Błąd podczas pobierania danych: ", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [currentUser]);

  // Obliczenia do statystyk
  const totalDebtAmount = debts.reduce((acc, debt) => acc + debt.amount, 0);
  const totalRemainingAmount = debts.reduce((acc, debt) => acc + debt.remainingAmount, 0);
  const activeDebtsCount = debts.filter(debt => !debt.paid).length;

  const barChartData = [
    {
      name: 'Długi',
      'Całkowite Zadłużenie': totalDebtAmount,
      'Pozostało do Spłaty': totalRemainingAmount,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom component="div">
        Panel główny
      </Typography>
      {currentUser && <Typography variant="h6" gutterBottom>Witaj, {currentUser.name}!</Typography>}

      {loading ? (
        <CircularProgress />
      ) : currentUser && debts.length > 0 ? (
        <Grid container spacing={4}>
          {/* Statystyki */}
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Całkowite zadłużenie" value={`${totalDebtAmount.toFixed(2)} zł`} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Pozostało do spłaty" value={`${totalRemainingAmount.toFixed(2)} zł`} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Aktywne długi" value={activeDebtsCount} />
          </Grid>

          {/* Wykresy */}
          <Grid item xs={12} lg={6}>
            <Paper elevation={3} sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>Podział długów na subkonta</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie data={subaccountsData} dataKey="totalDebt" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill="#8884d8" label>
                    {subaccountsData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toFixed(2)} zł`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Paper elevation={3} sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>Postęp w spłacie</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value} zł`} />
                  <Tooltip formatter={(value) => `${value.toFixed(2)} zł`} />
                  <Legend />
                  <Bar dataKey="Całkowite Zadłużenie" fill="#FF8042" />
                  <Bar dataKey="Pozostało do Spłaty" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          {/* Subkonta */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalanceIcon sx={{ mr: 1 }} /> Subkonta
              </Typography>
              <Subaccounts />
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Typography>Brak danych do wyświetlenia. Dodaj pierwsze długi, aby zobaczyć statystyki.</Typography>
      )}
    </Box>
  );
}

export default Dashboard;
