import { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, Printer, Download } from 'lucide-react';
import { api } from '../services/api';
import { Product, CartItem, Invoice } from '../types';
import { generateInvoicePDF } from '../utils/pdfGenerator';

export default function Billing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    loadProducts();
    loadSettings();
  }, []);

  const loadProducts = async () => {
    const data = await api.getProducts();
    setProducts(data);
  };

  const loadSettings = async () => {
    const data = await api.getSettings();
    setSettings(data);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const totalGst = cart.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    return sum + (itemTotal * item.gstPercent) / 100;
  }, 0);

  const cgst = totalGst / 2;
  const sgst = totalGst / 2;
  const grandTotal = subtotal + totalGst;

  const handleGenerateInvoice = async () => {
    if (cart.length === 0) return;
    
    setIsGenerating(true);
    try {
      const newInvoice = await api.addInvoice({
        customerName,
        items: cart,
        subtotal,
        cgst,
        sgst,
        total: grandTotal
      });
      
      generateInvoicePDF(newInvoice, settings);
      
      // Reset
      setCart([]);
      setCustomerName('');
    } catch (error) {
      console.error('Failed to generate invoice', error);
      alert('Failed to generate invoice. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-8 lg:h-[calc(100vh-6rem)]">
      {/* Products Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden h-[500px] lg:h-auto transition-colors duration-200">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Select Products</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products to add..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                onClick={() => addToCart(product)}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group bg-white dark:bg-slate-800"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {product.name}
                  </h3>
                  <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                    {product.category}
                  </span>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">₹{product.price.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">+ {product.gstPercent}% GST</p>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-8 text-slate-500 dark:text-slate-400">
                No products found. Add some in the Dashboard.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden h-[500px] lg:h-auto transition-colors duration-200">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Current Bill</h2>
          <input
            type="text"
            placeholder="Customer Name (Optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-4">
              <Printer className="w-12 h-12 opacity-20" />
              <p>Cart is empty. Add products to generate bill.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => {
                const itemTotal = item.price * item.quantity;
                const itemGst = (itemTotal * item.gstPercent) / 100;
                
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-700/50 rounded-lg bg-slate-50/50 dark:bg-slate-700/30">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">{item.name}</h4>
                      <div className="text-sm text-slate-500 dark:text-slate-400 flex space-x-2 mt-1">
                        <span>₹{item.price.toFixed(2)}</span>
                        <span>&times;</span>
                        <span>{item.quantity}</span>
                        <span>=</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">₹{itemTotal.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        GST ({item.gstPercent}%): ₹{itemGst.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4 ml-4">
                      <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-1">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium dark:text-slate-200">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>CGST</span>
              <span>₹{cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>SGST</span>
              <span>₹{sgst.toFixed(2)}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Grand Total</span>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleGenerateInvoice}
            disabled={cart.length === 0 || isGenerating}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center justify-center transition-colors shadow-sm"
          >
            {isGenerating ? (
              <span className="flex items-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Generating...
              </span>
            ) : (
              <span className="flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Generate & Download Invoice
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
