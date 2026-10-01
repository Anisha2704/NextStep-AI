"""
Full career recommendation service.
Calls Gemini with the user's complete profile to generate:
  - 3 Job recommendations
  - 3 Real course recommendations
  - 3 Real certification recommendations
These are AI-generated (not DB-bound) and follow the exact prompt format requested.
"""
import json
import logging
from app.services.gemini_service import get_gemini_model, is_gemini_timeout_error
from app.schemas.recommendation import (
    UserProfilePayload,
    FullRecommendationResponse,
    JobRecommendationItem,
    FullCourseItem,
    FullCertificationItem,
)

logger = logging.getLogger(__name__)


def _build_fallback(profile: UserProfilePayload) -> FullRecommendationResponse:
    """Rule-based fallback when Gemini is unavailable."""
    role = profile.target_role or "Software Engineer"
    skills = profile.skills or []
    location = profile.preferred_location or "Remote"

    return FullRecommendationResponse(
        jobRecommendations=[
            JobRecommendationItem(
                title=f"Junior {role}",
                company="Various Companies",
                location=location,
                jobType="Full-time",
                requiredSkills=skills[:5] if skills else ["Problem Solving", "Communication"],
                matchPercentage=70,
                whyRecommended=f"Entry-level {role} roles are an excellent starting point given your current skill set.",
                missingSkills=[],
                nextStep="Search on LinkedIn, Naukri, and Glassdoor for junior openings matching your skills.",
                jobUrl="https://www.linkedin.com/jobs/",
            ),
            JobRecommendationItem(
                title=f"{role} Intern",
                company="Various Startups / MNCs",
                location=location,
                jobType="Internship",
                requiredSkills=skills[:3] if skills else ["Coding", "Teamwork"],
                matchPercentage=80,
                whyRecommended="Internships provide practical experience and improve your resume before a full-time role.",
                missingSkills=[],
                nextStep="Apply on Internshala, LinkedIn, and company career pages.",
                jobUrl="https://internshala.com/",
            ),
            JobRecommendationItem(
                title=f"Associate {role}",
                company="Product Companies",
                location=location,
                jobType="Full-time",
                requiredSkills=skills[:4] if skills else ["Development", "Debugging"],
                matchPercentage=65,
                whyRecommended="Associate positions bridge the gap between fresher and mid-level engineer roles.",
                missingSkills=[],
                nextStep="Build portfolio projects and apply once you complete the recommended courses.",
                jobUrl="https://www.naukri.com/",
            ),
        ],
        courseRecommendations=[
            FullCourseItem(
                courseName=f"{role} Bootcamp",
                provider="Udemy",
                platform="Udemy",
                level="Beginner",
                skillsCovered=skills[:3] if skills else ["Programming"],
                whyRecommended=f"Provides a structured path to learn {role} skills from scratch.",
                duration="20-30 hours",
                courseUrl="https://www.udemy.com/",
            ),
        ],
        certificationRecommendations=[
            FullCertificationItem(
                certificationName="AWS Certified Cloud Practitioner",
                provider="AWS",
                level="Foundational",
                skillsValidated=["Cloud Computing", "AWS"],
                whyRecommended="Cloud fundamentals are increasingly required for all developer roles.",
                eligibility="No prerequisites required.",
                examName="CLF-C02",
                certificationUrl="https://aws.amazon.com/certification/certified-cloud-practitioner/",
            ),
        ],
    )


async def generate_full_recommendations(profile: UserProfilePayload) -> FullRecommendationResponse:
    """
    Uses the user's complete profile to generate job, course, and certification
    recommendations via Gemini AI using the structured career advisor prompt.
    """
    system_instruction = (
        "You are an AI Career Recommendation Assistant.\n"
        "Analyze the user's profile, skills, education, experience, projects, interests, and career goals.\n\n"
        "Your task is to generate EXACTLY 3 separate recommendation categories:\n"
        "1. JOB RECOMMENDATIONS\n"
        "2. COURSE RECOMMENDATIONS\n"
        "3. CERTIFICATION RECOMMENDATIONS\n\n"
        "IMPORTANT RULES:\n"
        "- Keep the three categories completely separate.\n"
        "- Recommend REAL and EXISTING jobs, courses, and certifications.\n"
        "- Do NOT invent companies, job titles, courses, certifications, URLs, providers, or programs.\n"
        "- Recommendations must be relevant to the user's current skills and career goal.\n"
        "- Prefer currently available and recognized opportunities/programs.\n"
        "- Avoid recommending something the user already has or has already completed.\n"
        "- Explain why each recommendation matches the user's profile.\n"
        "- Give practical next steps.\n"
        "- For jobs, recommend actual job roles. When reliable information is available, include actual companies.\n"
        "- For courses, recommend actual courses from recognized platforms such as Coursera, Udemy, edX, AWS Skill Builder, Microsoft Learn, Google Cloud Skills Boost, etc.\n"
        "- For certifications, recommend actual certifications such as AWS Certified Developer, Azure certifications, Oracle Java certifications, Google Cloud certifications, etc.\n"
        "- Do not confuse a course with a certification. A course teaches; a certification is an official credential/exam.\n"
        "- Do not recommend random certificates of completion as professional certifications.\n"
        "- Match recommendations to the user's experience level.\n"
        "- Prioritize recommendations that improve employability for the user's target career.\n\n"
        "MATCHING LOGIC — Consider: skills match, career goal match, education match, experience level, "
        "project experience, location preference, industry relevance, skill gaps, market relevance.\n\n"
        "Return ONLY valid JSON with exactly this structure (no markdown, no extra text):\n"
        "{\n"
        '  "jobRecommendations": [ <exactly 3 items> ],\n'
        '  "courseRecommendations": [ <exactly 3 items> ],\n'
        '  "certificationRecommendations": [ <exactly 3 items> ]\n'
        "}"
    )

    human_prompt = (
        f"USER PROFILE:\n"
        f"Name: {profile.name}\n"
        f"Education: {profile.education or 'Not specified'}\n"
        f"Branch: {profile.branch or 'Not specified'}\n"
        f"Graduation Year: {profile.graduation_year or 'Not specified'}\n"
        f"Current Role: {profile.current_role or 'Student / Fresher'}\n"
        f"Experience: {profile.experience or 'Entry-level'}\n"
        f"Skills: {', '.join(profile.skills) if profile.skills else 'None listed'}\n"
        f"Projects: {', '.join(profile.projects) if profile.projects else 'None listed'}\n"
        f"Interests: {', '.join(profile.interests) if profile.interests else 'None listed'}\n"
        f"Career Goal: {profile.target_role}\n"
        f"Preferred Location: {profile.preferred_location or 'Any'}\n"
        f"Existing Certifications: {', '.join(profile.existing_certifications) if profile.existing_certifications else 'None'}\n"
        f"Completed Courses: {', '.join(profile.completed_courses) if profile.completed_courses else 'None'}\n\n"
        "Generate exactly 3 job recommendations, 3 course recommendations, and 3 certification recommendations.\n"
        "Return ONLY valid JSON. No markdown. No explanations outside the JSON.\n\n"
        "JSON Schema for each job item:\n"
        '{"title": str, "company": str, "location": str, "jobType": str, "requiredSkills": [str], '
        '"matchPercentage": int, "whyRecommended": str, "missingSkills": [str], "nextStep": str, "jobUrl": str}\n\n'
        "JSON Schema for each course item:\n"
        '{"courseName": str, "provider": str, "platform": str, "level": str, "skillsCovered": [str], '
        '"whyRecommended": str, "duration": str, "courseUrl": str}\n\n'
        "JSON Schema for each certification item:\n"
        '{"certificationName": str, "provider": str, "level": str, "skillsValidated": [str], '
        '"whyRecommended": str, "eligibility": str, "examName": str, "certificationUrl": str}'
    )

    try:
        llm = get_gemini_model()

        # Try structured output first
        try:
            structured_llm = llm.with_structured_output(FullRecommendationResponse)
            from langchain_core.prompts import ChatPromptTemplate
            prompt = ChatPromptTemplate.from_messages([
                ("system", system_instruction),
                ("human", human_prompt),
            ])
            chain = prompt | structured_llm
            result = await chain.ainvoke({})
            if result and isinstance(result, FullRecommendationResponse):
                logger.info("Full recommendation generated via structured Gemini output.")
                return result
        except Exception as struct_err:
            if is_gemini_timeout_error(struct_err):
                logger.warning("Gemini timeout in full recommendation structured call, using fallback.")
                return _build_fallback(profile)
            logger.warning(f"Structured output failed for full recommendation ({str(struct_err)}), using raw prompt.")

        # Raw prompt fallback
        raw_response = await llm.ainvoke(
            f"{system_instruction}\n\n{human_prompt}"
        )
        raw_content = str(raw_response.content).strip()

        # Strip markdown code fences if present
        for prefix in ("```json", "```"):
            if raw_content.startswith(prefix):
                raw_content = raw_content[len(prefix):]
        if raw_content.endswith("```"):
            raw_content = raw_content[:-3]

        parsed = json.loads(raw_content.strip())

        # Validate & coerce into Pydantic model
        jobs = [JobRecommendationItem(**j) for j in parsed.get("jobRecommendations", [])]
        courses = [FullCourseItem(**c) for c in parsed.get("courseRecommendations", [])]
        certs = [FullCertificationItem(**c) for c in parsed.get("certificationRecommendations", [])]

        return FullRecommendationResponse(
            jobRecommendations=jobs,
            courseRecommendations=courses,
            certificationRecommendations=certs,
        )

    except Exception as e:
        logger.error(f"Full recommendation Gemini call failed: {str(e)}. Using rule-based fallback.")
        return _build_fallback(profile)
