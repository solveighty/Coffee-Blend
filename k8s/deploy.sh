#!/bin/bash

# Coffee Blend Kubernetes Deployment Helper
# Usage: ./k8s/deploy.sh [action]

set -e

NAMESPACE="coffee"
STACK_FILE="k8s/coffee-stack.yaml"
BACKEND_IMAGE="solveighty/coffee-blend-backend:1.0"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Help message
show_help() {
    cat << EOF
${BLUE}Coffee Blend Kubernetes Deployment Helper${NC}

Usage: ./k8s/deploy.sh [action]

Actions:
  deploy              Deploy the entire stack to Kubernetes
  status              Show deployment status
  logs [service]      Show logs (service: backend, postgres, frontend, init-db)
  delete              Delete the entire stack
  restart [service]   Restart a service (backend, postgres, frontend)
  test                Test API connectivity
  help                Show this help message

Examples:
  ./k8s/deploy.sh deploy
  ./k8s/deploy.sh logs backend
  ./k8s/deploy.sh restart backend
  ./k8s/deploy.sh status

${YELLOW}Prerequisites:${NC}
  - kubectl configured
  - Kubernetes cluster available
  - Node with label: kubernetes.io/hostname=trabajador-vm
  - Backend image pushed: $BACKEND_IMAGE

EOF
}

# Deploy function
deploy() {
    echo -e "${BLUE}🚀 Deploying Coffee Blend to Kubernetes...${NC}"
    
    if ! kubectl apply -f $STACK_FILE; then
        echo -e "${RED}❌ Deployment failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Stack deployed successfully!${NC}"
    echo ""
    
    # Wait for services to be ready
    echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
    
    # Wait for PostgreSQL
    echo "   Waiting for PostgreSQL..."
    kubectl wait --for=condition=Ready pod -l app=postgres -n $NAMESPACE --timeout=120s 2>/dev/null || true
    
    # Wait for Backend
    echo "   Waiting for Backend..."
    kubectl wait --for=condition=Ready pod -l app=coffee-backend -n $NAMESPACE --timeout=120s 2>/dev/null || true
    
    # Wait for Frontend
    echo "   Waiting for Frontend (init container may take a moment)..."
    kubectl wait --for=condition=Ready pod -l app=coffee-frontend -n $NAMESPACE --timeout=300s 2>/dev/null || true
    
    # Wait for Init Job
    echo "   Waiting for Database initialization..."
    kubectl wait --for=condition=complete job/coffee-init-db -n $NAMESPACE --timeout=300s 2>/dev/null || {
        echo -e "${YELLOW}   ⚠️  Init job still running, showing logs...${NC}"
        kubectl logs job/coffee-init-db -n $NAMESPACE || true
    }
    
    echo ""
    show_status
}

# Status function
show_status() {
    echo -e "${BLUE}📊 Deployment Status:${NC}"
    echo ""
    
    echo "Pods:"
    kubectl get pods -n $NAMESPACE -o wide
    
    echo ""
    echo "Services:"
    kubectl get svc -n $NAMESPACE
    
    echo ""
    echo "Jobs:"
    kubectl get jobs -n $NAMESPACE
    
    echo ""
    echo -e "${GREEN}Access Information:${NC}"
    
    # Get worker node IP
    NODE_IP=$(kubectl get nodes -o wide | grep trabajador-vm | awk '{print $6}' | head -1)
    
    if [ -z "$NODE_IP" ]; then
        echo "   ❌ Node 'trabajador-vm' not found"
    else
        echo "   Frontend: ${GREEN}http://$NODE_IP:30579${NC}"
        echo "   Backend API: ${GREEN}http://coffee-backend:5000${NC} (internal)"
        echo "   PostgreSQL: ${GREEN}$NODE_IP:5432${NC}"
    fi
}

# Logs function
show_logs() {
    local service=$1
    
    case $service in
        backend)
            echo -e "${BLUE}📋 Backend Logs:${NC}"
            kubectl logs deployment/coffee-backend -n $NAMESPACE -f
            ;;
        postgres)
            echo -e "${BLUE}📋 PostgreSQL Logs:${NC}"
            kubectl logs deployment/postgres -n $NAMESPACE -f
            ;;
        frontend)
            echo -e "${BLUE}📋 Frontend Logs:${NC}"
            kubectl logs deployment/coffee-frontend -n $NAMESPACE -f
            ;;
        init-db)
            echo -e "${BLUE}📋 Init DB Job Logs:${NC}"
            kubectl logs job/coffee-init-db -n $NAMESPACE
            ;;
        *)
            echo -e "${RED}❌ Unknown service: $service${NC}"
            echo "Available: backend, postgres, frontend, init-db"
            exit 1
            ;;
    esac
}

# Delete function
delete() {
    echo -e "${YELLOW}⚠️  Deleting Coffee Blend stack from Kubernetes...${NC}"
    read -p "Are you sure? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl delete -f $STACK_FILE
        echo -e "${GREEN}✅ Stack deleted${NC}"
    else
        echo -e "${BLUE}Cancelled${NC}"
    fi
}

# Restart function
restart() {
    local service=$1
    
    case $service in
        backend)
            echo -e "${BLUE}🔄 Restarting Backend...${NC}"
            kubectl rollout restart deployment/coffee-backend -n $NAMESPACE
            kubectl rollout status deployment/coffee-backend -n $NAMESPACE
            echo -e "${GREEN}✅ Backend restarted${NC}"
            ;;
        postgres)
            echo -e "${BLUE}🔄 Restarting PostgreSQL...${NC}"
            kubectl rollout restart deployment/postgres -n $NAMESPACE
            kubectl rollout status deployment/postgres -n $NAMESPACE
            echo -e "${GREEN}✅ PostgreSQL restarted${NC}"
            ;;
        frontend)
            echo -e "${BLUE}🔄 Restarting Frontend...${NC}"
            kubectl rollout restart deployment/coffee-frontend -n $NAMESPACE
            kubectl rollout status deployment/coffee-frontend -n $NAMESPACE
            echo -e "${GREEN}✅ Frontend restarted${NC}"
            ;;
        *)
            echo -e "${RED}❌ Unknown service: $service${NC}"
            echo "Available: backend, postgres, frontend"
            exit 1
            ;;
    esac
}

# Test function
test_connectivity() {
    echo -e "${BLUE}🧪 Testing API Connectivity...${NC}"
    echo ""
    
    # Test PostgreSQL from Backend
    echo -n "Testing PostgreSQL connection... "
    if kubectl exec -it deployment/coffee-backend -n $NAMESPACE -- curl -s http://coffee-backend:5000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
    
    # Test Backend from Frontend
    echo -n "Testing Backend from Frontend... "
    if kubectl exec -it deployment/coffee-frontend -n $NAMESPACE -- wget -q -O- http://coffee-backend:5000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}Pod details:${NC}"
    kubectl get pods -n $NAMESPACE -o wide
}

# Main script logic
case "${1:-help}" in
    deploy)
        deploy
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs "${2:-backend}"
        ;;
    delete)
        delete
        ;;
    restart)
        restart "${2:-backend}"
        ;;
    test)
        test_connectivity
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown action: $1${NC}"
        show_help
        exit 1
        ;;
esac
