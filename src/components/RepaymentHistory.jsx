
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemText,
    IconButton,
    DialogActions,
    Button,
    Typography,
    Box,
    TextField,
    Tooltip
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

function RepaymentHistory({ open, onClose, subaccountId, subaccountName }) {
    const { updateRepayment, deleteRepayment } = useUser();
    const [repayments, setRepayments] = useState([]);
    const [editingRepayment, setEditingRepayment] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const [openEditDialog, setOpenEditDialog] = useState(false);

    useEffect(() => {
        if (open && subaccountId) {
            const q = query(collection(db, 'repayments'), where('subaccountId', '==', subaccountId));
            const unsubscribe = onSnapshot(q, async (snapshot) => {
                const repaymentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRepayments(repaymentsList);
            });
            return () => unsubscribe();
        } else {
            setRepayments([]);
        }
    }, [open, subaccountId]);

    const handleOpenEditDialog = (repayment) => {
        setEditingRepayment(repayment);
        setEditAmount(repayment.amount);
        setOpenEditDialog(true);
    };

    const handleUpdateRepayment = async () => {
        if (editingRepayment && editAmount > 0) {
            await updateRepayment(editingRepayment.id, parseFloat(editAmount));
            setOpenEditDialog(false);
            setEditingRepayment(null);
        }
    };

    const handleDeleteRepayment = async (repaymentId) => {
        await deleteRepayment(repaymentId);
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    Historia spłat dla {subaccountName}
                </DialogTitle>
                <DialogContent>
                    {repayments.length > 0 ? (
                        <List>
                            {repayments.map(repayment => (
                                <ListItem 
                                    key={repayment.id}
                                    secondaryAction={
                                        <Box>
                                            <Tooltip title="Edytuj spłatę">
                                                <IconButton onClick={() => handleOpenEditDialog(repayment)}>
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Usuń spłatę">
                                                <IconButton onClick={() => handleDeleteRepayment(repayment.id)}>
                                                    <Delete />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    }
                                >
                                    <ListItemText 
                                        primary={`Spłata: ${repayment.amount.toFixed(2)} zł`}
                                        secondary={`Data: ${new Date(repayment.date.seconds * 1000).toLocaleString()}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography>Brak historii spłat dla tego subkonta.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Zamknij</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog edycji spłaty */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                <DialogTitle>Edytuj kwotę spłaty</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nowa kwota"
                        type="number"
                        fullWidth
                        variant="standard"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Anuluj</Button>
                    <Button onClick={handleUpdateRepayment}>Zapisz</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default RepaymentHistory;
