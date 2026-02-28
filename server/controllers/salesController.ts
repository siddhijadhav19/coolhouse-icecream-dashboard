import { Request, Response } from 'express';
import db from '../db.ts';
import * as XLSX from 'xlsx';

export const getSales = (req: Request, res: Response) => {
  const sales = db.prepare(`
    SELECT s.*, i.flavor_name 
    FROM sales s 
    JOIN inventory i ON s.flavor_id = i.id
    ORDER BY s.date DESC, s.time DESC
  `).all();
  res.json(sales);
};

export const addSale = (req: Request, res: Response) => {
  const { flavor_id, quantity, price, date, time } = req.body;
  const total_amount = quantity * price;

  const transaction = db.transaction(() => {
    // Update inventory
    const inventory: any = db.prepare('SELECT stock_quantity FROM inventory WHERE id = ?').get(flavor_id);
    if (!inventory || inventory.stock_quantity < quantity) {
      throw new Error('Insufficient stock');
    }

    db.prepare('UPDATE inventory SET stock_quantity = stock_quantity - ? WHERE id = ?')
      .run(quantity, flavor_id);

    // Record sale
    db.prepare('INSERT INTO sales (flavor_id, quantity, price, total_amount, date, time) VALUES (?, ?, ?, ?, ?, ?)')
      .run(flavor_id, quantity, price, total_amount, date, time);
  });

  try {
    transaction();
    res.status(201).json({ message: 'Sale recorded' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const addExpense = (req: Request, res: Response) => {
  const { description, amount, date } = req.body;
  db.prepare('INSERT INTO expenses (description, amount, date) VALUES (?, ?, ?)')
    .run(description, amount, date);
  res.status(201).json({ message: 'Expense recorded' });
};

export const uploadExcelSales = (req: Request, res: Response) => {
  // In a real app, we'd use multer to handle file upload.
  // For this demo, we'll assume the base64 data is sent in the body.
  const { base64Data } = req.body;
  if (!base64Data) return res.status(400).json({ message: 'No data provided' });

  try {
    const workbook = XLSX.read(base64Data, { type: 'base64' });
    const sheetName = workbook.SheetNames[0];
    const data: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const transaction = db.transaction((rows) => {
      for (const row of rows) {
        const { flavor_name, quantity, price, date, time } = row;
        
        // Find flavor
        const flavor: any = db.prepare('SELECT id, stock_quantity FROM inventory WHERE flavor_name = ?').get(flavor_name);
        if (!flavor) continue; // Or handle error

        const total_amount = quantity * price;

        // Update inventory
        db.prepare('UPDATE inventory SET stock_quantity = stock_quantity - ? WHERE id = ?')
          .run(quantity, flavor.id);

        // Record sale
        db.prepare('INSERT INTO sales (flavor_id, quantity, price, total_amount, date, time) VALUES (?, ?, ?, ?, ?, ?)')
          .run(flavor.id, quantity, price, total_amount, date, time);
      }
    });

    transaction(data);
    res.json({ message: 'Excel data processed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error processing Excel: ' + error.message });
  }
};
