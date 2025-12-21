#!/usr/bin/env python3
"""
LLM Client for TV.RUSLANMV.COM
Supports Ollama (default), watsonx.ai (optional), OpenAI, and Anthropic
"""
import os
from crewai import LLM


def get_llm(force_provider: str = None):
    """
    Instantiate a CrewAI LLM that can talk to:
      - Local Ollama (DEFAULT - for CI and local runs)
      - IBM watsonx.ai (OPTIONAL - for better results)
      - OpenAI (gpt-4o, gpt-4o-mini, etc.)
      - Anthropic Claude
    
    Selection is controlled via:
      - force_provider parameter (if set)
      - NEWS_LLM_MODEL environment variable (preferred)
      - or LLM_MODEL environment variable
      - defaults to "ollama/gemma:2b"
    
    Examples:
      - "ollama/gemma:2b" (default, fast, local)
      - "ollama/llama3.1:8b" (better quality, local)
      - "ollama/mistral:7b" (alternative, local)
      - "watsonx/ibm/granite-13b-chat-v2" (optional, remote)
      - "watsonx/meta-llama/llama-3-1-70b-instruct" (best quality, remote)
      - "openai/gpt-4o-mini" (alternative, remote)
      - "anthropic/claude-3-5-sonnet-latest" (alternative, remote)
    
    Args:
        force_provider: Optional provider to force (e.g., "watsonx", "ollama")
    
    Returns:
        LLM: Configured CrewAI LLM instance
    """
    # Determine model based on force_provider or environment
    if force_provider == "watsonx":
        default_model = "watsonx/ibm/granite-13b-chat-v2"
    elif force_provider == "ollama":
        default_model = "ollama/gemma:2b"
    else:
        default_model = "ollama/gemma:2b"  # Default to Ollama
    
    model = (
        os.environ.get("NEWS_LLM_MODEL") 
        or os.environ.get("LLM_MODEL") 
        or default_model
    )
    
    temperature = float(os.environ.get("NEWS_LLM_TEMPERATURE", "0.7"))
    max_tokens = int(os.environ.get("NEWS_LLM_MAX_TOKENS", "2000"))
    
    kwargs = {
        "temperature": temperature,
    }
    
    # Local Ollama (DEFAULT - used in CI and local development)
    if model.startswith("ollama/"):
        base_url = (
            os.environ.get("OLLAMA_API_BASE") 
            or os.environ.get("OLLAMA_HOST") 
            or "http://127.0.0.1:11434"
        )
        kwargs["base_url"] = base_url
        print(f"🤖 Using Ollama model '{model}' at {base_url}")
        print(f"   Temperature: {temperature}")
        print(f"   💡 Tip: For better quality, set NEWS_LLM_MODEL=watsonx/ibm/granite-13b-chat-v2")
    
    # IBM watsonx.ai (OPTIONAL - for better results)
    elif model.startswith("watsonx/"):
        base_url = os.environ.get("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
        api_key = os.environ.get("WATSONX_APIKEY")
        project_id = os.environ.get("WATSONX_PROJECT_ID")
        
        if not api_key:
            raise ValueError(
                "WATSONX_APIKEY environment variable is required for watsonx.ai. "
                "Set NEWS_LLM_MODEL=ollama/gemma:2b to use local Ollama instead."
            )
        
        kwargs["base_url"] = base_url
        kwargs["api_key"] = api_key
        
        # Add watsonx-specific parameters
        if project_id:
            kwargs["project_id"] = project_id
        
        print(f"🤖 Using watsonx.ai model '{model}' at {base_url}")
        print(f"   Temperature: {temperature}")
        print(f"   Max tokens: {max_tokens}")
        print(f"   ✨ Using IBM watsonx.ai for enhanced quality")
    
    # OpenAI (alternative remote provider)
    elif model.startswith("openai/"):
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise ValueError(
                "OPENAI_API_KEY environment variable is required for OpenAI. "
                "Set NEWS_LLM_MODEL=ollama/gemma:2b to use local Ollama instead."
            )
        print(f"🤖 Using OpenAI model '{model}' via LiteLLM")
        print(f"   Temperature: {temperature}")
    
    # Anthropic Claude (alternative remote provider)
    elif model.startswith("anthropic/"):
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError(
                "ANTHROPIC_API_KEY environment variable is required for Anthropic. "
                "Set NEWS_LLM_MODEL=ollama/gemma:2b to use local Ollama instead."
            )
        print(f"🤖 Using Anthropic model '{model}' via LiteLLM")
        print(f"   Temperature: {temperature}")
    
    else:
        # Generic remote provider handled by LiteLLM via CrewAI
        print(f"🤖 Using remote provider model '{model}' via LiteLLM defaults")
        print(f"   Temperature: {temperature}")
    
    llm = LLM(
        model=model,
        **kwargs,
    )
    
    return llm


def get_model_name():
    """Get the current model name being used"""
    return (
        os.environ.get("NEWS_LLM_MODEL") 
        or os.environ.get("LLM_MODEL") 
        or "ollama/gemma:2b"
    )


def is_using_watsonx():
    """Check if we're using watsonx.ai"""
    return get_model_name().startswith("watsonx/")


def is_using_ollama():
    """Check if we're using Ollama"""
    return get_model_name().startswith("ollama/")


# Singleton instance to import in other scripts
llm = get_llm()


if __name__ == "__main__":
    """Test the LLM configuration"""
    print("=" * 60)
    print("Testing LLM Configuration")
    print("=" * 60)
    
    # Test default (Ollama)
    print("\n1. Testing default (Ollama):")
    os.environ["NEWS_LLM_MODEL"] = "ollama/gemma:2b"
    test_llm = get_llm()
    print(f"   Model name: {get_model_name()}")
    print(f"   Using Ollama: {is_using_ollama()}")
    print(f"   Using watsonx: {is_using_watsonx()}")
    
    # Test watsonx (if credentials available)
    if os.environ.get("WATSONX_APIKEY"):
        print("\n2. Testing watsonx.ai:")
        test_llm_watson = get_llm(force_provider="watsonx")
        print(f"   Using watsonx: {is_using_watsonx()}")
    else:
        print("\n2. Skipping watsonx test (no API key)")
    
    print("\n" + "=" * 60)
    print("✅ LLM Configuration Test Complete")
    print("=" * 60)
