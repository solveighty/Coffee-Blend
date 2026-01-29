const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initializeDatabase() {
  try {
    // Create reservations table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        phone VARCHAR(20) NOT NULL,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createTableQuery);
    console.log('✓ Reservations table created successfully');

    // Create index on date for better query performance
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
    `;

    await pool.query(createIndexQuery);
    console.log('✓ Index created on date column');

    console.log('✓ Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
