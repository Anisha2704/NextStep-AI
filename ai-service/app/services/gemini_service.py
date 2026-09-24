import logging
from google.api_core.exceptions import DeadlineExceeded
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings

logger = logging.getLogger(__name__)


def is_gemini_timeout_error(error: Exception) -> bool:
    """Recognize timeout errors raised by asyncio and the Google API client."""
    current_error = error
    visited_errors = set()

    while current_error is not None and id(current_error) not in visited_errors:
        visited_errors.add(id(current_error))
        if isinstance(current_error, (TimeoutError, DeadlineExceeded)):
            return True
        current_error = current_error.__cause__ or current_error.__context__

    return False


def get_gemini_model() -> ChatGoogleGenerativeAI:
    """Instantiates and returns the ChatGoogleGenerativeAI model."""
    if not settings.GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY is not set in environment variables.")
        raise ValueError("GEMINI_API_KEY is missing from environment settings.")

    return ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=1.0,
        timeout=45,
        max_retries=0,
    )


async def generate_response(prompt: str) -> str:
    """Sends a prompt to Google Gemini via LangChain and returns the response string."""
    try:
        llm = get_gemini_model()
        response = await llm.ainvoke(prompt)
        return str(response.content)
    except Exception as e:
        logger.error(f"Error invoking Gemini model: {str(e)}")
        raise e
