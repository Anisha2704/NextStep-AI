from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator


class RoadmapSkillGap(BaseModel):
    model_config = ConfigDict(extra="forbid")

    skill: str = Field(min_length=1, max_length=100)
    status: Literal["Strong", "Needs Improvement", "Missing"]
    priority: Literal["High", "Medium", "Low"]
    reason: str = Field(min_length=1, max_length=500)
    whatToLearn: list[str] = Field(default_factory=list, max_length=8)
    nextSteps: list[str] = Field(default_factory=list, max_length=8)


class RoadmapGenerationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    targetRole: str = Field(min_length=2, max_length=120)
    currentSkills: list[str] = Field(default_factory=list, max_length=50)
    skillGaps: list[RoadmapSkillGap] = Field(min_length=1, max_length=40)
    experienceLevel: str = Field(default="Student", max_length=40)
    education: str = Field(default="", max_length=500)
    interests: list[str] = Field(default_factory=list, max_length=20)
    careerGoals: str = Field(default="", max_length=1000)


class LearningResource(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=120)
    url: HttpUrl

    @field_validator("url")
    @classmethod
    def require_https(cls, value: HttpUrl) -> HttpUrl:
        if value.scheme != "https":
            raise ValueError("Learning resources must use HTTPS")
        return value


class RoadmapMilestonePlan(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=5, max_length=600)
    skill: str = Field(min_length=1, max_length=100)
    estimatedHours: float = Field(ge=0.1, le=100)
    resources: list[LearningResource] = Field(default_factory=list, max_length=4)


class RoadmapStagePlan(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=5, max_length=600)
    estimatedHours: float = Field(ge=0.1, le=500)
    milestones: list[RoadmapMilestonePlan] = Field(min_length=1, max_length=12)


class RoadmapGenerationResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    targetRole: str = Field(min_length=2, max_length=120)
    stages: list[RoadmapStagePlan] = Field(min_length=1, max_length=8)
