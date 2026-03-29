import { useState, useEffect } from 'react';
import { Download, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../services/api';
import { Invoice } from '../types';
import { generateInvoicePDF } from '../utils/pdfGenerator';

export default function History() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    loadInvoices();
    loadSettings();
  }, []);

  const loadInvoices = async () => {
    const data = await api.getInvoices();
    // Sort by date descending
    setInvoices(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const loadSettings = async () => {
    const data = await api.getSettings();
    setSettings(data);
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    (inv.customerName && inv.customerName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Invoice History</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-200">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Invoice # or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-4">Invoice #</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-4 font-medium text-indigo-600 dark:text-indigo-400">{invoice.invoiceNumber}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500" />
                      {format(new Date(invoice.date), 'dd MMM yyyy, HH:mm')}
                    </div>
                  </td>
                  <td className="p-4 text-slate-900 dark:text-slate-100">{invoice.customerName || '-'}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{invoice.items.length} items</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100">₹{invoice.total.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => generateInvoicePDF(invoice, settings)}
                      className="inline-flex items-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4 mr-1.5" />
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
