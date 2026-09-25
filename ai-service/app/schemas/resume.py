from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

StrengthText = Annotated[str, Field(min_length=1, max_length=300)]
ImprovementText = Annotated[str, Field(min_length=1, max_length=400)]
KeywordText = Annotated[str, Field(min_length=1, max_length=80)]
ActionPlanText = Annotated[str, Field(min_length=1, max_length=400)]


class ResumeAnalysisRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    resumeText: str = Field(min_length=100, max_length=20000)
    targetRole: str = Field(default="", max_length=120)

    @field_validator("resumeText")
    @classmethod
    def validate_resume_text(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 100:
            raise ValueError("Resume text must contain at least 100 characters.")
        return cleaned

    @field_validator("targetRole")
    @classmethod
    def normalize_target_role(cls, value: str) -> str:
        return value.strip()


class ResumeSectionReview(BaseModel):
    model_config = ConfigDict(extra="forbid")

    section: str = Field(min_length=2, max_length=80)
    status: str = Field(pattern="^(strong|needs_work|missing)$")
    score: int = Field(ge=0, le=100)
    feedback: str = Field(min_length=5, max_length=500)


class ResumeAnalysisResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    overallScore: int = Field(ge=0, le=100)
    summary: str = Field(min_length=20, max_length=1200)
    strengths: list[StrengthText] = Field(default_factory=list, max_length=8)
    improvements: list[ImprovementText] = Field(min_length=1, max_length=10)
    missingKeywords: list[KeywordText] = Field(default_factory=list, max_length=20)
    sectionReviews: list[ResumeSectionReview] = Field(min_length=1, max_length=12)
    actionPlan: list[ActionPlanText] = Field(min_length=1, max_length=8)


class ResumeAnalysisEnvelope(BaseModel):
    model_config = ConfigDict(extra="forbid")

    analysis: ResumeAnalysisResponse
    wordCount: int = Field(ge=1, le=20000)
    analysisSource: Literal["ai", "rule_based"] = "ai"
    notice: str = Field(default="", max_length=300)
