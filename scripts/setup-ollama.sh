#!/bin/sh
# Setup script for Ollama - pulls required models

set -e

echo "=================================================="
echo "🤖 Ollama Model Setup for TV.RUSLANMV.COM"
echo "=================================================="

# Wait for Ollama server to be ready
echo "⏳ Waiting for Ollama server..."
until curl -s http://ollama:11434/api/tags > /dev/null 2>&1; do
    echo "   Waiting for Ollama..."
    sleep 2
done
echo "✅ Ollama server is ready!"

# Default model
DEFAULT_MODEL="${OLLAMA_MODEL:-gemma:2b}"

echo ""
echo "📥 Pulling default model: $DEFAULT_MODEL"
echo "--------------------------------------------------"
ollama pull $DEFAULT_MODEL

# Optional: Pull additional models
echo ""
echo "📥 Pulling additional recommended models..."
echo "--------------------------------------------------"

# Smaller, faster model for quick tasks
echo "Pulling gemma:2b (fast, small)..."
ollama pull gemma:2b || true

# Better quality model
echo "Pulling llama3.1:8b (better quality)..."
ollama pull llama3.1:8b || true

# Alternative model
echo "Pulling mistral:7b (alternative)..."
ollama pull mistral:7b || true

# List available models
echo ""
echo "📋 Available models:"
echo "--------------------------------------------------"
ollama list

echo ""
echo "=================================================="
echo "✅ Ollama setup complete!"
echo "=================================================="
echo ""
echo "Available models:"
echo "  - gemma:2b (fast, small - DEFAULT)"
echo "  - llama3.1:8b (better quality)"
echo "  - mistral:7b (alternative)"
echo ""
echo "To use a different model, set environment variable:"
echo "  NEWS_LLM_MODEL=ollama/llama3.1:8b"
echo ""
echo "To use watsonx.ai instead (better quality):"
echo "  NEWS_LLM_MODEL=watsonx/ibm/granite-13b-chat-v2"
echo "  WATSONX_APIKEY=your_api_key"
echo "  WATSONX_PROJECT_ID=your_project_id"
echo "=================================================="
