from fastapi import APIRouter

router = APIRouter(prefix="/career", tags=["career"])


@router.get("/")
async def career_placeholder():
    return {"message": "Career recommendation endpoints coming soon"}
