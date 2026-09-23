from typing import List, Optional
from pydantic import BaseModel, Field


class CareerProfileRequest(BaseModel):
    skills: List[str] = Field(default_factory=list, description="Technical skills")
    softSkills: List[str] = Field(default_factory=list, description="Soft skills")
    interests: List[str] = Field(default_factory=list, description="Career/tech interests")
    experienceLevel: Optional[str] = Field(default="Fresher", description="Experience level (e.g. Fresher, Junior)")
    targetRole: Optional[str] = Field(default=None, description="Desired or target job role")
    education: Optional[str] = Field(default=None, description="Educational background")
    projects: List[str] = Field(default_factory=list, description="List of completed projects")


class RecommendedCareer(BaseModel):
    role: str = Field(description="Recommended career role title")
    reason: str = Field(description="Detailed reason for recommending this role based on profile")
    matchingSkills: List[str] = Field(description="Skills student currently possesses for this role")
    missingSkills: List[str] = Field(description="Recommended skills student should acquire")
    nextSteps: List[str] = Field(description="Actionable steps student should take to prepare for this role")


class CareerRecommendationResponse(BaseModel):
    summary: str = Field(description="Executive summary of the candidate's career potential and analysis")
    recommendedCareers: List[RecommendedCareer] = Field(description="List of 3 to 5 tailored career role recommendations")
