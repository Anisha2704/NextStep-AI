import hmac
import logging

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile
from google.api_core.exceptions import ResourceExhausted
from pydantic import ValidationError
from starlette.concurrency import run_in_threadpool

from app.core.config import settings
from app.schemas.resume import ResumeAnalysisEnvelope, ResumeAnalysisRequest
from app.services.gemini_service import is_gemini_timeout_error
from app.services.resume_service import (
    InvalidResumeInput,
    analyze_resume,
    create_rule_based_resume_analysis,
    extract_resume_text,
)

router = APIRouter(prefix="/resume", tags=["resume"])
logger = logging.getLogger(__name__)
MAX_RESUME_BYTES = 4 * 1024 * 1024


async def verify_internal_service_token(
    x_ai_service_token: str | None = Header(default=None, alias="X-AI-Service-Token"),
):
    expected = settings.AI_SERVICE_INTERNAL_TOKEN
    if not expected:
        logger.error("AI_SERVICE_INTERNAL_TOKEN is not configured; resume analysis is disabled.")
        raise HTTPException(status_code=503, detail="Resume analysis is not configured.")
    if not x_ai_service_token or not hmac.compare_digest(x_ai_service_token, expected):
        raise HTTPException(status_code=401, detail="Not authorized to use resume analysis.")


def map_analysis_error(error: Exception) -> HTTPException:
    current_error = error
    visited_errors = set()
    while current_error is not None and id(current_error) not in visited_errors:
        visited_errors.add(id(current_error))
        if isinstance(current_error, ResourceExhausted):
            logger.warning("Resume analysis was rate-limited by the AI provider.")
            return HTTPException(
                status_code=429,
                detail="Gemini's available quota for resume analysis has been reached. Try again after the quota resets or enable billing/increased quota for the Google AI project.",
            )
        current_error = current_error.__cause__ or current_error.__context__
    if is_gemini_timeout_error(error):
        logger.warning("Resume analysis timed out.")
        return HTTPException(status_code=504, detail="Resume analysis timed out. Please try again.")
    if isinstance(error, InvalidResumeInput):
        return HTTPException(status_code=400, detail=str(error))
    if isinstance(error, ValidationError):
        logger.exception("Resume analysis response failed schema validation.")
        return HTTPException(status_code=502, detail="The resume service returned an invalid analysis.")
    logger.exception("Resume analysis failed.")
    return HTTPException(status_code=503, detail="Resume analysis is currently unavailable.")


def is_rate_limit_error(error: Exception) -> bool:
    current_error = error
    visited_errors = set()
    while current_error is not None and id(current_error) not in visited_errors:
        visited_errors.add(id(current_error))
        if isinstance(current_error, ResourceExhausted):
            return True
        current_error = current_error.__cause__ or current_error.__context__
    return False


async def analyze_with_quota_fallback(request: ResumeAnalysisRequest) -> ResumeAnalysisEnvelope:
    try:
        return await analyze_resume(request)
    except Exception as error:
        if not is_rate_limit_error(error):
            raise
        logger.warning("Resume analysis quota exhausted; returning clearly labeled checklist feedback.")
        return create_rule_based_resume_analysis(request)


@router.post("/analyze", response_model=ResumeAnalysisEnvelope)
async def analyze_resume_text(
    request: ResumeAnalysisRequest,
    _authorized: None = Depends(verify_internal_service_token),
):
    try:
        return await analyze_with_quota_fallback(request)
    except Exception as error:
        raise map_analysis_error(error) from error


@router.post("/analyze-file", response_model=ResumeAnalysisEnvelope)
async def analyze_resume_file(
    file: UploadFile = File(...),
    targetRole: str = Form(default="", max_length=120),
    _authorized: None = Depends(verify_internal_service_token),
):
    try:
        if file.content_type not in {"application/pdf", "text/plain"}:
            raise InvalidResumeInput("Upload a PDF or UTF-8 text file.")
        if not file.filename or len(file.filename) > 160:
            raise InvalidResumeInput("The resume filename is invalid.")
        file_bytes = await file.read(MAX_RESUME_BYTES + 1)
        if not file_bytes or len(file_bytes) > MAX_RESUME_BYTES:
            raise InvalidResumeInput("Resume files must be smaller than 4 MB.")
        text = await run_in_threadpool(extract_resume_text, file_bytes, file.filename, file.content_type)
        request = ResumeAnalysisRequest(resumeText=text, targetRole=targetRole)
        return await analyze_with_quota_fallback(request)
    except Exception as error:
        raise map_analysis_error(error) from error
