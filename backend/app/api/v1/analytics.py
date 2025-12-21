from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def analytics_root():
    return {"status": "ok"}
