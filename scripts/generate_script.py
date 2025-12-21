#!/usr/bin/env python3
"""
Generate TV Episode Script using CrewAI and LLM (Ollama or watsonx.ai)
"""
import os
import sys
import json
from datetime import datetime
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent))

from llm_client import get_llm, get_model_name, is_using_watsonx
from crewai import Agent, Task, Crew, Process


# Output directories
OUTPUT_DIR = Path("output")
DATA_DIR = Path("data")
OUTPUT_DIR.mkdir(exist_ok=True)


def load_news_data():
    """Load fetched news data"""
    news_file = DATA_DIR / "latest_news.json"
    if news_file.exists():
        with open(news_file) as f:
            return json.load(f)
    return {"articles": []}


def load_package_data():
    """Load trending package data"""
    package_file = DATA_DIR / "trending_packages.json"
    if package_file.exists():
        with open(package_file) as f:
            return json.load(f)
    return {"packages": []}


def create_agents(llm):
    """Create specialized agents for episode generation"""
    
    # News Researcher Agent
    news_researcher = Agent(
        role="AI News Researcher",
        goal="Analyze and rank the most important AI/tech news stories",
        backstory="""You are an expert AI journalist with deep knowledge of artificial intelligence,
        machine learning, and technology trends. You have a knack for identifying groundbreaking stories
        and understanding their impact on the industry.""",
        llm=llm,
        verbose=True,
        allow_delegation=False
    )
    
    # Script Writer Agent
    script_writer = Agent(
        role="TV Script Writer",
        goal="Create engaging, informative TV scripts optimized for both humans and AI",
        backstory="""You are a seasoned TV writer specializing in tech content. You know how to
        structure content for maximum engagement in a 10-minute format. Your scripts are clear,
        concise, and perfect for video narration.""",
        llm=llm,
        verbose=True,
        allow_delegation=False
    )
    
    # Package Analyst Agent
    package_analyst = Agent(
        role="Developer Tools Analyst",
        goal="Identify and explain trending packages that developers should know about",
        backstory="""You are a developer advocate with expertise in the Python and AI/ML ecosystem.
        You track trends and can explain technical concepts clearly to a broad audience.""",
        llm=llm,
        verbose=True,
        allow_delegation=False
    )
    
    return news_researcher, script_writer, package_analyst


def create_tasks(agents, news_data, package_data):
    """Create tasks for episode generation"""
    
    news_researcher, script_writer, package_analyst = agents
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Convert data to string format for agents
    news_summary = "\n".join([
        f"- {article['title']}: {article.get('summary', article.get('description', ''))}"
        for article in news_data.get('articles', [])[:10]
    ])
    
    package_summary = "\n".join([
        f"- {pkg['name']}: {pkg.get('description', '')}"
        for pkg in package_data.get('packages', [])[:10]
    ])
    
    # Task 1: Analyze News
    analyze_task = Task(
        description=f"""Analyze today's AI/tech news and select the TOP 3 most important stories.
        
        Available news stories:
        {news_summary}
        
        Your task:
        1. Rank stories by importance and impact
        2. Select the TOP 3 stories
        3. For each story, write a 2-3 sentence summary
        4. Explain why each story matters
        
        Format your response as:
        STORY 1: [Title]
        Summary: [2-3 sentences]
        Why it matters: [1-2 sentences]
        
        STORY 2: [Title]
        ...
        """,
        expected_output="Top 3 AI/tech news stories with summaries and importance",
        agent=news_researcher
    )
    
    # Task 2: Analyze Package
    package_task = Task(
        description=f"""Select ONE "Package of the Day" from trending tools.
        
        Trending packages:
        {package_summary}
        
        Your task:
        1. Choose the most interesting/useful package
        2. Explain what it does in simple terms
        3. Show a basic usage example
        4. Explain why it's trending
        
        Format:
        PACKAGE: [Name]
        What it does: [2-3 sentences]
        Usage example: [Simple code or command]
        Why it's trending: [1-2 sentences]
        """,
        expected_output="Package of the day with description and usage",
        agent=package_analyst
    )
    
    # Task 3: Write Complete Script
    script_task = Task(
        description=f"""Write a complete 10-minute TV script for episode {today}.
        
        Structure (with timing):
        1. OPENING (30 seconds)
           - Welcome message
           - Today's date
           - Brief overview of topics
        
        2. NEWS HIGHLIGHTS (3 minutes)
           - Cover the TOP 3 stories from the news researcher
           - Keep each story to ~1 minute
        
        3. TECH DEEP DIVE (2.5 minutes)
           - Expand on the most interesting story
           - Add context and implications
        
        4. PACKAGE OF THE DAY (1 minute)
           - Present the featured package
           - Show why developers should care
        
        5. QUICK TAKES (2 minutes)
           - 3-4 additional brief news items
           - 30 seconds each
        
        6. CLOSING (1 minute)
           - Recap main points
           - Call to action (subscribe, visit website)
           - Outro
        
        Guidelines:
        - Write for spoken delivery (natural, conversational)
        - Use short sentences and paragraphs
        - Include timing markers [MM:SS]
        - Add [PAUSE] for dramatic effect where appropriate
        - Keep technical terms but explain them simply
        - Make it engaging for both humans and AI
        
        The script should be ready for text-to-speech conversion.
        """,
        expected_output="Complete TV script with timing markers and clear structure",
        agent=script_writer,
        context=[analyze_task, package_task]
    )
    
    return [analyze_task, package_task, script_task]


def generate_script():
    """Generate episode script using CrewAI"""
    
    print("=" * 70)
    print("📺 TV.RUSLANMV.COM - Episode Script Generation")
    print("=" * 70)
    print(f"🗓️  Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🤖 LLM: {get_model_name()}")
    
    if is_using_watsonx():
        print("   ✨ Using IBM watsonx.ai for enhanced quality")
    else:
        print("   💡 Using Ollama (local). For better quality, set NEWS_LLM_MODEL=watsonx/...")
    
    print("=" * 70)
    
    # Load data
    print("\n📰 Loading news data...")
    news_data = load_news_data()
    print(f"   Found {len(news_data.get('articles', []))} news articles")
    
    print("\n📦 Loading package data...")
    package_data = load_package_data()
    print(f"   Found {len(package_data.get('packages', []))} trending packages")
    
    # Initialize LLM
    print("\n🤖 Initializing LLM...")
    llm = get_llm()
    print("   ✅ LLM ready")
    
    # Create agents
    print("\n👥 Creating AI agents...")
    agents = create_agents(llm)
    print("   ✅ Agents created: News Researcher, Script Writer, Package Analyst")
    
    # Create tasks
    print("\n📋 Setting up tasks...")
    tasks = create_tasks(agents, news_data, package_data)
    print("   ✅ Tasks created")
    
    # Create and run crew
    print("\n🚀 Starting episode generation...")
    print("-" * 70)
    
    crew = Crew(
        agents=list(agents),
        tasks=tasks,
        process=Process.sequential,
        verbose=True
    )
    
    result = crew.kickoff()
    
    print("-" * 70)
    print("\n✅ Episode generation complete!")
    
    # Save script
    script_file = OUTPUT_DIR / "episode_script.txt"
    with open(script_file, 'w') as f:
        f.write(str(result))
    
    print(f"\n💾 Script saved to: {script_file}")
    print(f"   Length: {len(str(result))} characters")
    print(f"   Lines: {str(result).count(chr(10))} lines")
    
    # Save metadata
    metadata = {
        "date": datetime.now().isoformat(),
        "llm_model": get_model_name(),
        "news_count": len(news_data.get('articles', [])),
        "package_count": len(package_data.get('packages', [])),
        "script_length": len(str(result)),
        "generated_by": "CrewAI + " + ("watsonx.ai" if is_using_watsonx() else "Ollama")
    }
    
    metadata_file = OUTPUT_DIR / "episode_metadata.json"
    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"📊 Metadata saved to: {metadata_file}")
    
    # Preview
    print("\n" + "=" * 70)
    print("📝 SCRIPT PREVIEW (first 500 characters)")
    print("=" * 70)
    print(str(result)[:500] + "...")
    print("=" * 70)
    
    return str(result)


if __name__ == "__main__":
    try:
        script = generate_script()
        print("\n✅ SUCCESS: Episode script generated!")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
