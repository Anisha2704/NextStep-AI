import logging
from fastapi import APIRouter, HTTPException, status
from app.services.gemini_service import generate_response

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["ai-test"])


@router.get("/test")
async def test_ai():
    """Simple test endpoint verifying FastAPI -> LangChain -> Google Gemini connectivity."""
    test_prompt = "Say hello and explain in one sentence that you are the AI assistant for NextStep AI."
    try:
        ai_message = await generate_response(test_prompt)
        return {
            "success": True,
            "message": ai_message,
        }
    except Exception as e:
        logger.error(f"Test endpoint execution failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "success": False,
                "message": "AI service is currently unavailable.",
            },
        )
