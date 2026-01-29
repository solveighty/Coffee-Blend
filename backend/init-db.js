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

    // Create orders table
    const createOrdersTableQuery = `
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        street_address VARCHAR(255) NOT NULL,
        apartment VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        postcode VARCHAR(20) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createOrdersTableQuery);
    console.log('✓ Orders table created successfully');

    // Create index on email for better query performance
    const createOrdersIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
    `;

    await pool.query(createOrdersIndexQuery);
    console.log('✓ Index created on orders email column');

    console.log('✓ Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
