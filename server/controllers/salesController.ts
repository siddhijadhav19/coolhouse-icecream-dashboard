import { Request, Response } from 'express';
import { query, transaction } from '../db.ts';
import * as XLSX from 'xlsx';

export const getSales = async (req: Request, res: Response) => {
  const sales = await query(
    `SELECT s.*, i.flavor_name 
     FROM sales s 
     JOIN inventory i ON s.flavor_id = i.id
     ORDER BY s.date DESC, s.time DESC`
  );
  res.json(sales);
};

export const addSale = async (req: Request, res: Response) => {
  const { flavor_id, quantity, price, date, time } = req.body;
  const total_amount = quantity * price;

  try {
    await transaction(async (conn) => {
      const [inventoryRows]: any = await conn.query(
        'SELECT stock_quantity FROM inventory WHERE id = ?',
        [flavor_id]
      );
      const inventory = inventoryRows[0];
      if (!inventory || inventory.stock_quantity < quantity) {
        throw new Error('Insufficient stock');
      }

      await conn.query(
        'UPDATE inventory SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [quantity, flavor_id]
      );

      await conn.query(
        'INSERT INTO sales (flavor_id, quantity, price, total_amount, date, time) VALUES (?, ?, ?, ?, ?, ?)',
        [flavor_id, quantity, price, total_amount, date, time]
      );
    });

    res.status(201).json({ message: 'Sale recorded' });
  } catch (error: any) {
    console.error('Sale error:', error);
    res.status(400).json({ message: error.message || 'Failed to record sale' });
  }
};

export const addExpense = async (req: Request, res: Response) => {
  const { description, amount, date } = req.body;
  try {
    await query('INSERT INTO expenses (description, amount, date) VALUES (?, ?, ?)', [
      description,
      amount,
      date
    ]);
    res.status(201).json({ message: 'Expense recorded' });
  } catch (error: any) {
    console.error('Expense error:', error);
    res.status(400).json({ message: 'Failed to record expense' });
  }
};

export const uploadExcelSales = async (req: Request, res: Response) => {
  const { base64Data } = req.body;
  if (!base64Data) return res.status(400).json({ message: 'No data provided' });

  try {
    const workbook = XLSX.read(base64Data, { type: 'base64' });
    const sheetName = workbook.SheetNames[0];
    const data: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    await transaction(async (conn) => {
      for (const row of data) {
        const { flavor_name, quantity, price, date, time } = row;
        const [flavorRows]: any = await conn.query(
          'SELECT id, stock_quantity FROM inventory WHERE flavor_name = ?',
          [flavor_name]
        );
        const flavor = flavorRows[0];
        if (!flavor) continue;

        const total_amount = quantity * price;
        await conn.query(
          'UPDATE inventory SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [quantity, flavor.id]
        );
        await conn.query(
          'INSERT INTO sales (flavor_id, quantity, price, total_amount, date, time) VALUES (?, ?, ?, ?, ?, ?)',
          [flavor.id, quantity, price, total_amount, date, time]
        );
      }
    });

    res.json({ message: 'Excel data processed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error processing Excel: ' + error.message });
  }
};
