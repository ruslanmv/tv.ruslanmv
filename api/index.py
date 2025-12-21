"""
FastAPI Vercel Entrypoint
This module exports the FastAPI app instance for Vercel deployment.
"""
import sys
from pathlib import Path

# Add backend to Python path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Import the FastAPI app
from app.main import app

# Export for Vercel
__all__ = ["app"]
