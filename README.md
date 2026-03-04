# Coolhouse Ice Cream Dashboard

This project is a simple inventory and sales management dashboard built with React (via Vite) on the frontend and an Express/TypeScript backend.

## ✅ Switched from SQLite to MySQL

The application now uses a **MySQL server** (compatible with MySQL Workbench) instead of the original SQLite database. All data performed through the web interface will be persisted in the configured MySQL database so you can view, query, and manage it directly from MySQL Workbench.

### 🔧 Setup Steps

1. **Install dependencies**
   \\\ash
   npm install
   \\\

2. **Create a MySQL database** (e.g., using MySQL Workbench):
   - Host: \localhost\ (or your server address)
   - Port: \3306\ (default)
   - Database name: \coolhouse\ (or update in \.env\)
   - Create a user with proper privileges or use \oot\.

3. **Add environment variables**
   Create a \.env\ file at the project root with the following content:
   \\\ini
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=coolhouse
   JWT_SECRET=another-secret-key
   NODE_ENV=development
   \\\

4. **Run the server**
   \\\ash
   npm run dev
   \\\
   The startup sequence will automatically:
   - Initialize the database schema (\users\, \inventory\, \sales\, \expenses\ tables)
   - Seed initial admin/worker and sample data if needed

5. **Open MySQL Workbench**
   - Connect to the same host/port with the credentials from \.env\.
   - You should see the \coolhouse\ database and all tables.
   - As you interact with the website (register users, add inventory, record sales, etc.), the changes will be visible in Workbench in real time.

### 📝 Code changes summary

- Replaced \etter-sqlite3\ with \mysql2/promise\.
- Added \server/db.ts\ with connection pooling, query helper, and transaction helper.
- Converted controllers and seed logic to use async/await and MySQL query syntax.
- Added \initDb()\ to create tables inside MySQL if missing.
- Updated startup logic in \server.ts\ to run initialization before seeding.

### 📦 Additional notes

- **MySQL Workbench visibility**: Once connected to the database the app uses, any SQL queries you run will reflect live user actions (inserts, updates, deletes).
- **Error handling**: Duplicate entries and transaction failures are now surfaced with appropriate HTTP responses.
- You can change database credentials or host in the \.env\ file to point to a remote MySQL server.

---

Feel free to extend the dashboard, add new reports, or plug in a different front‑end framework—this backend now relies on a standard relational database accessible via MySQL Workbench.
