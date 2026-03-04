import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ override: true });

// configuration pulled from environment variables so MySQL Workbench can connect
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: +(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'coolhouse',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// debug log to verify environment loading
console.log('DB config', { host: dbConfig.host, port: dbConfig.port, user: dbConfig.user, password: dbConfig.password ? '***' : '(empty)', database: dbConfig.database });

// ensure database exists; some MySQL servers require connection without db first
const ensureDatabase = async () => {
  const tempConn = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password
  });
  await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
  await tempConn.end();
};

// create main pool once database exists
let pool: mysql.Pool;

/**
 * a promise that resolves when pool is ready to use.
 * other modules should await this before calling query/transaction.
 */
export const dbReady: Promise<void> = (async () => {
  await ensureDatabase();
  pool = mysql.createPool(dbConfig);
})();

// helper for simple queries
// For SELECT: returns array of rows
// For INSERT/UPDATE/DELETE: returns ResultSetHeader object with insertId, affectedRows, etc.
export const query = async (sql: string, params: any[] = []) => {
  await dbReady;
  const [result] = await pool.query(sql, params);
  return result; // Returns rows[] for SELECT, ResultSetHeader for INSERT/UPDATE/DELETE
};

// transaction helper
export const transaction = async <T>(
  callback: (conn: mysql.PoolConnection) => Promise<T>
): Promise<T> => {
  await dbReady;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};


// function to create tables if they do not exist (mimics previous sqlite initialization)
export const initDb = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'worker',
      INDEX(role)
    ) ENGINE=InnoDB;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INT AUTO_INCREMENT PRIMARY KEY,
      flavor_name VARCHAR(255) UNIQUE NOT NULL,
      stock_quantity INT NOT NULL DEFAULT 0,
      price_per_unit DOUBLE NOT NULL DEFAULT 0.0
    ) ENGINE=InnoDB;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS sales (
      id INT AUTO_INCREMENT PRIMARY KEY,
      flavor_id INT,
      quantity INT NOT NULL,
      price DOUBLE NOT NULL,
      total_amount DOUBLE NOT NULL,
      date DATE NOT NULL,
      time TIME NOT NULL,
      FOREIGN KEY (flavor_id) REFERENCES inventory(id)
    ) ENGINE=InnoDB;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      description VARCHAR(255) NOT NULL,
      amount DOUBLE NOT NULL,
      date DATE NOT NULL
    ) ENGINE=InnoDB;
  `);
};

export { pool };
export default pool;
