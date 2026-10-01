from typing import List, Optional, Dict, Literal
from pydantic import BaseModel, Field


class AvailableCourse(BaseModel):
    id: str
    title: str
    provider: Optional[str] = ""
    description: Optional[str] = ""
    skills: List[str] = Field(default_factory=list)
    level: Optional[str] = "Beginner"
    duration: Optional[str] = ""
    url: Optional[str] = ""


class AvailableCertification(BaseModel):
    id: str
    name: str
    provider: Optional[str] = ""
    description: Optional[str] = ""
    skills: List[str] = Field(default_factory=list)
    level: Optional[str] = "Intermediate"
    preparation_time: Optional[str] = ""
    cost: Optional[str] = ""
    official_url: Optional[str] = ""


class UserProfilePayload(BaseModel):
    name: Optional[str] = "Student"
    target_role: str
    skills: List[str] = Field(default_factory=list)
    skill_levels: Dict[str, str] = Field(default_factory=dict)
    education: Optional[str] = ""
    experience: Optional[str] = ""
    projects: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    existing_certifications: List[str] = Field(default_factory=list)
    completed_courses: List[str] = Field(default_factory=list)
    # Extended fields for full recommendation
    branch: Optional[str] = ""
    graduation_year: Optional[str] = ""
    current_role: Optional[str] = ""
    preferred_location: Optional[str] = ""


class RecommendationRequest(BaseModel):
    user_profile: UserProfilePayload
    available_courses: List[AvailableCourse] = Field(default_factory=list)
    available_certifications: List[AvailableCertification] = Field(default_factory=list)


# ─── Output schemas (course/cert/learning path) ───────────────────────────────

class SkillGapItem(BaseModel):
    skill: str = Field(description="Name of the missing skill for the target career")
    importance: Literal["HIGH", "MEDIUM", "LOW"] = Field(
        default="HIGH", description="Priority level of learning this skill"
    )
    reason: str = Field(description="Personalized explanation why this skill is needed")


class CourseRecommendationItem(BaseModel):
    courseId: str = Field(description="Exact MongoDB ID of the recommended course from available_courses")
    priority: int = Field(default=1, description="Order of recommendation, 1 being highest")
    reason: str = Field(description="Personalized reason explaining why this course fits the user's background")
    skillsCovered: List[str] = Field(default_factory=list, description="Skills this course teaches")


class CertificationRecommendationItem(BaseModel):
    certificationId: str = Field(
        description="Exact MongoDB ID of the recommended certification from available_certifications"
    )
    priority: int = Field(default=1, description="Order of recommendation, 1 being highest")
    reason: str = Field(
        description="Personalized explanation of how this credential boosts the user's profile"
    )


class LearningPathStep(BaseModel):
    step: int = Field(description="Step sequence number (1, 2, 3...)")
    type: Literal["COURSE", "CERTIFICATION"] = Field(description="Type of resource")
    resourceId: str = Field(description="Exact MongoDB ID of the course or certification")
    reason: str = Field(description="Logical reasoning for why this step appears at this stage")


class RecommendationResponse(BaseModel):
    summary: str = Field(description="Concise personalized career recommendation summary")
    skillGaps: List[SkillGapItem] = Field(default_factory=list)
    courseRecommendations: List[CourseRecommendationItem] = Field(default_factory=list)
    certificationRecommendations: List[CertificationRecommendationItem] = Field(default_factory=list)
    learningPath: List[LearningPathStep] = Field(default_factory=list)


# ─── Job recommendation schemas (AI-generated, not DB-bound) ─────────────────

class JobRecommendationItem(BaseModel):
    title: str = Field(description="Actual job role title")
    company: str = Field(description="Company name or 'Various Companies' if generic")
    location: str = Field(description="Job location or 'Remote / Hybrid'")
    jobType: str = Field(default="Full-time", description="Full-time / Internship / Contract")
    requiredSkills: List[str] = Field(default_factory=list, description="Key skills required for the role")
    matchPercentage: int = Field(default=75, description="Estimated match percentage 0-100")
    whyRecommended: str = Field(description="Personalized explanation of why this job matches the user")
    missingSkills: List[str] = Field(default_factory=list, description="Skills the user is missing for this role")
    nextStep: str = Field(description="Actionable next step for the user to pursue this role")
    jobUrl: Optional[str] = Field(default="", description="Verified job URL or empty if not verified")


class FullCourseItem(BaseModel):
    courseName: str = Field(description="Actual course name from a real platform")
    provider: str = Field(description="Course provider e.g. Coursera, Udemy, edX")
    platform: str = Field(description="Platform name")
    level: str = Field(default="Intermediate", description="Beginner / Intermediate / Advanced")
    skillsCovered: List[str] = Field(default_factory=list)
    whyRecommended: str = Field(description="Why this course helps the user's career goal")
    duration: Optional[str] = Field(default="", description="Estimated duration")
    courseUrl: Optional[str] = Field(default="", description="Actual course URL if verified")


class FullCertificationItem(BaseModel):
    certificationName: str = Field(description="Official certification name")
    provider: str = Field(description="Issuing body e.g. AWS, Microsoft, Google, Oracle")
    level: str = Field(default="Associate", description="Foundational / Associate / Professional")
    skillsValidated: List[str] = Field(default_factory=list)
    whyRecommended: str = Field(description="Why this certification boosts the user's profile")
    eligibility: Optional[str] = Field(default="", description="Prerequisites or eligibility requirements")
    examName: Optional[str] = Field(default="", description="Official exam name or code")
    certificationUrl: Optional[str] = Field(default="", description="Official certification URL")


class FullRecommendationResponse(BaseModel):
    """Response from the full career recommendation endpoint (jobs + AI courses + AI certifications)."""
    jobRecommendations: List[JobRecommendationItem] = Field(default_factory=list)
    courseRecommendations: List[FullCourseItem] = Field(default_factory=list)
    certificationRecommendations: List[FullCertificationItem] = Field(default_factory=list)
