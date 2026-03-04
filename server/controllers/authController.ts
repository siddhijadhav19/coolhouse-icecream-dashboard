import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'coolhouse-secret-key';

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result: any = await query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'worker']
    );
    res.status(201).json({
      id: result.insertId,
      name,
      email,
      role: role || 'worker'
    });
  } catch (error: any) {
    console.error('Registration error:', error.message || error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Email already registered' });
    } else {
      res.status(400).json({ message: 'Registration failed: ' + (error.message || 'Unknown error') });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const users: any = await query('SELECT * FROM users WHERE email = ?', [email]);
  const user = users[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};

export const getMe = (req: any, res: Response) => {
  res.json(req.user);
};
