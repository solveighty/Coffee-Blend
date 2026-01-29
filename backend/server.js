const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to PostgreSQL database');
    release();
  }
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Create a new reservation
app.post('/api/reservations', async (req, res) => {
  try {
    const { firstName, lastName, date, time, phone, message } = req.body;

    // Validation
    if (!firstName || !lastName || !date || !time || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Insert into database
    const query = `
      INSERT INTO reservations (first_name, last_name, date, time, phone, message, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, first_name, last_name, date, time, phone, message, created_at;
    `;

    const values = [firstName, lastName, date, time, phone, message || null];
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating reservation',
      error: error.message
    });
  }
});

// Get all reservations
app.get('/api/reservations', async (req, res) => {
  try {
    const query = 'SELECT * FROM reservations ORDER BY created_at DESC;';
    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reservations',
      error: error.message
    });
  }
});

// Get reservation by ID
app.get('/api/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM reservations WHERE id = $1;';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reservation',
      error: error.message
    });
  }
});

// Delete reservation
app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM reservations WHERE id = $1 RETURNING id;';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reservation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting reservation',
      error: error.message
    });
  }
});

// Create a new order
app.post('/api/orders', async (req, res) => {
  try {
    const { firstName, lastName, country, streetAddress, apartment, city, postcode, phone, email, totalAmount, paymentMethod } = req.body;

    // Validation
    if (!firstName || !lastName || !country || !streetAddress || !city || !postcode || !phone || !email || !totalAmount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Insert into database
    const query = `
      INSERT INTO orders (first_name, last_name, country, street_address, apartment, city, postcode, phone, email, total_amount, payment_method, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', NOW())
      RETURNING id, first_name, last_name, country, street_address, apartment, city, postcode, phone, email, total_amount, payment_method, status, created_at;
    `;

    const values = [firstName, lastName, country, streetAddress, apartment || null, city, postcode, phone, email, totalAmount, paymentMethod || 'card'];
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const query = 'SELECT * FROM orders ORDER BY created_at DESC;';
    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Get order by ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM orders WHERE id = $1;';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
