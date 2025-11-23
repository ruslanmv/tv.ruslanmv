"""
TV.RUSLANMV.COM - Content Generator
Multi-agent system for generating daily TV episodes using CrewAI and watsonx.ai
"""

import os
from datetime import datetime
from typing import List, Dict
from crewai import Agent, Task, Crew, Process
from langchain_ibm import WatsonxLLM
from langchain.tools import Tool
import requests
from bs4 import BeautifulSoup
import json

# watsonx.ai Configuration
WATSONX_API_KEY = os.getenv("WATSONX_API_KEY")
WATSONX_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID")
WATSONX_URL = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")

# Initialize watsonx.ai LLM
def get_watsonx_llm(model_id: str = "ibm/granite-13b-chat-v2"):
    """Initialize watsonx.ai language model"""
    return WatsonxLLM(
        model_id=model_id,
        url=WATSONX_URL,
        project_id=WATSONX_PROJECT_ID,
        apikey=WATSONX_API_KEY,
        params={
            "decoding_method": "greedy",
            "max_new_tokens": 2000,
            "temperature": 0.7,
            "top_p": 0.9,
        }
    )


# Custom Tools
class NewsScraperTool:
    """Tool for scraping AI news from various sources"""
    
    SOURCES = [
        "https://news.ycombinator.com/",
        "https://www.artificialintelligence-news.com/",
        "https://www.technologyreview.com/",
    ]
    
    def scrape_news(self, num_articles: int = 10) -> str:
        """Scrape latest AI news"""
        articles = []
        
        for source in self.SOURCES[:2]:  # Limit sources
            try:
                response = requests.get(source, timeout=10)
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Simple extraction (customize per source)
                headlines = soup.find_all(['h1', 'h2', 'h3'], limit=5)
                for headline in headlines:
                    text = headline.get_text().strip()
                    if len(text) > 20:
                        articles.append({
                            'title': text,
                            'source': source,
                            'date': datetime.now().isoformat()
                        })
            except Exception as e:
                print(f"Error scraping {source}: {e}")
        
        return json.dumps(articles[:num_articles], indent=2)


class PackageTrackerTool:
    """Tool for tracking trending Python packages"""
    
    def get_trending_packages(self, limit: int = 10) -> str:
        """Get trending packages from PyPI and GitHub"""
        try:
            # Using PyPI stats (simplified)
            # In production, use PyPI API + GitHub trending
            trending = [
                {
                    'name': 'langchain',
                    'description': 'Building applications with LLMs',
                    'stars': 75000,
                    'category': 'AI/ML'
                },
                {
                    'name': 'crewai',
                    'description': 'Multi-agent AI orchestration',
                    'stars': 12000,
                    'category': 'AI/ML'
                },
                {
                    'name': 'ollama',
                    'description': 'Run LLMs locally',
                    'stars': 60000,
                    'category': 'AI/ML'
                },
                # Add more packages dynamically
            ]
            
            return json.dumps(trending[:limit], indent=2)
        except Exception as e:
            return f"Error fetching packages: {e}"


class ResearchPaperTool:
    """Tool for finding latest AI research papers"""
    
    def get_recent_papers(self, topic: str = "artificial intelligence") -> str:
        """Get recent papers from arXiv"""
        try:
            # Simplified - use arXiv API in production
            papers = [
                {
                    'title': 'Advances in Large Language Models',
                    'authors': 'Smith et al.',
                    'date': '2025-01-15',
                    'abstract': 'This paper discusses recent advances...'
                }
            ]
            return json.dumps(papers, indent=2)
        except Exception as e:
            return f"Error fetching papers: {e}"


# Initialize Tools
news_scraper = NewsScraperTool()
package_tracker = PackageTrackerTool()
research_paper_tool = ResearchPaperTool()

news_tool = Tool(
    name="News Scraper",
    func=news_scraper.scrape_news,
    description="Scrapes latest AI and technology news from multiple sources"
)

package_tool = Tool(
    name="Package Tracker",
    func=package_tracker.get_trending_packages,
    description="Retrieves trending Python packages and AI tools"
)

research_tool = Tool(
    name="Research Paper Finder",
    func=research_paper_tool.get_recent_papers,
    description="Finds recent AI research papers from arXiv"
)


# Define Agents
def create_agents(llm):
    """Create specialized agents for episode generation"""
    
    # News Researcher Agent
    news_researcher = Agent(
        role="AI News Researcher",
        goal="Discover and analyze the most important AI and technology news of the day",
        backstory="""You are an expert AI journalist with deep knowledge of the tech industry.
        You have a knack for identifying groundbreaking stories and explaining complex topics
        in an engaging way. You follow all major AI labs, research institutions, and tech companies.""",
        tools=[news_tool, research_tool],
        llm=llm,
        verbose=True,
        allow_delegation=False
    )
    
    # Script Writer Agent
    script_writer = Agent(
        role="TV Script Writer",
        goal="Create engaging, informative TV scripts that appeal to both humans and AI",
        backstory="""You are a seasoned TV writer specializing in tech and science content.
        You know how to structure content for maximum engagement while maintaining accuracy.
        Your scripts are clear, concise, and perfect for a 10-minute format.""",
        llm=llm,
        verbose=True,
        allow_delegation=False
    )
    
    # Package Analyst Agent
    package_analyst = Agent(
        role="Open Source Package Analyst",
        goal="Identify and explain trending packages and tools that developers should know",
        backstory="""You are a developer advocate with expertise in Python ecosystem.
        You track GitHub trends, PyPI downloads, and community discussions to identify
        the most relevant tools. You explain technical concepts clearly.""",
        tools=[package_tool],
        llm=llm,
        verbose=True,
        allow_delegation=False
    )
    
    # Video Coordinator Agent
    video_coordinator = Agent(
        role="Episode Production Coordinator",
        goal="Coordinate all content into a cohesive 10-minute episode structure",
        backstory="""You are a TV producer who ensures all content fits together perfectly.
        You manage timing, transitions, and overall flow. You make sure each section
        is the right length and flows naturally into the next.""",
        llm=llm,
        verbose=True,
        allow_delegation=True
    )
    
    return news_researcher, script_writer, package_analyst, video_coordinator


# Define Tasks
def create_tasks(agents):
    """Create tasks for episode generation"""
    
    news_researcher, script_writer, package_analyst, video_coordinator = agents
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Task 1: Research News
    research_task = Task(
        description=f"""Research the most important AI and technology news for {today}.
        
        Focus on:
        1. Major AI model releases or updates
        2. Breakthrough research papers
        3. Significant company announcements
        4. Policy and regulation news
        5. Industry trends
        
        Gather at least 5 top stories and rank them by importance.
        Include source links and brief summaries.""",
        expected_output="Structured list of top 5 AI/tech news stories with summaries",
        agent=news_researcher
    )
    
    # Task 2: Analyze Packages
    package_task = Task(
        description=f"""Identify trending Python packages and AI tools for {today}.
        
        Focus on:
        1. Most starred/downloaded packages this week
        2. New releases with significant features
        3. Tools relevant to current AI trends
        
        Select ONE package as "Package of the Day" and explain why it matters.
        Provide installation instructions and a simple use case.""",
        expected_output="Package of the day with description, why it's trending, and usage example",
        agent=package_analyst
    )
    
    # Task 3: Write Script
    script_task = Task(
        description=f"""Write a complete TV script for episode {today}.
        
        Structure (10 minutes total):
        1. Opening (30 seconds) - Welcome and episode intro
        2. News Highlights (3 minutes) - Top 3 stories from research
        3. Tech Breakthroughs (2 minutes) - Latest developments
        4. Deep Dive (2.5 minutes) - Detailed look at one main story
        5. Research Papers (1 minute) - Notable papers
        6. Package of the Day (1 minute) - Featured package
        7. Closing (30 seconds) - Summary and outro
        
        Make it engaging, clear, and suitable for both human viewers and AI agents.
        Use natural language and include transitions between sections.""",
        expected_output="Complete TV script with all sections, timing notes, and transitions",
        agent=script_writer,
        context=[research_task, package_task]
    )
    
    # Task 4: Coordinate Production
    coordination_task = Task(
        description=f"""Review and finalize the episode for {today}.
        
        Ensure:
        1. Total runtime is exactly 10 minutes
        2. All sections flow naturally
        3. Content is accurate and engaging
        4. Timing marks are correct
        5. Transitions are smooth
        
        Output the final episode structure with:
        - Complete script
        - Section timestamps
        - Key talking points
        - Visual suggestions
        - Metadata for AI consumption""",
        expected_output="Final episode package with script, timing, and metadata in JSON format",
        agent=video_coordinator,
        context=[research_task, package_task, script_task]
    )
    
    return [research_task, package_task, script_task, coordination_task]


# Create and Run Crew
def generate_episode():
    """Generate a complete episode using the crew"""
    
    print("🎬 TV.RUSLANMV Episode Generator")
    print("=" * 50)
    print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d')}")
    print("🤖 Initializing watsonx.ai LLM...")
    
    # Initialize LLM
    llm = get_watsonx_llm()
    
    print("👥 Creating agent crew...")
    agents = create_agents(llm)
    
    print("📋 Setting up tasks...")
    tasks = create_tasks(agents)
    
    print("🚀 Starting episode generation...")
    print("=" * 50)
    
    # Create crew
    crew = Crew(
        agents=list(agents),
        tasks=tasks,
        process=Process.sequential,
        verbose=True
    )
    
    # Execute
    result = crew.kickoff()
    
    print("\n" + "=" * 50)
    print("✅ Episode generation complete!")
    print("=" * 50)
    
    return result


def save_episode(result, output_dir: str = "output"):
    """Save generated episode to files"""
    os.makedirs(output_dir, exist_ok=True)
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Save script
    script_path = os.path.join(output_dir, f"episode_{today}_script.txt")
    with open(script_path, 'w') as f:
        f.write(str(result))
    
    # Save metadata
    metadata = {
        'date': today,
        'episode_number': None,  # Set by database
        'generated_at': datetime.now().isoformat(),
        'status': 'generated'
    }
    
    metadata_path = os.path.join(output_dir, f"episode_{today}_metadata.json")
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"📝 Script saved to: {script_path}")
    print(f"📊 Metadata saved to: {metadata_path}")
    
    return script_path, metadata_path


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate TV.RUSLANMV episode")
    parser.add_argument("--output-dir", default="output", help="Output directory")
    parser.add_argument("--mode", choices=["once", "daemon"], default="once")
    
    args = parser.parse_args()
    
    if args.mode == "once":
        result = generate_episode()
        save_episode(result, args.output_dir)
    else:
        # Daemon mode - run daily
        print("🔄 Running in daemon mode (daily episodes)")
        # Add scheduling logic here
