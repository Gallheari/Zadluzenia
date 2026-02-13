
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const generatePDF = (currentUser, subaccounts, debts, repayments) => {
    const doc = new jsPDF();

    // Nagłówek
    doc.setFontSize(22);
    doc.text(`Raport finansowy dla: ${currentUser.name}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Data wygenerowania: ${new Date().toLocaleString()}`, 14, 28);

    // Podsumowanie
    doc.setFontSize(16);
    doc.text('Podsumowanie', 14, 45);
    const totalDebts = debts.reduce((acc, debt) => acc + debt.amount, 0);
    const totalRemaining = debts.reduce((acc, debt) => acc + debt.remainingAmount, 0);
    doc.setFontSize(12);
    doc.text(`Łączna liczba długów: ${debts.length}`, 14, 55);
    doc.text(`Łączna kwota zadłużenia: ${totalDebts.toFixed(2)} zł`, 14, 62);
    doc.text(`Pozostało do spłaty: ${totalRemaining.toFixed(2)} zł`, 14, 69);

    // Tabela: Długi
    if (debts.length > 0) {
        doc.addPage();
        doc.setFontSize(18);
        doc.text('Szczegółowa lista długów', 14, 20);
        const debtData = debts.map(d => [
            d.description,
            d.amount.toFixed(2),
            d.remainingAmount.toFixed(2),
            d.subaccountName,
        ]);
        doc.autoTable({
            startY: 28,
            head: [['Opis', 'Kwota', 'Pozostało', 'Subkonto']],
            body: debtData,
        });
    }

    // Tabela: Subkonta
    if (subaccounts.length > 0) {
        doc.addPage();
        doc.setFontSize(18);
        doc.text('Lista subkont', 14, 20);
        const subaccountData = subaccounts.map(s => [s.name]);
        doc.autoTable({
            startY: 28,
            head: [['Nazwa subkonta']],
            body: subaccountData,
        });
    }

    // Tabela: Historia spłat
    if (repayments.length > 0) {
        doc.addPage();
        doc.setFontSize(18);
        doc.text('Historia spłat', 14, 20);
        const repaymentData = repayments.map(r => [
            new Date(r.date.seconds * 1000).toLocaleString(),
            r.amount.toFixed(2),
        ]);
        doc.autoTable({
            startY: 28,
            head: [['Data', 'Kwota']],
            body: repaymentData,
        });
    }

    doc.save(`raport_${currentUser.name}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export default generatePDF;
