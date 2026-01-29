# Coffee Blend Kubernetes Deployment Guide

## Overview

This directory contains the Kubernetes manifest for deploying Coffee Blend on a Kubernetes cluster (Talos or any K8s distribution).

The stack includes:
- **PostgreSQL 16** - Database
- **Node.js Backend** - API server
- **Nginx Frontend** - Static files + reverse proxy
- **Init Job** - Database initialization

## Prerequisites

1. **Kubernetes cluster** (Talos, K3s, or standard K8s)
2. **kubectl** configured to access your cluster
3. **Backend image built and pushed** to your registry:
   ```bash
   docker build -t solveighty/coffee-blend-backend:1.0 -f backend/Dockerfile backend
   docker push solveighty/coffee-blend-backend:1.0
   ```
4. **Node with label** `kubernetes.io/hostname: trabajador-vm` available in your cluster

## Quick Start

### 1. Deploy the entire stack

```bash
kubectl apply -f k8s/coffee-stack.yaml
```

This creates:
- Namespace: `coffee`
- PostgreSQL Deployment + Service
- Backend Deployment + Service
- Database initialization Job
- Frontend Deployment + Service (NodePort)

### 2. Verify deployment

```bash
# Check all resources in coffee namespace
kubectl get all -n coffee

# Watch pods being created
kubectl get pods -n coffee -w

# Get detailed pod information
kubectl get pods -n coffee -o wide
```

### 3. Check database initialization

```bash
# View init job logs
kubectl logs -n coffee job/coffee-init-db

# Check job status
kubectl get job -n coffee

# If job failed, check pod logs
kubectl get pods -n coffee | grep init-db
kubectl logs -n coffee <pod-name>
```

### 4. Monitor services

```bash
# Get all services
kubectl get svc -n coffee

# Check service endpoints
kubectl get endpoints -n coffee
```

### 5. Access the application

**Frontend URL:**
```
http://<worker-node-ip>:30579
```

Replace `<worker-node-ip>` with the IP of `trabajador-vm`.

To get the worker node IP:
```bash
kubectl get nodes -o wide | grep trabajador-vm
```

## Troubleshooting

### Frontend not loading

```bash
# Check frontend pod logs
kubectl logs -n coffee deployment/coffee-frontend

# Check init container logs
kubectl logs -n coffee deployment/coffee-frontend -c clone-repo

# Describe the pod for events
kubectl describe pod -n coffee -l app=coffee-frontend
```

### Backend API not responding

```bash
# Check backend pod logs
kubectl logs -n coffee deployment/coffee-backend

# Check if backend service is accessible from frontend
kubectl exec -n coffee -it deployment/coffee-frontend -- wget -O- http://coffee-backend:5000/health
```

### Database connection issues

```bash
# Check PostgreSQL pod logs
kubectl logs -n coffee deployment/postgres

# Check if PostgreSQL is ready
kubectl get pods -n coffee -l app=postgres

# Connect to PostgreSQL directly (if needed)
kubectl port-forward -n coffee svc/postgres 5432:5432

# In another terminal
psql -h localhost -U admin -d mydatabase
```

### Init job not running

```bash
# Get detailed job info
kubectl describe job -n coffee coffee-init-db

# Check job pod logs
kubectl logs -n coffee -l job-name=coffee-init-db

# Re-run the job (delete and recreate)
kubectl delete job -n coffee coffee-init-db
kubectl apply -f k8s/coffee-stack.yaml
```

## Configuration

### Change node selector

If your worker node has a different hostname:

```bash
sed -i 's/trabajador-vm/your-node-name/g' k8s/coffee-stack.yaml
kubectl apply -f k8s/coffee-stack.yaml
```

### Change NodePort

To use a different port for the frontend:

```bash
# Edit the file
sed -i 's/30579/your-port-number/g' k8s/coffee-stack.yaml
kubectl apply -f k8s/coffee-stack.yaml
```

### Scale backend replicas

```bash
kubectl scale deployment coffee-backend --replicas=3 -n coffee
```

### View all resources

```bash
# All resources in the namespace
kubectl get all -n coffee

# Detailed view
kubectl describe namespace coffee
kubectl describe pod -n coffee
kubectl describe service -n coffee
kubectl describe job -n coffee
```

## Cleanup

### Delete everything

```bash
kubectl delete -f k8s/coffee-stack.yaml
```

### Delete only namespace (deletes all resources inside)

```bash
kubectl delete namespace coffee
```

## Health Checks

The stack includes health checks:

### Frontend health
```bash
kubectl exec -n coffee deployment/coffee-frontend -- wget -O- http://localhost:80/health
```

### Backend health
```bash
kubectl exec -n coffee deployment/coffee-backend -- curl http://localhost:5000/health
```

### Database health
```bash
kubectl exec -n coffee deployment/postgres -- pg_isready -U admin -d mydatabase
```

## Port Forwarding (for development)

If you need direct access to services:

```bash
# Frontend
kubectl port-forward -n coffee svc/coffee-frontend 8000:80

# Backend API
kubectl port-forward -n coffee svc/coffee-backend 5000:5000

# Database
kubectl port-forward -n coffee svc/postgres 5432:5432
```

Then access at:
- Frontend: http://localhost:8000
- Backend API: http://localhost:5000
- Database: localhost:5432

## Files Structure

```
k8s/
├── coffee-stack.yaml    # Main manifest (all resources)
└── README.md            # This file
```

## Important Notes

1. **Persistent Storage**: This setup uses `emptyDir` for PostgreSQL. For production, use PersistentVolumes (PV) and PersistentVolumeClaims (PVC).

2. **Secrets**: The secret is stored as plaintext in the manifest. For production, use Kubernetes Secrets Operator, HashiCorp Vault, or cloud provider secret management.

3. **Image Registry**: The backend image `solveighty/coffee-blend-backend:1.0` must be available. Build and push it first.

4. **Node Affinity**: All workloads are pinned to `trabajador-vm`. Ensure this node exists and is ready.

5. **Resource Limits**: Adjust resource requests and limits based on your infrastructure capacity.

## Typical Workflow

1. **Build and push the backend image:**
   ```bash
   docker build -t solveighty/coffee-blend-backend:1.0 -f backend/Dockerfile backend
   docker push solveighty/coffee-blend-backend:1.0
   ```

2. **Deploy the stack:**
   ```bash
   kubectl apply -f k8s/coffee-stack.yaml
   ```

3. **Wait for initialization:**
   ```bash
   kubectl wait --for=condition=complete --timeout=300s -n coffee job/coffee-init-db
   ```

4. **Check all services are running:**
   ```bash
   kubectl get pods -n coffee
   ```

5. **Access the application:**
   ```bash
   # Get worker node IP
   kubectl get nodes -o wide | grep trabajador-vm
   
   # Open browser to http://<ip>:30579
   ```

## Additional Commands

```bash
# Real-time monitoring
kubectl top pods -n coffee                    # CPU/Memory usage
kubectl get events -n coffee --sort-by='.lastTimestamp'  # Events

# Debugging
kubectl debug pod/<name> -n coffee -it       # Debug pod
kubectl attach pod/<name> -n coffee -i       # Attach to pod

# Configuration
kubectl get configmap -n coffee
kubectl describe configmap nginx-config -n coffee
kubectl edit configmap nginx-config -n coffee  # Edit nginx config

# Secrets
kubectl get secrets -n coffee
kubectl describe secret postgres-secret -n coffee

# Logs
kubectl logs -n coffee deployment/coffee-frontend --tail=50 -f
kubectl logs -n coffee deployment/coffee-backend --tail=50 -f
kubectl logs -n coffee deployment/postgres --tail=50 -f
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review pod logs with `kubectl logs`
3. Check events with `kubectl describe pod`
4. Verify node selector matches your cluster node names
