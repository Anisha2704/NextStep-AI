import logging
import hmac

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import ValidationError
from google.api_core.exceptions import ResourceExhausted

from app.schemas.learning import RoadmapGenerationRequest, RoadmapGenerationResponse
from app.core.config import settings
from app.services.gemini_service import is_gemini_timeout_error
from app.services.learning_service import InvalidRoadmapOutput, generate_learning_roadmap

router = APIRouter(prefix="/learning", tags=["learning"])
logger = logging.getLogger(__name__)


def is_gemini_rate_limit_error(error: Exception) -> bool:
    """Find quota/rate-limit errors even when the provider SDK wraps them."""
    current_error = error
    visited_errors = set()

    while current_error is not None and id(current_error) not in visited_errors:
        visited_errors.add(id(current_error))
        if isinstance(current_error, ResourceExhausted):
            return True
        current_error = current_error.__cause__ or current_error.__context__

    return False


async def verify_internal_service_token(
    x_ai_service_token: str | None = Header(default=None, alias="X-AI-Service-Token"),
):
    expected_token = settings.AI_SERVICE_INTERNAL_TOKEN
    if not expected_token:
        logger.error("AI_SERVICE_INTERNAL_TOKEN is not configured; roadmap generation is disabled.")
        raise HTTPException(status_code=503, detail="Learning roadmap generation is not configured.")
    if not x_ai_service_token or not hmac.compare_digest(x_ai_service_token, expected_token):
        raise HTTPException(status_code=401, detail="Not authorized to use roadmap generation.")


@router.post("/roadmap/generate", response_model=RoadmapGenerationResponse)
async def generate_roadmap(
    request: RoadmapGenerationRequest,
    _authorized: None = Depends(verify_internal_service_token),
):
    try:
        return await generate_learning_roadmap(request)
    except Exception as error:
        if is_gemini_rate_limit_error(error):
            logger.warning("Learning roadmap generation was rate-limited by the AI provider.")
            raise HTTPException(
                status_code=429,
                detail="Roadmap generation is temporarily rate-limited by the AI provider. Please try again later.",
            ) from error
        if is_gemini_timeout_error(error):
            logger.warning("Learning roadmap generation timed out.")
            raise HTTPException(status_code=504, detail="Roadmap generation timed out. Please try again.") from error
        if isinstance(error, (ValidationError, InvalidRoadmapOutput)):
            logger.exception("Learning roadmap response validation failed.")
            raise HTTPException(status_code=502, detail="The learning service returned an invalid roadmap.") from error
        logger.exception("Learning roadmap generation failed.")
        raise HTTPException(status_code=503, detail="Learning roadmap generation is currently unavailable.") from error
