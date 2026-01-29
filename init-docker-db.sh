#!/bin/bash

# Initialize Coffee Blend Database
# Usage: ./init-docker-db.sh

echo "🚀 Initializing Coffee Blend Database in Docker..."

# Check if backend container is running
if ! docker ps | grep -q coffee_blend_backend; then
    echo "❌ Backend container not running. Starting Docker Compose..."
    docker-compose up -d
    sleep 10
fi

# Run init-db script
echo "📊 Running database initialization..."
docker exec coffee_blend_backend npm run init-db

if [ $? -eq 0 ]; then
    echo "✅ Database initialized successfully!"
    echo ""
    echo "📝 Services:"
    echo "  Frontend: http://localhost:8000"
    echo "  Backend API: http://localhost:5000"
    echo "  Database: localhost:5432"
    echo ""
    echo "📋 Useful commands:"
    echo "  View logs: docker-compose logs -f"
    echo "  Stop services: docker-compose down"
    echo "  Access DB: docker exec -it coffee_blend_db psql -U admin -d mydatabase"
else
    echo "❌ Database initialization failed"
    echo "💡 Check logs: docker-compose logs -f backend"
    exit 1
fi
