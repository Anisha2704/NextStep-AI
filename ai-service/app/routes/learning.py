from fastapi import APIRouter

router = APIRouter(prefix="/learning", tags=["learning"])


@router.get("/")
async def learning_placeholder():
    return {"message": "Learning path endpoints coming soon"}
