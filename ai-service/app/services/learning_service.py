import logging

from app.schemas.learning import RoadmapGenerationRequest, RoadmapGenerationResponse
from app.services.gemini_service import get_gemini_model

logger = logging.getLogger(__name__)


class InvalidRoadmapOutput(ValueError):
    """Raised when a validly parsed model response does not match its request."""


async def generate_learning_roadmap(
    request: RoadmapGenerationRequest,
) -> RoadmapGenerationResponse:
    """Generate one schema-validated roadmap from verified profile and skill-gap data."""
    llm = get_gemini_model()
    structured_llm = llm.with_structured_output(RoadmapGenerationResponse)
    prompt = (
        "Create a personalized learning roadmap using only the supplied student data. "
        "Sequence prerequisite skills before dependent skills. Give more urgent attention "
        "to High priority gaps, then Medium, while accounting for the student's current "
        "skills, experience, education, interests, and career goals. Do not invent skills "
        "as current skills. Return 1 to 8 ordered stages, each with 1 to 12 practical "
        "milestones. Estimate realistic learner effort in hours. Resources must be useful "
        "public HTTPS learning references; omit resources when you cannot provide a reliable URL.\n\n"
        f"Student data:\n{request.model_dump_json(indent=2)}"
    )
    result = await structured_llm.ainvoke(prompt)
    if isinstance(result, RoadmapGenerationResponse):
        roadmap = result
    else:
        roadmap = RoadmapGenerationResponse.model_validate(result)

    if roadmap.targetRole.strip().casefold() != request.targetRole.strip().casefold():
        raise InvalidRoadmapOutput("The generated roadmap target role did not match the request.")

    return roadmap
