# 🚀 TV.RUSLANMV.COM - Deployment Guide

Complete guide for deploying TV.RUSLANMV.COM to production.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Production Environment Setup](#production-environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Monitoring & Logging](#monitoring--logging)
7. [Backup & Disaster Recovery](#backup--disaster-recovery)
8. [Scaling Considerations](#scaling-considerations)
9. [Troubleshooting](#troubleshooting)

---

## 1. Pre-Deployment Checklist

### Required Services & Credentials

- [x] **IBM watsonx.ai**
  - API Key
  - Project ID
  - Model access configured

- [x] **YouTube API**
  - API key
  - OAuth client ID & secret
  - Refresh token
  - Channel created and configured

- [x] **Domain & SSL**
  - Domain registered (tv.ruslanmv.com)
  - SSL certificate obtained
  - DNS configured

- [x] **Infrastructure**
  - Server/Cloud provider selected
  - Database server provisioned
  - Redis instance ready
  - Backup storage configured

- [x] **Optional Services**
  - TTS service (ElevenLabs/OpenAI)
  - Email service (SMTP)
  - Analytics (Google Analytics/Plausible)
  - Error tracking (Sentry)

### Security Checklist

- [x] All secrets in environment variables
- [x] Strong database passwords
- [x] SSL/TLS enabled
- [x] CORS properly configured
- [x] Rate limiting enabled
- [x] API authentication implemented
- [x] Regular security audits scheduled

---

## 2. Production Environment Setup

### Server Requirements

**Minimum Specifications:**
- CPU: 4 cores
- RAM: 16 GB
- Storage: 100 GB SSD
- OS: Ubuntu 22.04 LTS

**Recommended for Production:**
- CPU: 8 cores
- RAM: 32 GB
- Storage: 500 GB SSD
- Bandwidth: 1 Gbps

### Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin

# Install Nginx (if not using Docker)
sudo apt install nginx

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx
```

### Setup Production Environment

```bash
# Create application directory
sudo mkdir -p /opt/tvruslanmv
cd /opt/tvruslanmv

# Clone repository
git clone https://github.com/ruslanmv/tv.ruslanmv.com.git .

# Copy and configure environment
cp .env.example .env.production
nano .env.production  # Edit with production values

# Set proper permissions
sudo chown -R $USER:$USER /opt/tvruslanmv
```

### Configure Environment Variables

```bash
# Edit production environment
nano .env.production
```

**Critical Production Settings:**

```env
ENVIRONMENT=production
NODE_ENV=production

# Database (use managed service)
DATABASE_URL=postgresql://user:secure_password@db.host:5432/tvruslanmv

# Security
JWT_SECRET_KEY=generate_very_long_random_string
CORS_ALLOW_ORIGINS=https://tv.ruslanmv.com

# SSL
SSL_ENABLED=true

# Rate limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=60
```

---

## 3. Docker Deployment

### Build Production Images

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Or build individually
docker build -t tvruslanmv/frontend:latest ./frontend
docker build -t tvruslanmv/backend:latest ./backend
docker build -t tvruslanmv/mcp-server:latest ./mcp-server
```

### Deploy with Docker Compose

```bash
# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: tvruslanmv
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - tvruslanmv-network
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data
    networks:
      - tvruslanmv-network

  backend:
    image: tvruslanmv/backend:latest
    restart: always
    env_file: .env.production
    depends_on:
      - postgres
      - redis
    networks:
      - tvruslanmv-network
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '2'
          memory: 4G

  frontend:
    image: tvruslanmv/frontend:latest
    restart: always
    env_file: .env.production
    depends_on:
      - backend
    networks:
      - tvruslanmv-network

  mcp-server:
    image: tvruslanmv/mcp-server:latest
    restart: always
    env_file: .env.production
    depends_on:
      - backend
    networks:
      - tvruslanmv-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - certbot_www:/var/www/certbot
      - certbot_conf:/etc/letsencrypt
    networks:
      - tvruslanmv-network

volumes:
  postgres_data:
  redis_data:
  certbot_www:
  certbot_conf:

networks:
  tvruslanmv-network:
    driver: bridge
```

---

## 4. Kubernetes Deployment

### Prerequisites

```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### Create Kubernetes Manifests

**Namespace:**

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: tvruslanmv
```

**Database:**

```yaml
# k8s/postgres-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: tvruslanmv
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:16-alpine
        env:
        - name: POSTGRES_DB
          value: tvruslanmv
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: tvruslanmv
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

**Backend Deployment:**

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: tvruslanmv
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: tvruslanmv/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        - name: WATSONX_API_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: watsonx-api-key
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: tvruslanmv
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
  - port: 8000
    targetPort: 8000
```

### Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets
kubectl create secret generic db-secrets \
  --from-literal=username=tvuser \
  --from-literal=password=secure_password \
  -n tvruslanmv

kubectl create secret generic app-secrets \
  --from-env-file=.env.production \
  -n tvruslanmv

# Deploy all services
kubectl apply -f k8s/

# Check status
kubectl get pods -n tvruslanmv
kubectl get services -n tvruslanmv

# View logs
kubectl logs -f deployment/backend -n tvruslanmv
```

---

## 5. CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy-production.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Login to GitHub Container Registry
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Build and push images
      run: |
        docker buildx build --push \
          --tag ghcr.io/ruslanmv/tv-ruslanmv-backend:latest \
          ./backend
        
        docker buildx build --push \
          --tag ghcr.io/ruslanmv/tv-ruslanmv-frontend:latest \
          ./frontend
        
        docker buildx build --push \
          --tag ghcr.io/ruslanmv/tv-ruslanmv-mcp:latest \
          ./mcp-server
    
    - name: Deploy to production
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.PROD_HOST }}
        username: ${{ secrets.PROD_USER }}
        key: ${{ secrets.PROD_SSH_KEY }}
        script: |
          cd /opt/tvruslanmv
          git pull
          docker-compose -f docker-compose.prod.yml pull
          docker-compose -f docker-compose.prod.yml up -d
          docker system prune -f
    
    - name: Run database migrations
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.PROD_HOST }}
        username: ${{ secrets.PROD_USER }}
        key: ${{ secrets.PROD_SSH_KEY }}
        script: |
          cd /opt/tvruslanmv
          docker-compose -f docker-compose.prod.yml exec -T backend alembic upgrade head
```

---

## 6. Monitoring & Logging

### Setup Monitoring

**Prometheus Configuration:**

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:8000']
  
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
```

**Grafana Dashboard:**

```bash
# Deploy monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access Grafana at http://your-server:3000
# Default credentials: admin/admin
```

### Centralized Logging

```bash
# Deploy ELK stack or use managed service
docker-compose -f docker-compose.logging.yml up -d
```

---

## 7. Backup & Disaster Recovery

### Automated Database Backups

```bash
# Create backup script
cat > /opt/tvruslanmv/scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/tvruslanmv/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U tvuser tvruslanmv | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
# Upload to S3 or similar
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://your-backup-bucket/
# Keep only last 7 days locally
find $BACKUP_DIR -mtime +7 -delete
EOF

chmod +x /opt/tvruslanmv/scripts/backup.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /opt/tvruslanmv/scripts/backup.sh
```

---

## 8. Scaling Considerations

### Horizontal Scaling

```bash
# Scale backend service
docker-compose -f docker-compose.prod.yml up -d --scale backend=5

# In Kubernetes
kubectl scale deployment backend --replicas=5 -n tvruslanmv
```

### Database Replication

Setup PostgreSQL streaming replication for read replicas.

### CDN Integration

Use Cloudflare or AWS CloudFront for static assets and video delivery.

---

## 9. Troubleshooting

### Common Issues

**Services not starting:**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check resource usage
docker stats

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

**Database connection issues:**
```bash
# Test database connection
docker-compose exec postgres psql -U tvuser -d tvruslanmv

# Check connection from backend
docker-compose exec backend python -c "from app.core.database import engine; print(engine)"
```

**SSL certificate issues:**
```bash
# Renew certificate
sudo certbot renew

# Restart nginx
docker-compose restart nginx
```

---

## 📞 Support

For deployment assistance:
- **Documentation**: https://docs.tv.ruslanmv.com
- **Issues**: https://github.com/ruslanmv/tv.ruslanmv.com/issues
- **Email**: devops@ruslanmv.com

---

**Last Updated**: 2025-01-15
