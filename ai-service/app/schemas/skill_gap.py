from typing import List, Optional
from pydantic import BaseModel, Field


class SkillGapRequest(BaseModel):
    targetRole: str = Field(description="Target career role to analyze against (e.g. Full Stack Developer)")
    skills: List[str] = Field(default_factory=list, description="Technical skills student currently possesses")
    softSkills: List[str] = Field(default_factory=list, description="Soft skills student currently possesses")
    experienceLevel: Optional[str] = Field(default="Fresher", description="Experience level")
    education: Optional[str] = Field(default=None, description="Educational background")
    projects: List[str] = Field(default_factory=list, description="List of completed projects")


class SkillGapItem(BaseModel):
    skill: str = Field(description="Skill name being evaluated")
    status: str = Field(description="Status of skill: 'Strong', 'Needs Improvement', or 'Missing'")
    priority: str = Field(description="Priority of addressing this gap: 'High', 'Medium', or 'Low'")
    reason: str = Field(description="Explanation of why this skill is important for the target role")
    whatToLearn: List[str] = Field(default_factory=list, description="Key concepts or topics to study for this skill")
    nextSteps: List[str] = Field(default_factory=list, description="Actionable steps or project ideas to master this skill")


class SkillGapResponse(BaseModel):
    summary: str = Field(description="Overall executive summary of current readiness for target role")
    targetRole: str = Field(description="Target role analyzed")
    currentSkills: List[str] = Field(default_factory=list, description="Relevant existing skills possessed by student")
    skillGaps: List[SkillGapItem] = Field(default_factory=list, description="Detailed analysis of skills, status, priority, and next steps")
