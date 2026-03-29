import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data.json");

const SAMPLE_PRODUCTS = [
  { id: "1", name: "Premium Coffee Beans", category: "Groceries", price: 450, gstPercent: 5 },
  { id: "2", name: "Wireless Mouse", category: "Electronics", price: 1200, gstPercent: 18 },
  { id: "3", name: "Cotton T-Shirt", category: "Clothing", price: 599, gstPercent: 12 },
  { id: "4", name: "Gaming Keyboard", category: "Electronics", price: 3500, gstPercent: 18 },
  { id: "5", name: "Organic Honey", category: "Groceries", price: 250, gstPercent: 5 },
  { id: "6", name: "Running Shoes", category: "Footwear", price: 2999, gstPercent: 18 },
  { id: "7", name: "Luxury Perfume", category: "Cosmetics", price: 4500, gstPercent: 28 },
  { id: "8", name: "Desk Lamp", category: "Home & Office", price: 850, gstPercent: 12 }
];

const DEFAULT_SETTINGS = {
  storeName: "RETAILPRO",
  address: "123 Business Avenue, Tech Park",
  cityStateZip: "City, State, 100001",
  gstNumber: "22AAAAA0000A1Z5",
  phone: "+91 9876543210",
  email: "contact@retailpro.com"
};

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ products: SAMPLE_PRODUCTS, invoices: [], settings: DEFAULT_SETTINGS }));
}

function readData() {
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  const parsed = JSON.parse(data);
  if (!parsed.settings) {
    parsed.settings = DEFAULT_SETTINGS;
    writeData(parsed);
  }
  return parsed;
}

function writeData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/products", (req, res) => {
    const data = readData();
    res.json(data.products);
  });

  app.post("/api/products", (req, res) => {
    const data = readData();
    const newProduct = { id: Date.now().toString(), ...req.body };
    data.products.push(newProduct);
    writeData(data);
    res.json(newProduct);
  });

  app.put("/api/products/:id", (req, res) => {
    const data = readData();
    const index = data.products.findIndex((p: any) => p.id === req.params.id);
    if (index !== -1) {
      data.products[index] = { ...data.products[index], ...req.body };
      writeData(data);
      res.json(data.products[index]);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });

  app.delete("/api/products/:id", (req, res) => {
    const data = readData();
    data.products = data.products.filter((p: any) => p.id !== req.params.id);
    writeData(data);
    res.json({ success: true });
  });

  app.get("/api/invoices", (req, res) => {
    const data = readData();
    res.json(data.invoices);
  });

  app.post("/api/invoices", (req, res) => {
    const data = readData();
    const newInvoice = { 
      id: Date.now().toString(), 
      invoiceNumber: `INV-${String(data.invoices.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString(),
      ...req.body 
    };
    data.invoices.push(newInvoice);
    writeData(data);
    res.json(newInvoice);
  });

  app.get("/api/settings", (req, res) => {
    const data = readData();
    res.json(data.settings);
  });

  app.put("/api/settings", (req, res) => {
    const data = readData();
    data.settings = { ...data.settings, ...req.body };
    writeData(data);
    res.json(data.settings);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
