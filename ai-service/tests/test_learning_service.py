import unittest
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException
from google.api_core.exceptions import ResourceExhausted
from pydantic import ValidationError

from app.routes.learning import generate_roadmap, is_gemini_rate_limit_error
from app.routes.learning import verify_internal_service_token
from app.core.config import settings
from app.schemas.learning import RoadmapGenerationRequest, RoadmapGenerationResponse
from app.services.learning_service import generate_learning_roadmap


def make_request():
    return RoadmapGenerationRequest(
        targetRole="Backend Engineer",
        currentSkills=["JavaScript"],
        skillGaps=[
            {
                "skill": "Node.js",
                "status": "Missing",
                "priority": "High",
                "reason": "Builds server-side applications.",
            }
        ],
    )


def make_response():
    return {
        "targetRole": "Backend Engineer",
        "stages": [
            {
                "title": "Server fundamentals",
                "description": "Learn core server-side programming concepts.",
                "estimatedHours": 20,
                "milestones": [
                    {
                        "title": "Build with Node.js",
                        "description": "Create a small asynchronous command-line application.",
                        "skill": "Node.js",
                        "estimatedHours": 8,
                        "resources": [
                            {"title": "Node.js documentation", "url": "https://nodejs.org/docs/latest/api/"}
                        ],
                    }
                ],
            }
        ],
    }


class FakeModel:
    def __init__(self, result):
        self.ainvoke = AsyncMock(return_value=result)

    def with_structured_output(self, _schema):
        return self


class LearningServiceTests(unittest.IsolatedAsyncioTestCase):
    async def test_structured_output_is_validated_and_returned(self):
        model = FakeModel(make_response())
        with patch("app.services.learning_service.get_gemini_model", return_value=model):
            result = await generate_learning_roadmap(make_request())

        self.assertIsInstance(result, RoadmapGenerationResponse)
        self.assertEqual(result.targetRole, "Backend Engineer")
        self.assertEqual(model.ainvoke.await_count, 1)

    async def test_malformed_ai_output_is_rejected(self):
        model = FakeModel({"targetRole": "Backend Engineer", "stages": [{"title": "Missing required fields"}]})
        with patch("app.services.learning_service.get_gemini_model", return_value=model):
            with self.assertRaises(ValidationError):
                await generate_learning_roadmap(make_request())

    async def test_timeout_is_returned_as_gateway_timeout(self):
        with patch("app.routes.learning.generate_learning_roadmap", side_effect=TimeoutError):
            with self.assertRaises(Exception) as raised:
                await generate_roadmap(make_request())

        self.assertEqual(raised.exception.status_code, 504)

    async def test_provider_quota_is_returned_as_rate_limited(self):
        with patch(
            "app.routes.learning.generate_learning_roadmap",
            side_effect=ResourceExhausted("provider quota exhausted"),
        ):
            with self.assertRaises(HTTPException) as raised:
                await generate_roadmap(make_request())

        self.assertEqual(raised.exception.status_code, 429)
        self.assertIn("rate-limited", raised.exception.detail)

    def test_rate_limit_detection_follows_wrapped_provider_errors(self):
        provider_error = ResourceExhausted("provider quota exhausted")
        wrapper_error = RuntimeError("model invocation failed")
        wrapper_error.__cause__ = provider_error

        self.assertTrue(is_gemini_rate_limit_error(wrapper_error))

    async def test_internal_roadmap_token_is_required_and_compared(self):
        with patch.object(settings, "AI_SERVICE_INTERNAL_TOKEN", "test-service-token"):
            with self.assertRaises(HTTPException) as missing:
                await verify_internal_service_token(None)
            self.assertEqual(missing.exception.status_code, 401)

            with self.assertRaises(HTTPException) as invalid:
                await verify_internal_service_token("incorrect-token")
            self.assertEqual(invalid.exception.status_code, 401)

            self.assertIsNone(await verify_internal_service_token("test-service-token"))

    def test_resources_must_use_https(self):
        payload = make_response()
        payload["stages"][0]["milestones"][0]["resources"][0]["url"] = "http://example.com/resource"
        with self.assertRaises(ValidationError):
            RoadmapGenerationResponse.model_validate(payload)


if __name__ == "__main__":
    unittest.main()
