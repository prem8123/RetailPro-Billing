export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  gstPercent: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  total: number;
}

export interface StoreSettings {
  storeName: string;
  address: string;
  cityStateZip: string;
  gstNumber: string;
  phone: string;
  email: string;
}
