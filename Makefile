# Makefile for TV.RUSLANMV.COM
# Simplifies common development and deployment tasks

.PHONY: help install up down dev test lint clean migrate seed backup generate-episode

# Default target
help:
	@echo "📺 TV.RUSLANMV.COM - Available Commands"
	@echo "=================================="
	@echo "  make install           - Install all dependencies"
	@echo "  make up                - Start all services (Docker)"
	@echo "  make down              - Stop all services"
	@echo "  make dev               - Start development mode"
	@echo "  make test              - Run all tests"
	@echo "  make lint              - Lint all code"
	@echo "  make clean             - Clean temporary files"
	@echo "  make migrate           - Run database migrations"
	@echo "  make seed              - Seed database with sample data"
	@echo "  make backup            - Backup database"
	@echo "  make generate-episode  - Generate today's episode"
	@echo "  make logs              - View all service logs"
	@echo "  make restart           - Restart all services"

# Installation
install:
	@echo "📦 Installing dependencies..."
	@cd frontend && npm install
	@cd mcp-server && npm install
	@cd backend && pip install -r requirements.txt
	@cd content-generator && pip install -r requirements.txt
	@cd video-processor && pip install -r requirements.txt
	@echo "✅ Installation complete!"

# Docker operations
up:
	@echo "🚀 Starting all services..."
	@docker-compose up -d
	@echo "✅ Services started!"
	@echo "   Frontend: http://localhost:3001"
	@echo "   Backend: http://localhost:8000"
	@echo "   API Docs: http://localhost:8000/docs"

down:
	@echo "🛑 Stopping all services..."
	@docker-compose down
	@echo "✅ Services stopped!"

restart:
	@echo "🔄 Restarting services..."
	@docker-compose restart
	@echo "✅ Services restarted!"

logs:
	@docker-compose logs -f

logs-frontend:
	@docker-compose logs -f frontend

logs-backend:
	@docker-compose logs -f backend

logs-mcp:
	@docker-compose logs -f mcp-server

# Development mode
dev:
	@echo "🔧 Starting development mode..."
	@echo "Starting backend..."
	@cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
	@echo "Starting MCP server..."
	@cd mcp-server && npm run dev &
	@echo "Starting frontend..."
	@cd frontend && npm run dev &
	@echo "✅ Development servers started!"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend: http://localhost:8000"
	@echo "   Press Ctrl+C to stop"

dev-stop:
	@echo "Stopping development servers..."
	@pkill -f "uvicorn app.main:app"
	@pkill -f "next dev"
	@pkill -f "npm run dev"
	@echo "✅ Development servers stopped!"

# Testing
test:
	@echo "🧪 Running tests..."
	@cd backend && pytest tests/ -v
	@cd frontend && npm test
	@cd mcp-server && npm test
	@echo "✅ Tests complete!"

test-backend:
	@cd backend && pytest tests/ -v --cov=app

test-frontend:
	@cd frontend && npm test

test-mcp:
	@cd mcp-server && npm test

# Linting
lint:
	@echo "🔍 Linting code..."
	@cd backend && black app/ && isort app/ && flake8 app/
	@cd content-generator && black src/ && isort src/
	@cd frontend && npm run lint
	@cd mcp-server && npm run lint
	@echo "✅ Linting complete!"

lint-fix:
	@echo "🔧 Fixing lint issues..."
	@cd backend && black app/ && isort app/
	@cd frontend && npm run lint:fix
	@cd mcp-server && npm run lint:fix
	@echo "✅ Lint fixes applied!"

# Database operations
migrate:
	@echo "🗄️  Running database migrations..."
	@docker-compose exec backend alembic upgrade head
	@echo "✅ Migrations complete!"

migrate-create:
	@echo "Creating new migration: $(name)"
	@docker-compose exec backend alembic revision --autogenerate -m "$(name)"

seed:
	@echo "🌱 Seeding database..."
	@docker-compose exec postgres psql -U tvuser -d tvruslanmv -f /docker-entrypoint-initdb.d/seeds/sample_episodes.sql
	@echo "✅ Database seeded!"

backup:
	@echo "💾 Backing up database..."
	@mkdir -p backups
	@docker-compose exec postgres pg_dump -U tvuser tvruslanmv > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup created in backups/"

restore:
	@echo "📥 Restoring database from: $(file)"
	@docker-compose exec -T postgres psql -U tvuser -d tvruslanmv < $(file)
	@echo "✅ Database restored!"

# Content generation
generate-episode:
	@echo "🎬 Generating today's episode..."
	@docker-compose run --rm content-generator python src/main.py --generate-episode
	@echo "✅ Episode generated!"

generate-video:
	@echo "🎥 Generating video..."
	@docker-compose run --rm video-processor python src/main.py --mode once
	@echo "✅ Video generated!"

# Cleaning
clean:
	@echo "🧹 Cleaning temporary files..."
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".next" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete
	@find . -type f -name ".DS_Store" -delete
	@echo "✅ Cleanup complete!"

clean-all: clean
	@echo "🧹 Deep cleaning (including volumes)..."
	@docker-compose down -v
	@rm -rf content-generator/output/*
	@rm -rf video-processor/output/*
	@echo "✅ Deep cleanup complete!"

# Production builds
build:
	@echo "🏗️  Building production images..."
	@docker-compose build
	@echo "✅ Build complete!"

build-frontend:
	@cd frontend && npm run build

build-mcp:
	@cd mcp-server && npm run build

# Health checks
health:
	@echo "🏥 Checking service health..."
	@curl -f http://localhost:8000/health || echo "❌ Backend unhealthy"
	@curl -f http://localhost:3001 || echo "❌ Frontend unhealthy"
	@docker-compose ps
	@echo "✅ Health check complete!"

# Monitoring
status:
	@echo "📊 Service Status"
	@echo "=================================="
	@docker-compose ps

stats:
	@echo "📈 Container Stats"
	@docker stats --no-stream

# Development helpers
shell-backend:
	@docker-compose exec backend bash

shell-frontend:
	@docker-compose exec frontend sh

shell-db:
	@docker-compose exec postgres psql -U tvuser -d tvruslanmv

# MCP server testing
test-mcp-tools:
	@echo "🧪 Testing MCP tools..."
	@python scripts/test_mcp_server.py

# Documentation
docs:
	@echo "📚 Generating documentation..."
	@cd docs && mkdocs build
	@echo "✅ Documentation built in docs/site/"

docs-serve:
	@cd docs && mkdocs serve

# Environment setup
env-setup:
	@echo "⚙️  Setting up environment..."
	@cp .env.example .env
	@echo "✅ .env file created. Please edit with your credentials."

# Quick start for new developers
quickstart: env-setup install up migrate seed
	@echo "🎉 Quick start complete!"
	@echo "   Open http://localhost:3001 to see the app"
	@echo "   Run 'make generate-episode' to create your first episode"

# CI/CD helpers
ci-test:
	@echo "🤖 Running CI tests..."
	@docker-compose -f docker-compose.test.yml up --abort-on-container-exit
	@docker-compose -f docker-compose.test.yml down

# Security scanning
security-scan:
	@echo "🔒 Running security scans..."
	@cd backend && safety check
	@cd frontend && npm audit
	@cd mcp-server && npm audit
	@echo "✅ Security scan complete!"

# Performance testing
perf-test:
	@echo "⚡ Running performance tests..."
	@cd tests && locust -f performance/locustfile.py
	@echo "✅ Performance test complete!"

# Export analytics
export-analytics:
	@echo "📊 Exporting analytics..."
	@docker-compose exec backend python scripts/export_analytics.py
	@echo "✅ Analytics exported!"

# Version management
version:
	@echo "Current version: $(shell cat VERSION 2>/dev/null || echo '0.1.0')"

bump-version:
	@echo "Bumping version..."
	@npm version patch
	@echo "✅ Version bumped!"
