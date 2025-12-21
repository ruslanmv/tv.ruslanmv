from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/today")
def get_today_episode():
    return {
        "id": "demo-episode-001",
        "episode_number": 1,
        "title": "Building RAG Applications with IBM watsonx.ai",
        "description": "Demo episode from backend stub. Replace with real DB logic when ready.",
        "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "youtube_id": "dQw4w9WgXcQ",
        "duration": 1800,
        "published_at": datetime.utcnow().isoformat(),
        "sections": [
            {
                "id": "s1",
                "section_type": "intro",
                "title": "Intro + Goals",
                "start_time": 0,
                "end_time": 180,
                "order_index": 1
            },
            {
                "id": "s2",
                "section_type": "demo",
                "title": "RAG Pipeline Walkthrough",
                "start_time": 180,
                "end_time": 900,
                "order_index": 2
            },
            {
                "id": "s3",
                "section_type": "deployment",
                "title": "Deployment Patterns",
                "start_time": 900,
                "end_time": 1500,
                "order_index": 3
            }
        ]
    }
