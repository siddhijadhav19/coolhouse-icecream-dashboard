import { Request, Response } from 'express';
import { query } from '../db.ts';

export const getInventory = async (req: Request, res: Response) => {
  const inventory = await query('SELECT * FROM inventory');
  res.json(inventory);
};

export const addFlavor = async (req: Request, res: Response) => {
  const { flavor_name, stock_quantity, price_per_unit } = req.body;
  try {
    await query(
      'INSERT INTO inventory (flavor_name, stock_quantity, price_per_unit) VALUES (?, ?, ?)',
      [flavor_name, stock_quantity, price_per_unit]
    );
    res.status(201).json({ message: 'Flavor added successfully' });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Flavor already exists' });
    } else {
      console.error('Add flavor error:', error);
      res.status(500).json({ message: 'Failed to add flavor' });
    }
  }
};

export const updateStock = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { stock_quantity, price_per_unit } = req.body;
  await query('UPDATE inventory SET stock_quantity = ?, price_per_unit = ? WHERE id = ?', [
    stock_quantity,
    price_per_unit,
    id
  ]);
  res.json({ message: 'Stock updated' });
};

export const deleteFlavor = async (req: Request, res: Response) => {
  const { id } = req.params;
  await query('DELETE FROM inventory WHERE id = ?', [id]);
  res.json({ message: 'Flavor deleted' });
};
