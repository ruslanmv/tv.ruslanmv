# ============================================================================
# TV.RUSLANMV.COM - Makefile
# Production-ready commands for local development and deployment
# ============================================================================

.PHONY: help install dev test clean docker-build docker-up docker-down lint format check

# Default target
.DEFAULT_GOAL := help

# ============================================================================
# HELP & INFO
# ============================================================================

help: ## Show this help message
	@echo "📺 TV.RUSLANMV.COM - Available Commands"
	@echo "======================================"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ============================================================================
# INSTALLATION & SETUP
# ============================================================================

install: ## Install all dependencies using uv
	@echo "📦 Installing dependencies with uv..."
	uv sync
	@echo "✅ Installation complete!"

install-dev: ## Install with development dependencies
	@echo "📦 Installing with dev dependencies..."
	uv sync --all-extras
	@echo "✅ Dev installation complete!"

setup: install env-setup ollama-setup ## Complete setup (install + env + ollama)
	@echo "✅ Full setup complete!"

env-setup: ## Create .env file from template
	@if [ ! -f .env ]; then \
		echo "📝 Creating .env from .env.example..."; \
		cp .env.example .env; \
		echo "⚠️  Please edit .env with your configuration"; \
	else \
		echo "ℹ️  .env already exists, skipping..."; \
	fi

# ============================================================================
# OLLAMA SETUP
# ============================================================================

ollama-setup: ## Pull Ollama models (requires Ollama running)
	@echo "🧠 Setting up Ollama models..."
	@if command -v ollama > /dev/null; then \
		ollama pull gemma:2b && \
		echo "✅ Ollama models ready!"; \
	else \
		echo "⚠️  Ollama not found. Install from https://ollama.com"; \
	fi

ollama-test: ## Test Ollama connection
	@echo "🧪 Testing Ollama..."
	@curl -s -X POST http://localhost:11434/api/generate \
		-H "Content-Type: application/json" \
		-d '{"model": "gemma:2b", "prompt": "Hello!", "stream": false}' | \
		python -m json.tool || echo "❌ Ollama not responding at localhost:11434"

# ============================================================================
# DOCKER COMMANDS
# ============================================================================

docker-build: ## Build all Docker containers
	@echo "🐳 Building Docker containers..."
	docker-compose build

docker-up: ## Start all services with Docker Compose
	@echo "🚀 Starting all services..."
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "📺 Frontend: http://localhost:3001"
	@echo "🔧 API: http://localhost:8000/docs"
	@echo "🧠 Ollama: http://localhost:11434"

docker-down: ## Stop all Docker services
	@echo "🛑 Stopping services..."
	docker-compose down

docker-logs: ## View Docker logs
	docker-compose logs -f

docker-restart: docker-down docker-up ## Restart all services

docker-clean: ## Remove all containers, volumes, and images
	@echo "🧹 Cleaning Docker resources..."
	docker-compose down -v --rmi all
	@echo "✅ Docker cleaned!"

# ============================================================================
# DEVELOPMENT
# ============================================================================

dev: ## Start development environment
	@echo "🔧 Starting development environment..."
	docker-compose up -d postgres redis ollama
	@echo "✅ Development services ready!"

run-script: ## Generate script (usage: make run-script)
	@echo "✍️  Generating episode script..."
	uv run python scripts/generate_script.py

run-video: ## Generate complete video
	@echo "🎬 Generating complete video..."
	uv run python scripts/fetch_news.py
	uv run python scripts/analyze_packages.py
	uv run python scripts/generate_script.py
	uv run python scripts/generate_audio.py
	uv run python scripts/generate_video.py
	@echo "✅ Video generation complete!"

# ============================================================================
# CODE QUALITY
# ============================================================================

lint: ## Run code linters
	@echo "🔍 Running linters..."
	uv run black --check scripts/
	uv run isort --check-only scripts/
	uv run flake8 scripts/
	@echo "✅ Linting complete!"

format: ## Format code with black and isort
	@echo "🎨 Formatting code..."
	uv run black scripts/
	uv run isort scripts/
	@echo "✅ Code formatted!"

type-check: ## Run type checking with mypy
	@echo "🔎 Type checking..."
	uv run mypy scripts/
	@echo "✅ Type checking complete!"

check: lint type-check ## Run all checks (lint + type)

# ============================================================================
# TESTING
# ============================================================================

test: ## Run all tests
	@echo "🧪 Running tests..."
	uv run pytest tests/ -v
	@echo "✅ Tests complete!"

test-cov: ## Run tests with coverage
	@echo "📊 Running tests with coverage..."
	uv run pytest tests/ --cov=scripts --cov-report=html --cov-report=term
	@echo "✅ Coverage report generated in htmlcov/"

# ============================================================================
# DATABASE
# ============================================================================

db-migrate: ## Run database migrations
	@echo "🗄️  Running migrations..."
	uv run alembic upgrade head
	@echo "✅ Migrations complete!"

db-reset: ## Reset database (WARNING: deletes all data)
	@echo "⚠️  Resetting database..."
	docker-compose down -v
	docker-compose up -d postgres
	sleep 3
	$(MAKE) db-migrate
	@echo "✅ Database reset complete!"

# ============================================================================
# GITHUB WORKFLOW SIMULATION
# ============================================================================

workflow-test: ## Test the GitHub Actions workflow locally
	@echo "🔄 Simulating GitHub Actions workflow..."
	@echo "1️⃣  Fetching news..."
	uv run python scripts/fetch_news.py
	@echo "2️⃣  Analyzing packages..."
	uv run python scripts/analyze_packages.py
	@echo "3️⃣  Generating script..."
	uv run python scripts/generate_script.py
	@echo "4️⃣  Generating audio..."
	uv run python scripts/generate_audio.py
	@echo "5️⃣  Generating video..."
	uv run python scripts/generate_video.py
	@echo "✅ Workflow test complete!"

# ============================================================================
# PRODUCTION
# ============================================================================

prod-build: ## Build for production
	@echo "🏗️  Building for production..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
	@echo "✅ Production build complete!"

prod-deploy: ## Deploy to production
	@echo "🚀 Deploying to production..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "✅ Production deployment complete!"

# ============================================================================
# CLEANUP
# ============================================================================

clean: ## Clean temporary files and caches
	@echo "🧹 Cleaning temporary files..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name ".coverage" -delete
	rm -rf htmlcov/
	rm -rf .coverage
	rm -rf output/*.tmp
	@echo "✅ Cleanup complete!"

clean-all: clean docker-clean ## Clean everything (files + Docker)
	@echo "✅ Full cleanup complete!"

# ============================================================================
# UTILITIES
# ============================================================================

logs: ## View application logs
	@echo "📋 Viewing logs..."
	tail -f logs/*.log 2>/dev/null || echo "No logs found"

shell: ## Open Python shell with project context
	uv run ipython

version: ## Show version info
	@echo "📺 TV.RUSLANMV.COM"
	@echo "Python: $$(python --version)"
	@echo "UV: $$(uv --version 2>/dev/null || echo 'Not installed')"
	@echo "Docker: $$(docker --version)"
	@echo "Ollama: $$(ollama --version 2>/dev/null || echo 'Not installed')"

# ============================================================================
# QUICK COMMANDS
# ============================================================================

quick-start: setup docker-up ## Quick start everything
	@echo "✅ Everything is ready!"
	@echo ""
	@echo "📺 Access your TV channel:"
	@echo "   Frontend: http://localhost:3001"
	@echo "   API: http://localhost:8000/docs"
	@echo "   Ollama: http://localhost:11434"
	@echo ""
	@echo "🎬 Generate your first video:"
	@echo "   make run-video"

.PHONY: install install-dev setup env-setup ollama-setup ollama-test \
        docker-build docker-up docker-down docker-logs docker-restart docker-clean \
        dev run-script run-video lint format type-check check \
        test test-cov db-migrate db-reset workflow-test \
        prod-build prod-deploy clean clean-all logs shell version quick-start
