"""
TV.RUSLANMV.COM - FastAPI Backend
Main application entry point
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
from datetime import datetime

# Import routers
from app.api.v1 import episodes, sections, packages, analytics
from app.core.config import settings
from app.core.database import engine, Base, get_db

# Version
VERSION = "2.0.0"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    print(f"🚀 Starting TV.RUSLANMV.COM v{VERSION}")
    print(f"   Environment: {settings.ENVIRONMENT}")
    print(f"   LLM: {settings.NEWS_LLM_MODEL}")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("   ✅ Database initialized")
    
    yield
    
    # Shutdown
    print("👋 Shutting down TV.RUSLANMV.COM")


# Initialize FastAPI app
app = FastAPI(
    title="TV.RUSLANMV.COM API",
    description="API for AI-powered TV news platform",
    version=VERSION,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": VERSION,
        "timestamp": datetime.now().isoformat(),
        "llm_provider": settings.NEWS_LLM_MODEL.split("/")[0] if "/" in settings.NEWS_LLM_MODEL else "unknown"
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "TV.RUSLANMV.COM API",
        "version": VERSION,
        "description": "The First TV Channel for AI Agents and Humans",
        "features": [
            "Daily AI/Tech news episodes",
            "MCP protocol support",
            "Multi-provider LLM (Ollama, watsonx.ai, OpenAI, Claude)",
            "Automated video generation",
            "Full-text search",
            "Analytics"
        ],
        "llm_provider": settings.NEWS_LLM_MODEL,
        "docs": "/docs",
        "health": "/health"
    }


# Include API routers
app.include_router(
    episodes.router,
    prefix="/api/v1/episodes",
    tags=["episodes"]
)

app.include_router(
    sections.router,
    prefix="/api/v1/sections",
    tags=["sections"]
)

app.include_router(
    packages.router,
    prefix="/api/v1/packages",
    tags=["packages"]
)

app.include_router(
    analytics.router,
    prefix="/api/v1/analytics",
    tags=["analytics"]
)


# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.now().isoformat()
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.ENVIRONMENT == "development" else "An error occurred",
            "timestamp": datetime.now().isoformat()
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development"
    )
