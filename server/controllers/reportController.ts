import { Request, Response } from 'express';
import { query } from '../db.ts';

export const getDashboardStats = async (req: Request, res: Response) => {
  const totalSales: any = await query('SELECT SUM(total_amount) as total FROM sales');
  const totalExpenses: any = await query('SELECT SUM(amount) as total FROM expenses');
  const stockRemaining: any = await query('SELECT SUM(stock_quantity) as total FROM inventory');
  const outOfStock: any = await query('SELECT COUNT(*) as count FROM inventory WHERE stock_quantity = 0');
  const lowStock: any = await query(
    'SELECT COUNT(*) as count FROM inventory WHERE stock_quantity > 0 AND stock_quantity < 10'
  );

  const mostSold: any = await query(
    `SELECT i.flavor_name, SUM(s.quantity) as total_sold
     FROM sales s
     JOIN inventory i ON s.flavor_id = i.id
     GROUP BY s.flavor_id
     ORDER BY total_sold DESC
     LIMIT 5`
  );

  const salesTrend: any = await query(
    `SELECT date, SUM(total_amount) as revenue
     FROM sales
     GROUP BY date
     ORDER BY date ASC
     LIMIT 30`
  );

  const rushHours: any = await query(
    `SELECT LEFT(time,2) as hour, COUNT(*) as count
     FROM sales
     GROUP BY hour
     ORDER BY hour ASC`
  );

  res.json({
    summary: {
      totalSales: totalSales[0]?.total || 0,
      totalExpenses: totalExpenses[0]?.total || 0,
      netProfit: (totalSales[0]?.total || 0) - (totalExpenses[0]?.total || 0),
      stockRemaining: stockRemaining[0]?.total || 0,
      outOfStock: outOfStock[0]?.count || 0,
      lowStock: lowStock[0]?.count || 0
    },
    mostSold,
    salesTrend,
    rushHours
  });
};

export const getReportData = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  let baseQuery = `
    SELECT s.*, i.flavor_name 
    FROM sales s 
    JOIN inventory i ON s.flavor_id = i.id
  `;
  const params: any[] = [];

  if (startDate && endDate) {
    baseQuery += ` WHERE s.date BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  }

  baseQuery += ` ORDER BY s.date DESC`;

  const sales = await query(baseQuery, params);

  let expQuery = `SELECT * FROM expenses`;
  const expParams: any[] = [];
  if (startDate && endDate) {
    expQuery += ` WHERE date BETWEEN ? AND ?`;
    expParams.push(startDate, endDate);
  }
  const expenses = await query(expQuery, expParams);

  res.json({ sales, expenses });
};
