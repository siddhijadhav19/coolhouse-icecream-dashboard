import db from './db.ts';
import bcrypt from 'bcryptjs';

export const seedData = async () => {
  // Check if already seeded
  const userCount: any = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count > 0) return;

  console.log('Seeding database...');

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)')
    .run('Admin User', 'admin@coolhouse.com', adminPassword, 'admin');

  // Create Worker
    const workerPassword = await bcrypt.hash('worker123', 10);
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)')
      .run('John Worker', 'worker@coolhouse.com', workerPassword, 'worker');

  // Seed Inventory
  const flavors = [
    ['Mango Ice-cream (Plain)', 100, 60],
    ['Kaju Pista Ice-cream (Plain)', 100, 60],
    ['Strawberry Ice-cream (Plain)', 100, 60],
    ['Vanilla Ice-cream (Plain)', 100, 60],
    ['Chocolate Ice-cream (Plain)', 100, 60],
    ['Tuti Fruity Ice-cream (Plain)', 100, 60],
    ['Gulkand Ice-cream (Plain)', 100, 60],
    ['Cherry Ice-cream (Plain)', 100, 60],
    ['Mava Kulfi Ice-cream (Plain)', 100, 60],
    ['Cookies Cream Ice-cream (Plain)', 100, 60],
    ['Peru Ice-cream (Plain)', 100, 60],
    ['Black Current Ice-cream (Plain)', 100, 60],
    ['Orange Tutti Fruity Ice-cream (Plain)', 100, 60],
    ['Roasted Almond Ice-cream (Plain)', 100, 60],
    ['Tender Coconut Ice-cream (Plain)', 100, 60],
    ['Vanilla + Chocolate Sauce', 50, 100],
    ['Vanilla + Mango Pulp', 50, 100],
    ['Mango + Mango Pulp', 50, 100],
    ['Chocolate + Chocolate Sauce', 50, 100],
    ['Choco Chips', 50, 100],
    ['Vanilla with Hot Choco Fudge', 50, 130],
    ['Special Variety (Mango, Pista, Gulkand)', 30, 150],
    ['Deluxe Cocktail', 20, 270],
    ['Special Cocktail', 20, 170],
    ['Milk Shake', 50, 90],
    ['Coffee Chocolate Shake', 50, 130],
    ['Chikku Mastani', 40, 150],
    ['Mango Mastani', 40, 150],
    ['Pista Mastani', 40, 150],
    ['Thandai Mastani', 40, 150],
    ['Strawberry Mastani', 40, 150],
    ['Apple Mastani', 40, 150],
    ['Black Current Mastani', 40, 150],
    ['Butterscotch Mastani', 40, 150],
    ['Special Bombay Falooda', 30, 120],
    ['Spl. Kulfi Falooda', 30, 150],
    ['Spl. Dryfruit Falooda', 30, 175],
    ['Badshahi Falooda', 30, 150],
    ['Sizzling Brownie', 25, 180]
  ];

  const insertInventory = db.prepare('INSERT INTO inventory (flavor_name, stock_quantity, price_per_unit) VALUES (?, ?, ?)');
  for (const f of flavors) {
    insertInventory.run(...f);
  }

  // Seed Sales (Last 7 days)
  const insertSale = db.prepare('INSERT INTO sales (flavor_id, quantity, price, total_amount, date, time) VALUES (?, ?, ?, ?, ?, ?)');
  const inventory: any[] = db.prepare('SELECT id, price_per_unit FROM inventory').all();

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    for (const item of inventory) {
      const qty = Math.floor(Math.random() * 5) + 1;
      insertSale.run(item.id, qty, item.price_per_unit, qty * item.price_per_unit, dateStr, '14:00');
    }
  }

  // Seed Expenses
  const insertExpense = db.prepare('INSERT INTO expenses (description, amount, date) VALUES (?, ?, ?)');
  insertExpense.run('Milk & Cream Supply', 200, new Date().toISOString().split('T')[0]);
  insertExpense.run('Shop Rent', 1000, new Date().toISOString().split('T')[0]);

  console.log('Seeding complete.');
};
