#!/bin/bash

# Coffee Blend Backend Setup Script
# This script sets up the PostgreSQL database and Node.js backend

set -e

echo "================================"
echo "Coffee Blend Backend Setup"
echo "================================"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "ERROR: PostgreSQL is not installed."
    echo "Please install PostgreSQL first:"
    echo "  - Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "  - macOS: brew install postgresql"
    echo "  - Windows: https://www.postgresql.org/download/windows/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ PostgreSQL found: $(psql --version)"
echo "✓ Node.js found: $(node --version)"
echo ""

# Create database
echo "Creating PostgreSQL database..."
PGPASSWORD=${PGPASSWORD:-} psql -U postgres -c "CREATE DATABASE coffee_blend;" 2>/dev/null || echo "Database might already exist (that's ok)"
echo "✓ Database creation completed"
echo ""

# Setup backend
echo "Setting up Node.js backend..."
cd backend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found in backend directory"
    exit 1
fi

# Install dependencies
echo "Installing Node.js dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "Please edit the .env file with your PostgreSQL credentials:"
    echo "  nano .env"
    echo ""
else
    echo "✓ .env file already exists"
fi

echo "Initialize the database..."
node init-db.js

echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "To start the backend server, run:"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "The API will be available at: http://localhost:5000"
echo "API endpoints:"
echo "  - POST   /api/reservations      - Create a new reservation"
echo "  - GET    /api/reservations      - Get all reservations"
echo "  - GET    /api/reservations/:id  - Get a specific reservation"
echo "  - DELETE /api/reservations/:id  - Delete a reservation"
echo ""
