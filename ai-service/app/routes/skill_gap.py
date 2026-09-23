import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas.skill_gap import SkillGapRequest, SkillGapResponse
from app.services.skill_gap_service import generate_skill_gap_analysis, generate_fallback_skill_gap_analysis

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai/skill-gap", tags=["skill-gap"])


@router.post("/analyze", response_model=SkillGapResponse)
async def analyze_skill_gap(request: SkillGapRequest):
    """Analyzes student skills against target role requirements."""
    if not request.targetRole or not request.targetRole.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target role is required for skill gap analysis.",
        )

    try:
        analysis = await generate_skill_gap_analysis(request)
        return analysis
    except ValueError as ve:
        logger.error(f"Configuration error in skill gap route: {str(ve)}")
        return generate_fallback_skill_gap_analysis(request)
    except Exception as e:
        logger.error(f"Failed to execute skill gap analysis: {str(e)}. Returning fallback analysis.")
        return generate_fallback_skill_gap_analysis(request)

