import { Request, Response } from 'express';
import db from '../db.ts';

export const getInventory = (req: Request, res: Response) => {
  const inventory = db.prepare('SELECT * FROM inventory').all();
  res.json(inventory);
};

export const addFlavor = (req: Request, res: Response) => {
  const { flavor_name, stock_quantity, price_per_unit } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO inventory (flavor_name, stock_quantity, price_per_unit) VALUES (?, ?, ?)');
    stmt.run(flavor_name, stock_quantity, price_per_unit);
    res.status(201).json({ message: 'Flavor added' });
  } catch (error) {
    res.status(400).json({ message: 'Flavor already exists' });
  }
};

export const updateStock = (req: Request, res: Response) => {
  const { id } = req.params;
  const { stock_quantity, price_per_unit } = req.body;
  const stmt = db.prepare('UPDATE inventory SET stock_quantity = ?, price_per_unit = ? WHERE id = ?');
  stmt.run(stock_quantity, price_per_unit, id);
  res.json({ message: 'Stock updated' });
};

export const deleteFlavor = (req: Request, res: Response) => {
  const { id } = req.params;
  db.prepare('DELETE FROM inventory WHERE id = ?').run(id);
  res.json({ message: 'Flavor deleted' });
};
