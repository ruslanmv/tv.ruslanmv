#!/usr/bin/env python3
"""
Analyze trending Python packages and AI tools
"""
import os
import json
import sys
from datetime import datetime
from pathlib import Path
import requests

# Output directories
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)


def fetch_pypi_stats():
    """Fetch trending packages from PyPI"""
    print("📦 Fetching trending packages from PyPI...")
    
    # Popular AI/ML packages to track
    packages = [
        "langchain",
        "crewai",
        "ollama",
        "transformers",
        "torch",
        "tensorflow",
        "scikit-learn",
        "pandas",
        "numpy",
        "matplotlib",
        "openai",
        "anthropic",
        "gradio",
        "streamlit",
        "fastapi",
        "pydantic",
        "sqlalchemy",
        "pytest",
        "black",
        "ruff"
    ]
    
    package_data = []
    
    for pkg_name in packages:
        try:
            # Get package info from PyPI API
            response = requests.get(
                f"https://pypi.org/pypi/{pkg_name}/json",
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                info = data.get('info', {})
                
                package_data.append({
                    'name': pkg_name,
                    'version': info.get('version', ''),
                    'description': info.get('summary', ''),
                    'author': info.get('author', ''),
                    'home_page': info.get('home_page', ''),
                    'project_urls': info.get('project_urls', {}),
                    'requires_python': info.get('requires_python', ''),
                    'license': info.get('license', ''),
                })
                print(f"   ✅ {pkg_name}")
            
        except Exception as e:
            print(f"   ❌ Error fetching {pkg_name}: {e}")
            continue
    
    print(f"\n   Found {len(package_data)} packages")
    return package_data


def fetch_github_trending():
    """Fetch trending repositories from GitHub"""
    print("\n🌟 Fetching trending AI repos from GitHub...")
    
    try:
        # GitHub trending AI repositories
        # Note: GitHub doesn't have official trending API, using search instead
        response = requests.get(
            "https://api.github.com/search/repositories?q=topic:artificial-intelligence+topic:machine-learning+stars:>1000&sort=stars&order=desc&per_page=20",
            timeout=10
        )
        
        repos = []
        if response.status_code == 200:
            data = response.json()
            
            for repo in data.get('items', [])[:10]:
                repos.append({
                    'name': repo['name'],
                    'full_name': repo['full_name'],
                    'description': repo.get('description', ''),
                    'stars': repo['stargazers_count'],
                    'url': repo['html_url'],
                    'language': repo.get('language', ''),
                    'topics': repo.get('topics', [])
                })
                print(f"   ✅ {repo['name']} ({repo['stargazers_count']} ⭐)")
        
        print(f"\n   Found {len(repos)} trending repos")
        return repos
        
    except Exception as e:
        print(f"   ❌ Error fetching GitHub trending: {e}")
        return []


def analyze_packages(pypi_packages, github_repos):
    """Analyze and rank packages"""
    print("\n📊 Analyzing packages...")
    
    # Combine data
    all_packages = []
    
    # Add PyPI packages
    for pkg in pypi_packages:
        score = 0
        
        # Check if it's in popular categories
        if any(term in pkg['description'].lower() for term in ['ai', 'ml', 'machine learning', 'deep learning']):
            score += 10
        
        all_packages.append({
            **pkg,
            'source': 'PyPI',
            'score': score,
            'category': 'AI/ML' if 'ai' in pkg['description'].lower() or 'ml' in pkg['description'].lower() else 'General'
        })
    
    # Add GitHub repos as packages
    for repo in github_repos:
        all_packages.append({
            'name': repo['name'],
            'description': repo['description'],
            'source': 'GitHub',
            'url': repo['url'],
            'stars': repo['stars'],
            'score': min(repo['stars'] // 1000, 100),  # Normalize stars to score
            'category': 'AI/ML',
            'language': repo['language']
        })
    
    # Sort by score
    all_packages = sorted(all_packages, key=lambda x: x.get('score', 0), reverse=True)
    
    print(f"   Analyzed {len(all_packages)} packages")
    
    return all_packages


def select_package_of_day(packages):
    """Select the most interesting package for today"""
    print("\n🎯 Selecting Package of the Day...")
    
    # For demo, select based on day of month (deterministic but varies)
    day = datetime.now().day
    pkg_index = day % len(packages)
    
    package_of_day = packages[pkg_index]
    
    print(f"   📦 Package of the Day: {package_of_day['name']}")
    print(f"   📝 {package_of_day['description'][:100]}...")
    
    return package_of_day


def save_packages(all_packages, package_of_day):
    """Save package data to JSON"""
    output_file = DATA_DIR / "trending_packages.json"
    
    data = {
        'fetched_at': datetime.now().isoformat(),
        'count': len(all_packages),
        'package_of_day': package_of_day,
        'packages': all_packages[:50]  # Top 50
    }
    
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"\n💾 Packages saved to: {output_file}")
    
    # Print top 10
    print("\n📊 Top 10 Trending Packages:")
    print("-" * 70)
    for i, pkg in enumerate(all_packages[:10], 1):
        stars = f"({pkg['stars']} ⭐)" if 'stars' in pkg else ''
        print(f"{i}. {pkg['name']} {stars}")
        print(f"   {pkg['description'][:80]}...")
        print()


if __name__ == "__main__":
    try:
        print("=" * 70)
        print("📦 Package Trend Analysis")
        print("=" * 70)
        
        # Fetch data
        pypi_packages = fetch_pypi_stats()
        github_repos = fetch_github_trending()
        
        # Analyze
        all_packages = analyze_packages(pypi_packages, github_repos)
        
        # Select package of the day
        package_of_day = select_package_of_day(all_packages)
        
        # Save
        save_packages(all_packages, package_of_day)
        
        print("\n" + "=" * 70)
        print("✅ SUCCESS: Package analysis complete!")
        print("=" * 70)
        sys.exit(0)
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
