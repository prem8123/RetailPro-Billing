import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Invoice, StoreSettings } from '../types';

export const generateInvoicePDF = (invoice: Invoice, settings: StoreSettings) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(24);
  doc.setTextColor(79, 70, 229); // Indigo 600
  doc.text(settings.storeName || 'RETAILPRO', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(settings.address || '123 Business Avenue, Tech Park', 14, 30);
  doc.text(settings.cityStateZip || 'City, State, 100001', 14, 35);
  doc.text(`GSTIN: ${settings.gstNumber || '22AAAAA0000A1Z5'}`, 14, 40);
  if (settings.phone) doc.text(`Phone: ${settings.phone}`, 14, 45);
  if (settings.email) doc.text(`Email: ${settings.email}`, 14, 50);

  // Invoice Details
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('TAX INVOICE', 150, 22);
  
  doc.setFontSize(10);
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, 150, 30);
  doc.text(`Date: ${format(new Date(invoice.date), 'dd MMM yyyy')}`, 150, 35);
  if (invoice.customerName) {
    doc.text(`Customer: ${invoice.customerName}`, 14, 60);
  }

  // Table
  const tableData = invoice.items.map((item, index) => {
    const total = item.price * item.quantity;
    const gstAmount = (total * item.gstPercent) / 100;
    return [
      index + 1,
      item.name,
      item.category,
      item.quantity,
      `Rs. ${item.price.toFixed(2)}`,
      `${item.gstPercent}%`,
      `Rs. ${gstAmount.toFixed(2)}`,
      `Rs. ${(total + gstAmount).toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: 70,
    head: [['#', 'Item', 'Category', 'Qty', 'Rate', 'GST %', 'Tax Amt', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 10 },
      3: { halign: 'center' },
      4: { halign: 'right' },
      5: { halign: 'center' },
      6: { halign: 'right' },
      7: { halign: 'right' }
    }
  });

  // Summary
  const finalY = (doc as any).lastAutoTable.finalY || 65;
  
  doc.setFontSize(10);
  doc.text('Subtotal:', 140, finalY + 10);
  doc.text(`Rs. ${invoice.subtotal.toFixed(2)}`, 196, finalY + 10, { align: 'right' });
  
  doc.text('CGST:', 140, finalY + 16);
  doc.text(`Rs. ${invoice.cgst.toFixed(2)}`, 196, finalY + 16, { align: 'right' });
  
  doc.text('SGST:', 140, finalY + 22);
  doc.text(`Rs. ${invoice.sgst.toFixed(2)}`, 196, finalY + 22, { align: 'right' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Grand Total:', 140, finalY + 30);
  doc.text(`Rs. ${invoice.total.toFixed(2)}`, 196, finalY + 30, { align: 'right' });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });

  // Save PDF
  doc.save(`${invoice.invoiceNumber}.pdf`);
};
