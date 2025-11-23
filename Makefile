# Makefile - Professional local setup for TV.RUSLANMV
# - Uses uv + pyproject.toml
# - Manages a logical ".venv" environment (via uv)
# - Adds helpers for backend, video pipeline, Jupyter, Ollama and Node frontend

# =============================================================================
#  Configuration & Cross-Platform Setup
# =============================================================================

.DEFAULT_GOAL := uv-install

# --- User-Configurable Variables ---
PYTHON ?= python3.11
VENV   ?= .venv

FRONTEND_DIR ?= frontend
NODE ?= node
NPM  ?= npm

# --- OS Detection for Paths and Commands ---
ifeq ($(OS),Windows_NT)
IS_WINDOWS      := 1
PYTHON          := py -3.11
PY_SUFFIX       := .exe
BIN_DIR         := Scripts
ACTIVATE        := $(VENV)\$(BIN_DIR)\activate
NULL_DEVICE     := $$null
RM              := Remove-Item -Force -ErrorAction SilentlyContinue
RMDIR           := Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
SHELL           := powershell.exe
.SHELLFLAGS     := -NoProfile -ExecutionPolicy Bypass -Command
ENVREF          := $$env:
MOUNT_SRC       := "$$PWD.Path"
else
IS_WINDOWS      := 0
PY_SUFFIX       :=
BIN_DIR         := bin
ACTIVATE        := . $(VENV)/$(BIN_DIR)/activate
NULL_DEVICE     := /dev/null
RM              := rm -f
RMDIR           := rm -rf
SHELL           := /bin/bash
.ONESHELL:
.SHELLFLAGS     := -eu -o pipefail -c
ENVREF          := $$
MOUNT_SRC       := "$$(pwd)"
endif

PY_EXE  := $(VENV)/$(BIN_DIR)/python$(PY_SUFFIX)
PIP_EXE := $(VENV)/$(BIN_DIR)/pip$(PY_SUFFIX)

DOCKER_IMAGE ?= tv-ruslanmv:latest
DOCKER_NAME  ?= tv-ruslanmv
DOCKER_PORT  ?= 8888
DOCKER_PORT_OLLAMA ?= 11434

.PHONY: help venv install pip-install dev uv-install update notebook \
        check-ollama install-ollama ensure-ollama-running pull-model ollama-test \
        run-backend run-backend-reload run-video run-pipeline \
        node-install node-build serve-frontend serve \
        build-container run-container stop-container remove-container logs \
        test lint fmt check python-version shell clean-venv clean distclean \
        check-python check-pyproject check-uv

# =============================================================================
#  Helper Scripts (exported env vars)
# =============================================================================

export HELP_SCRIPT
define HELP_SCRIPT
import re, sys, io
print('Usage: make <target> [OPTIONS...]\n')
print('Available targets:\n')
mf = '$(firstword $(MAKEFILE_LIST))'
with io.open(mf, 'r', encoding='utf-8', errors='ignore') as f:
    for line in f:
        m = re.match(r'^([a-zA-Z0-9_.-]+):.*?## (.*)$$', line)
        if m:
            target, help_text = m.groups()
            print('  {0:<24} {1}'.format(target, help_text))
endef

export CLEAN_SCRIPT
define CLEAN_SCRIPT
import glob, os, shutil, sys
patterns = ['*.pyc', '*.pyo', '*~', '*.egg-info', '__pycache__',
            'build', 'dist', '.mypy_cache', '.pytest_cache', '.ruff_cache']
to_remove = set()
for p in patterns:
    to_remove.update(glob.glob('**/' + p, recursive=True))
for path in sorted(to_remove, key=len, reverse=True):
    try:
        if os.path.isfile(path) or os.path.islink(path):
            os.remove(path)
        elif os.path.isdir(path):
            shutil.rmtree(path)
    except OSError as e:
        print('Error removing {0}: {1}'.format(path, e), file=sys.stderr)
endef

# =============================================================================
#  Core Targets
# =============================================================================

help: ## Show this help message
ifeq ($(IS_WINDOWS),1)
	@& $(PYTHON) -X utf8 -c "$(ENVREF)HELP_SCRIPT"
else
	@$(PYTHON) -X utf8 -c "$(ENVREF)HELP_SCRIPT"
endif

# =============================================================================
#  Python & uv
# =============================================================================

# Marker file to track if installation is up to date
INSTALL_STAMP := $(VENV)/.install.stamp

# venv target: ensures uv, Python, pyproject, and up-to-date dependencies
venv: check-uv check-python check-pyproject $(INSTALL_STAMP) ## Ensure Python env is ready (updates only if pyproject.toml changes)
	@echo "✅ Virtual environment is ready."

# If pyproject.toml is newer than the stamp, run uv sync and touch the stamp
$(INSTALL_STAMP): pyproject.toml
ifeq ($(IS_WINDOWS),1)
	@Write-Host "🔄 pyproject.toml changed. Syncing dependencies..."
	@$$uvCmd = Get-Command uv -ErrorAction SilentlyContinue; \
	$$env:UV_PROJECT_ENVIRONMENT = '$(VENV)'; \
	& $$uvCmd sync --python "$(PYTHON)"; \
	New-Item -ItemType File -Force "$(INSTALL_STAMP)" | Out-Null; \
	Write-Host "✅ Dependencies updated."
else
	@echo "🔄 pyproject.toml changed. Syncing dependencies..."
	@UV_PROJECT_ENVIRONMENT="$(VENV)" uv sync --python "$(PYTHON)"
	@mkdir -p "$(VENV)"
	@touch "$(INSTALL_STAMP)"
	@echo "✅ Dependencies updated."
endif

# Alias
uv-install: venv ## Sync dependencies using uv into the project environment

install: uv-install notebook node-install node-build install-ollama ensure-ollama-running ## Full install (Python deps, Jupyter, Node, Ollama)
	@echo "✅ Full install finished."

dev: uv-install ## Install project deps (dev bootstrap; dev extras can be added via uv)
	@echo "✅ Dev environment ready."

# Fallback for pip if uv fails or isn't desired (manual override)
pip-install: check-pyproject ## Install with pip into a traditional .venv
	@echo "⚠️ Using pip fallback install into $(VENV)..."
ifeq ($(IS_WINDOWS),1)
	@if (-not (Test-Path '$(VENV)')) { & $(PYTHON) -m venv '$(VENV)'; & '$(VENV)\Scripts\python.exe' -m pip install -U pip }
	@'$(VENV)\Scripts\pip.exe' install .
	@New-Item -ItemType File -Force "$(INSTALL_STAMP)" | Out-Null
else
	@[ -d "$(VENV)" ] || $(PYTHON) -m venv "$(VENV)"
	@"$(VENV)/bin/python" -m pip install -U pip
	@"$(VENV)/bin/pip" install .
	@mkdir -p "$(VENV)"
	@touch "$(INSTALL_STAMP)"
endif
	@echo "✅ Installed project into $(VENV) using pip"

# Force dependency refresh
update: check-pyproject ## Force uv to resync dependencies
ifeq ($(IS_WINDOWS),1)
	@Write-Host "🔄 Forcing dependency update..."
	@Remove-Item -Force "$(INSTALL_STAMP)" -ErrorAction SilentlyContinue
	@make venv
else
	@echo "🔄 Forcing dependency update..."
	@rm -f "$(INSTALL_STAMP)"
	@make venv
endif

# --- Jupyter kernel (via uv run) --------------------------------------------

notebook: venv ## Register a Jupyter kernel for tv-ruslanmv
	@echo "📚 Ensuring Jupyter kernel is registered..."
ifeq ($(IS_WINDOWS),1)
	@$$env:UV_PROJECT_ENVIRONMENT = '$(VENV)'; \
	uv run python -m ipykernel install --user --name "tv-ruslanmv" --display-name "Python 3.11 (tv-ruslanmv)" > $$null 2>&1
else
	@UV_PROJECT_ENVIRONMENT="$(VENV)" uv run python -m ipykernel install --user --name "tv-ruslanmv" --display-name "Python 3.11 (tv-ruslanmv)" > /dev/null 2>&1 || true
endif
	@echo "✅ Jupyter kernel registered: Python 3.11 (tv-ruslanmv)"

# =============================================================================
#  Node.js / Frontend
# =============================================================================

node-install: ## Install Node.js dependencies in frontend/
	@echo "📦 Installing Node.js deps in $(FRONTEND_DIR)..."
	@if [ -d "$(FRONTEND_DIR)" ] && [ -f "$(FRONTEND_DIR)/package.json" ]; then \
		cd "$(FRONTEND_DIR)" && $(NPM) install; \
	else \
		echo "ℹ️ No $(FRONTEND_DIR)/package.json found, skipping npm install."; \
	fi

node-build: ## Build frontend (npm run build)
	@echo "🏗  Building frontend in $(FRONTEND_DIR)..."
	@if [ -d "$(FRONTEND_DIR)" ] && [ -f "$(FRONTEND_DIR)/package.json" ]; then \
		cd "$(FRONTEND_DIR)" && $(NPM) run build; \
	else \
		echo "ℹ️ No $(FRONTEND_DIR)/package.json found, skipping npm build."; \
	fi

ifeq ($(IS_WINDOWS),1)
serve-frontend: node-install ## Run Next.js dev server for TV.RuslanMV (frontend)
	@Write-Host "🌐 Starting TV.RuslanMV frontend at http://localhost:3000 ..."
	@if (Test-Path "$(FRONTEND_DIR)\package.json") { \
		Set-Location "$(FRONTEND_DIR)"; \
		$$env:NEXT_PUBLIC_API_URL = 'http://127.0.0.1:8000'; \
		$$env:NEXT_TELEMETRY_DISABLED = '1'; \
		$(NPM) run dev; \
	} else { \
		Write-Host "❌ $(FRONTEND_DIR)\package.json not found."; \
		exit 1; \
	}
else
serve-frontend: node-install ## Run Next.js dev server for TV.RuslanMV (frontend)
	@echo "🌐 Starting TV.RuslanMV frontend at http://localhost:3000 ..."
	@if [ -d "$(FRONTEND_DIR)" ] && [ -f "$(FRONTEND_DIR)/package.json" ]; then \
		cd "$(FRONTEND_DIR)" && \
		NEXT_PUBLIC_API_URL="http://127.0.0.1:8000" \
		NEXT_TELEMETRY_DISABLED=1 \
		$(NPM) run dev; \
	else \
		echo "❌ frontend directory or package.json missing."; \
		exit 1; \
	fi
endif

serve: serve-frontend ## Alias: start frontend dev server (Next.js)

# =============================================================================
#  Ollama (host)
# =============================================================================

check-ollama: ## Check whether 'ollama' is available on host
	@echo "🔎 Checking for Ollama on host..."
ifeq ($(IS_WINDOWS),1)
	@if (Get-Command ollama -ErrorAction SilentlyContinue) { echo '✅ Ollama is installed.' } else { echo 'ℹ️ Ollama not found.'; exit 1 }
else
	@command -v ollama >/dev/null 2>&1 && echo "✅ Ollama is installed." || (echo "ℹ️ Ollama not found." && exit 1)
endif

install-ollama: ## Try to install Ollama on host (best-effort)
ifeq ($(IS_WINDOWS),1)
	@if (Get-Command ollama -ErrorAction SilentlyContinue) { \
		echo '✅ Ollama already installed.' \
	} else { \
		echo '⬇️ Installing Ollama via winget (requires Windows 10/11)...'; \
		winget install -e --id Ollama.Ollama || echo '⚠️ winget install failed; try the GUI installer from https://ollama.com/download'; \
	}
else
	@if command -v ollama >/dev/null 2>&1; then \
		echo "✅ Ollama already installed."; \
	elif [ "$$(uname -s)" = "Darwin" ]; then \
		echo "⬇️ Installing Ollama via Homebrew..."; \
		(brew update && brew install --cask ollama) || echo "⚠️ brew install failed; download from https://ollama.com/download"; \
	else \
		echo "⬇️ Installing Ollama via official script..."; \
		curl -fsSL https://ollama.com/install.sh | sh || echo "⚠️ install.sh failed; see https://ollama.com/download"; \
	fi
endif

ensure-ollama-running: ## Start Ollama server and check 127.0.0.1:11434
ifeq ($(IS_WINDOWS),1)
	@if (Get-Command ollama -ErrorAction SilentlyContinue) { \
		Write-Host '▶️  Starting Ollama server (background)...'; \
		Start-Process -FilePath ollama -ArgumentList 'serve' -WindowStyle Hidden; \
		$ok=$false; for($i=0; $i -lt 60; $i++){ try { iwr http://127.0.0.1:11434/api/tags -UseBasicParsing | Out-Null; $ok=$true; break } catch { Start-Sleep -Milliseconds 500 } }; \
		if($ok){ echo '✅ Ollama server is up: http://127.0.0.1:11434'; } else { echo '⚠️ Could not reach Ollama on 11434. Start it manually or check firewall.'; } \
	} else { echo '⚠️ Ollama not installed'; exit 1 }
else
	@command -v ollama >/dev/null 2>&1 || { echo "⚠️ Ollama not installed"; exit 1; }
	@echo "▶️  Starting Ollama server (background, best-effort)..."
	@pkill -f "ollama serve" >/dev/null 2>&1 || true
	@nohup ollama serve >/tmp/ollama.log 2>&1 &
	@ok=0; for i in $$(seq 1 60); do curl -fsS http://127.0.0.1:11434/api/tags >/dev/null && ok=1 && break || sleep 0.5; done; \
	if [ "$$ok" = "1" ]; then echo "✅ Ollama server is up: http://127.0.0.1:11434"; else echo "⚠️ Could not reach Ollama on 11434. Start it manually or check firewall."; fi
endif

pull-model: ## Pull a small model for tests
	@echo "📥 Pulling qwen2.5:0.5b-instruct..."
	@ollama pull qwen2.5:0.5b-instruct || echo "⚠️ Could not pull model. Is Ollama running?"

ollama-test: venv ## Quick python chat against local Ollama
	@echo "💬 Running a quick chat against http://localhost:11434 ..."
ifeq ($(IS_WINDOWS),1)
	@$$env:UV_PROJECT_ENVIRONMENT = '$(VENV)'; \
	uv run python - <<'PY'\
import sys\
try:\
    import ollama\
except Exception:\
    print('Missing python client: install \"ollama\" in your project deps'); sys.exit(1)\
try:\
    r = ollama.chat(model='qwen2.5:0.5b-instruct', messages=[{'role':'user','content':'Say only: Hello from TV.RuslanMV!'}])\
    print(r['message']['content'])\
except Exception as e:\
    print('⚠️ Chat failed:', e)\
PY
else
	@UV_PROJECT_ENVIRONMENT="$(VENV)" uv run python - <<'PY'\
import sys\
try:\
    import ollama\
except Exception:\
    print('Missing python client: install \"ollama\" in your project deps'); sys.exit(1)\
try:\
    r = ollama.chat(model='qwen2.5:0.5b-instruct', messages=[{'role':'user','content':'Say only: Hello from TV.RuslanMV!'}])\
    print(r['message']['content'])\
except Exception as e:\
    print('⚠️ Chat failed:', e)\
PY
endif

# =============================================================================
#  TV.RUSLANMV-specific helpers
# =============================================================================

run-backend: venv ## Run FastAPI backend (uvicorn)
ifeq ($(IS_WINDOWS),1)
	@Write-Host "🚀 Starting backend on http://127.0.0.1:8000 ..."
	@$$env:UV_PROJECT_ENVIRONMENT = '$(VENV)'; \
	uv run python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
else
	@echo "🚀 Starting backend on http://127.0.0.1:8000 ..."
	@UV_PROJECT_ENVIRONMENT="$(VENV)" uv run python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
endif

run-backend-reload: run-backend ## Alias for run-backend

run-video: venv ## Run video generation pipeline (script -> audio -> video) locally
ifeq ($(IS_WINDOWS),1)
	@Write-Host "📰 Generating script..."
	@$$env:UV_PROJECT_ENVIRONMENT = '$(VENV)'; uv run python scripts/generate_script.py
	@Write-Host "🎤 Generating audio..."
	@$$env:UV_PROJECT_ENVIRONMENT = '$(VENV)'; uv run python scripts/generate_audio.py
	@Write-Host "🎬 Generating video..."
	@$$env:UV_PROJECT_ENVIRONMENT = '$(VENV)'; uv run python scripts/generate_video.py
else
	@echo "📰 Generating script..."
	@UV_PROJECT_ENVIRONMENT="$(VENV)" uv run python scripts/generate_script.py
	@echo "🎤 Generating audio..."
	@UV_PROJECT_ENVIRONMENT="$(VENV)" uv run python scripts/generate_audio.py
	@echo "🎬 Generating video..."
	@UV_PROJECT_ENVIRONMENT="$(VENV)" uv run python scripts/generate_video.py
endif

run-pipeline: venv ensure-ollama-running ## Full pipeline using local Ollama + scripts
ifeq ($(IS_WINDOWS),1)
	@Write-Host "🛰  Running full TV.RUSLANMV pipeline (with Ollama)..."
	@$$env:UV_PROJECT_ENVIRONMENT = '$(VENV)'; \
	$$env:OLLAMA_HOST = 'http://127.0.0.1:11434'; \
	uv run python scripts/generate_script.py
	@$$env:UV_PROJECT_ENVIRONMENT = '$(VENV)'; uv run python scripts/generate_audio.py
	@$$env:UV_PROJECT_ENVIRONMENT = '$(VENV)'; uv run python scripts/generate_video.py
	@Write-Host "✅ Pipeline completed. Check the 'output/' directory."
else
	@echo "🛰  Running full TV.RUSLANMV pipeline (with Ollama)..."
	@UV_PROJECT_ENVIRONMENT="$(VENV)" OLLAMA_HOST="http://127.0.0.1:11434" uv run python scripts/generate_script.py
	@UV_PROJECT_ENVIRONMENT="$(VENV)" uv run python scripts/generate_audio.py
	@UV_PROJECT_ENVIRONMENT="$(VENV)" uv run python scripts/generate_video.py
	@echo "✅ Pipeline completed. Check the 'output/' directory."
endif

# =============================================================================
#  Docker helpers (optional)
# =============================================================================

build-container: check-pyproject ## Build Docker image
	@echo "Building image '$(DOCKER_IMAGE)'..."
	@docker build -t $(DOCKER_IMAGE) .

run-container: ## Run or restart container (Jupyter:8888, Ollama:11434)
ifeq ($(IS_WINDOWS),1)
	@docker run -d --name $(DOCKER_NAME) -p $(DOCKER_PORT):8888 -p $(DOCKER_PORT_OLLAMA):11434 -v $(MOUNT_SRC):/workspace $(DOCKER_IMAGE) > $(NULL_DEVICE) 2> $(NULL_DEVICE) || docker start $(DOCKER_NAME) > $(NULL_DEVICE) 2> $(NULL_DEVICE)
else
	@docker run -d --name $(DOCKER_NAME) -p $(DOCKER_PORT):8888 -p $(DOCKER_PORT_OLLAMA):11434 -v $(MOUNT_SRC):/workspace $(DOCKER_IMAGE) > $(NULL_DEVICE) 2>&1 || docker start $(DOCKER_NAME) > $(NULL_DEVICE) 2>&1
endif
	@echo "Container is up: http://localhost:$(DOCKER_PORT)  (Ollama API: http://localhost:$(DOCKER_PORT_OLLAMA))"

stop-container: ## Stop running container
	@docker stop $(DOCKER_NAME) >$(NULL_DEVICE) 2>&1 || echo "Info: container was not running."

remove-container: ## Stop and remove container
	@docker stop $(DOCKER_NAME) >$(NULL_DEVICE) 2>&1 || true
	@docker rm $(DOCKER_NAME) >$(NULL_DEVICE) 2>&1 || echo "Info: container did not exist."

logs: ## Follow Docker container logs
	@docker logs -f $(DOCKER_NAME)

# =============================================================================
#  Dev & QA
# =============================================================================

test: venv ## Run tests with pytest (via uv)
	@echo "🧪 Running tests..."
ifeq ($(IS_WINDOWS),1)
	@$$env:UV_PROJECT_ENVIRONMENT = '$(VENV)'; \
	uv run python -m pytest || echo "⚠️ No tests found or pytest not installed."
else
	@UV_PROJECT_ENVIRONMENT="$(VENV)" uv run python -m pytest || echo "⚠️ No tests found or pytest not installed."
endif

lint: venv ## Lint with ruff (via uv)
	@echo "🔍 Linting with ruff..."
ifeq ($(IS_WINDOWS),1)
	@$$env:UV_PROJECT_ENVIRONMENT = '$(VENV)'; uv run ruff check . || true
else
	@UV_PROJECT_ENVIRONMENT="$(VENV)" uv run ruff check . || true
endif

fmt: venv ## Format with ruff (via uv)
	@echo "🎨 Formatting with ruff..."
ifeq ($(IS_WINDOWS),1)
	@$$env:UV_PROJECT_ENVIRONMENT = '$(VENV)'; uv run ruff format . || true
else
	@UV_PROJECT_ENVIRONMENT="$(VENV)" uv run ruff format . || true
endif

check: lint test ## Run lint + tests

python-version: check-python ## Show Python used
ifeq ($(IS_WINDOWS),1)
	@echo "Using: $(PYTHON)"
	@& $(PYTHON) -V
else
	@echo "Using: $(PYTHON)"
	@$(PYTHON) -V
endif

shell: venv ## Show how to work with the environment
	@echo "Environment is managed by uv."
	@echo "Run commands like:"
	@echo "  UV_PROJECT_ENVIRONMENT=$(VENV) uv run python"
	@echo "  UV_PROJECT_ENVIRONMENT=$(VENV) uv run python scripts/generate_script.py"

clean-venv: ## Remove the virtual env directory (and stamp)
ifeq ($(IS_WINDOWS),1)
	@& $$env:ComSpec /c "taskkill /F /IM python.exe >NUL 2>&1 || exit 0"
	@Start-Sleep -Milliseconds 300
	@if (Test-Path '$(VENV)'){ Remove-Item -Recurse -Force '$(VENV)' }
else
	@rm -rf "$(VENV)"
endif

clean: ## Remove caches, build artifacts, and env metadata
	@echo "Cleaning project..."
	-$(RMDIR) $(VENV)
	-$(RMDIR) .pytest_cache
	-$(RMDIR) .ruff_cache
ifeq ($(IS_WINDOWS),1)
	@& $(PYTHON) -c "$(ENVREF)CLEAN_SCRIPT"
else
	@$(PYTHON) -c "$(ENVREF)CLEAN_SCRIPT"
endif
	@echo "Clean complete."

distclean: clean ## Alias for clean

# =============================================================================
#  Internal helper checks
# =============================================================================

check-python:
	@echo "Checking for a Python 3.11 interpreter..."
ifeq ($(IS_WINDOWS),1)
	@& $(PYTHON) -c "import sys; sys.exit(0 if sys.version_info[:2]==(3,11) else 1)" 2>$(NULL_DEVICE); if ($$LASTEXITCODE -ne 0) { echo "Error: '$(PYTHON)' is not Python 3.11."; echo "Please install Python 3.11 and add it to your PATH, or override with: make install PYTHON='py -3.11'"; exit 1; }
	@& $(PYTHON) -V
else
	@$(PYTHON) -c "import sys; sys.exit(0 if sys.version_info[:2]==(3,11) else 1)" 2>$(NULL_DEVICE) || ( \
		echo "Error: '$(PYTHON)' is not Python 3.11."; \
		echo "Please install Python 3.11 and add it to your PATH, or override with: make install PYTHON=python3.11"; \
		exit 1; \
	)
	@$(PYTHON) -V
endif

check-pyproject:
ifeq ($(IS_WINDOWS),1)
	@if (Test-Path -LiteralPath 'pyproject.toml') { echo 'Found pyproject.toml' } else { echo ('Error: pyproject.toml not found in ' + (Get-Location)); exit 1 }
else
	@[ -f pyproject.toml ] || { echo "Error: pyproject.toml not found in $$(pwd)"; exit 1; }
	@echo "Found pyproject.toml"
endif

check-uv: ## Check for uv and install if missing
	@echo "Checking for uv..."
ifeq ($(IS_WINDOWS),1)
	@$$cmd = Get-Command uv -ErrorAction SilentlyContinue; \
	if (-not $$cmd) { \
		echo 'Info: ''uv'' not found. Attempting to install it now...'; \
		iwr https://astral.sh/uv/install.ps1 -UseBasicParsing | iex; \
		$$localBin = Join-Path $$env:USERPROFILE '.local\bin'; \
		if (Test-Path $$localBin) { $$env:Path = "$$localBin;$$env:Path" }; \
	}
	@$$cmd = Get-Command uv -ErrorAction SilentlyContinue; \
	if (-not $$cmd) { \
		$$candidate = Join-Path $$env:USERPROFILE '.local\bin\uv.exe'; \
		if (Test-Path $$candidate) { echo ('Using ' + $$candidate); $$env:Path = (Split-Path $$candidate) + ';' + $$env:Path } \
		else { echo 'Error: ''uv'' is still not available after installation.'; exit 1 } \
	}
	@echo "✅ uv is available."
else
	@command -v uv >$(NULL_DEVICE) 2>&1 || { \
		echo "Info: 'uv' not found. Attempting to install it now..."; \
		curl -LsSf https://astral.sh/uv/install.sh | sh; \
	}
	@command -v uv >$(NULL_DEVICE) 2>&1 || { \
		echo "Error: 'uv' is still not available after installation."; \
		exit 1; \
	}
	@echo "✅ uv is available."
endif
