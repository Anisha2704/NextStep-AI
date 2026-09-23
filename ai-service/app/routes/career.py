import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas.career import CareerProfileRequest, CareerRecommendationResponse
from app.services.career_service import generate_career_recommendations

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai/career", tags=["career"])


@router.post("/recommend", response_model=CareerRecommendationResponse)
async def recommend_careers(profile: CareerProfileRequest):
    """Generates personalized career recommendations based on student profile."""
    try:
        recommendation = await generate_career_recommendations(profile)
        return recommendation
    except ValueError as ve:
        logger.error(f"Configuration or validation error in career route: {str(ve)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI service configuration error.",
        )
    except Exception as e:
        logger.error(f"Failed to generate career recommendations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is currently unavailable.",
        )
