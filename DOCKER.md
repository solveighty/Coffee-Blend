# Docker & Kubernetes Setup Guide

## Quick Start with Docker Compose

### Development Environment

```bash
# 1. Navigate to project root
cd /path/to/Coffee-Blend-main

# 2. Start all services (PostgreSQL + Backend + Frontend)
docker-compose up -d

# 3. Initialize database (run migrations)
docker exec coffee_blend_backend npm run init-db

# 4. Access the application
# Frontend: http://localhost:8000
# Backend API: http://localhost:5000
# PostgreSQL: localhost:5432
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f frontend
```

### Stop Services

```bash
docker-compose down

# Also remove volumes (careful - deletes database!)
docker-compose down -v
```

## Production Deployment

### Using Production Compose File

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d

# With environment variables
DATABASE_URL=postgresql://admin:securepass@postgres:5432/mydatabase \
NODE_ENV=production \
PORT=5000 \
docker-compose -f docker-compose.prod.yml up -d
```

### Create `.env.prod` file

```bash
cat > .env.prod << EOF
DB_USER=admin
DB_PASSWORD=your_secure_password
DB_NAME=mydatabase
PORT=5000
NODE_ENV=production
EOF
```

Then run:
```bash
set -a && source .env.prod && set +a && \
docker-compose -f docker-compose.prod.yml up -d
```

## Building Individual Images

### Backend

```bash
# Development build
docker build -t coffee-blend-backend:latest ./backend

# Run
docker run -p 5000:5000 \
  -e DATABASE_URL=postgresql://admin:admin123@host.docker.internal:5432/mydatabase \
  -e NODE_ENV=development \
  coffee-blend-backend:latest
```

### Frontend (Nginx)

```bash
# Build custom frontend image
docker build -t coffee-blend-frontend:latest -f Dockerfile.frontend .

# Run
docker run -p 8000:80 coffee-blend-frontend:latest
```

## Kubernetes Deployment (Next Steps)

### Prerequisites

```bash
kubectl apply -f kubernetes/
```

Files you'll need:
- `kubernetes/namespace.yaml` - Create namespace
- `kubernetes/postgres-secret.yaml` - Database credentials
- `kubernetes/postgres-deployment.yaml` - PostgreSQL StatefulSet
- `kubernetes/backend-deployment.yaml` - Backend Deployment
- `kubernetes/frontend-deployment.yaml` - Frontend Deployment
- `kubernetes/ingress.yaml` - Ingress configuration

### Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace coffee-blend

# Create secrets
kubectl create secret generic postgres-secret \
  --from-literal=password=your_secure_password \
  -n coffee-blend

# Deploy services
kubectl apply -f kubernetes/ -n coffee-blend

# Check status
kubectl get pods -n coffee-blend
kubectl get services -n coffee-blend
kubectl get ingress -n coffee-blend
```

## Troubleshooting

### Backend can't connect to database

```bash
# Check if postgres is running
docker ps | grep postgres

# Check postgres logs
docker logs coffee_blend_db

# Connect directly to test
docker exec -it coffee_blend_db psql -U admin -d mydatabase
```

### API requests failing

```bash
# Check backend logs
docker logs coffee_blend_backend

# Test API endpoint
curl http://localhost:5000/health
```

### Frontend not loading

```bash
# Check nginx logs
docker logs coffee_blend_frontend

# Verify frontend container is running
docker ps | grep frontend
```

## Environment Variables

### Backend (.env or Kubernetes ConfigMap)

```
NODE_ENV=development|production
PORT=5000
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### Frontend (js/config.js)

```javascript
const API_URL = 'http://localhost:5000';
```

In Docker, the frontend makes requests to `http://backend:5000` via nginx proxy.

## Docker Network

All services communicate through `coffee_blend_network`:

- `postgres:5432` - Database
- `backend:5000` - Node.js API
- `frontend:80` - Nginx (serves frontend)

External access:
- Frontend: `http://localhost:8000`
- Backend: `http://localhost:5000`
- Database: `localhost:5432`

## Performance Tips

### For Development
- Use hot reload: `npm run dev` in backend
- Mount volumes for code changes
- Keep smaller image sizes with Alpine

### For Production
- Use multi-stage builds (already in Dockerfile)
- Set resource limits in docker-compose.prod.yml
- Use health checks
- Configure logging appropriately
- Don't expose database ports
- Use environment variables for secrets

## Security Checklist

- [ ] Change default database password
- [ ] Use environment variables for secrets
- [ ] Don't commit `.env` files
- [ ] Use non-root user in containers
- [ ] Enable HTTPS with SSL certificates
- [ ] Restrict network access with firewalls
- [ ] Regular security updates: `docker pull` latest images
- [ ] Use secret management for production (Vault, AWS Secrets, K8s Secrets)

## References

- Docker Compose: https://docs.docker.com/compose/
- Dockerfile best practices: https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
- Kubernetes: https://kubernetes.io/docs/
- PostgreSQL Docker: https://hub.docker.com/_/postgres
- Node.js Docker: https://hub.docker.com/_/node
