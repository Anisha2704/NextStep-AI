import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse, UserProfilePayload, FullRecommendationResponse
from app.services.recommendation_service import generate_recommendations
from app.services.full_recommendation_service import generate_full_recommendations

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai/recommendations", tags=["recommendations"])


@router.post("/generate", response_model=RecommendationResponse)
async def get_career_recommendations(req: RecommendationRequest):
    """Generates personalized course, certification, and learning path recommendations using Google Gemini."""
    try:
        response = await generate_recommendations(req)
        return response
    except Exception as e:
        logger.error(f"Error in recommendation route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate recommendations: {str(e)}",
        )


@router.post("/full", response_model=FullRecommendationResponse)
async def get_full_career_recommendations(profile: UserProfilePayload):
    """
    Generates 3 job recommendations + 3 real course recommendations + 3 real certification
    recommendations using the user's full career profile via Gemini AI.
    Resources are AI-generated from real-world knowledge (not DB-bound).
    """
    try:
        response = await generate_full_recommendations(profile)
        return response
    except Exception as e:
        logger.error(f"Error in full recommendation route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate full recommendations: {str(e)}",
        )

