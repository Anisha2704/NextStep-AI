from fastapi import APIRouter

router = APIRouter(prefix="/resume", tags=["resume"])


@router.get("/")
async def resume_placeholder():
    return {"message": "Resume analysis endpoints coming soon"}
