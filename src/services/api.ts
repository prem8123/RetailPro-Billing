import { Product, Invoice, StoreSettings } from '../types';

export const api = {
  getProducts: async (): Promise<Product[]> => {
    const res = await fetch('/api/products');
    return res.json();
  },
  addProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return res.json();
  },
  updateProduct: async (id: string, product: Omit<Product, 'id'>): Promise<Product> => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return res.json();
  },
  deleteProduct: async (id: string): Promise<void> => {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
  },
  getInvoices: async (): Promise<Invoice[]> => {
    const res = await fetch('/api/invoices');
    return res.json();
  },
  addInvoice: async (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'date'>): Promise<Invoice> => {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice),
    });
    return res.json();
  },
  getSettings: async (): Promise<StoreSettings> => {
    const res = await fetch('/api/settings');
    return res.json();
  },
  updateSettings: async (settings: StoreSettings): Promise<StoreSettings> => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },
};
