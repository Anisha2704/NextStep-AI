from fastapi import APIRouter

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("/")
async def skills_placeholder():
    return {"message": "Skill analysis endpoints coming soon"}
