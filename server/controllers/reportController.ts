import { Request, Response } from 'express';
import db from '../db.ts';

export const getDashboardStats = (req: Request, res: Response) => {
  const totalSales: any = db.prepare('SELECT SUM(total_amount) as total FROM sales').get();
  const totalExpenses: any = db.prepare('SELECT SUM(amount) as total FROM expenses').get();
  const stockRemaining: any = db.prepare('SELECT SUM(stock_quantity) as total FROM inventory').get();
  const outOfStock: any = db.prepare('SELECT COUNT(*) as count FROM inventory WHERE stock_quantity = 0').get();
  const lowStock: any = db.prepare('SELECT COUNT(*) as count FROM inventory WHERE stock_quantity > 0 AND stock_quantity < 10').get();

  // Most sold flavor
  const mostSold: any = db.prepare(`
    SELECT i.flavor_name, SUM(s.quantity) as total_sold
    FROM sales s
    JOIN inventory i ON s.flavor_id = i.id
    GROUP BY s.flavor_id
    ORDER BY total_sold DESC
    LIMIT 5
  `).all();

  // Sales trend (Daily)
  const salesTrend = db.prepare(`
    SELECT date, SUM(total_amount) as revenue
    FROM sales
    GROUP BY date
    ORDER BY date ASC
    LIMIT 30
  `).all();

  // Rush hours
  const rushHours = db.prepare(`
    SELECT SUBSTR(time, 1, 2) as hour, COUNT(*) as count
    FROM sales
    GROUP BY hour
    ORDER BY hour ASC
  `).all();

  res.json({
    summary: {
      totalSales: totalSales.total || 0,
      totalExpenses: totalExpenses.total || 0,
      netProfit: (totalSales.total || 0) - (totalExpenses.total || 0),
      stockRemaining: stockRemaining.total || 0,
      outOfStock: outOfStock.count || 0,
      lowStock: lowStock.count || 0
    },
    mostSold,
    salesTrend,
    rushHours
  });
};

export const getReportData = (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  
  let query = `
    SELECT s.*, i.flavor_name 
    FROM sales s 
    JOIN inventory i ON s.flavor_id = i.id
  `;
  const params: any[] = [];

  if (startDate && endDate) {
    query += ` WHERE s.date BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  }

  query += ` ORDER BY s.date DESC`;

  const sales = db.prepare(query).all(...params);
  
  // Expenses in range
  let expQuery = `SELECT * FROM expenses`;
  const expParams: any[] = [];
  if (startDate && endDate) {
    expQuery += ` WHERE date BETWEEN ? AND ?`;
    expParams.push(startDate, endDate);
  }
  const expenses = db.prepare(expQuery).all(...expParams);

  res.json({ sales, expenses });
};
