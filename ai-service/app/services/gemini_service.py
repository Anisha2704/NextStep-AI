import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings

logger = logging.getLogger(__name__)


def get_gemini_model() -> ChatGoogleGenerativeAI:
    """Instantiates and returns the ChatGoogleGenerativeAI model."""
    if not settings.GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY is not set in environment variables.")
        raise ValueError("GEMINI_API_KEY is missing from environment settings.")

    return ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.7,
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
