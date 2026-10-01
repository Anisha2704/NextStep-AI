import json
import logging
from typing import List, Dict, Any
from langchain_core.prompts import ChatPromptTemplate
from app.services.gemini_service import get_gemini_model, is_gemini_timeout_error
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    SkillGapItem,
    CourseRecommendationItem,
    CertificationRecommendationItem,
    LearningPathStep,
)

logger = logging.getLogger(__name__)


def build_rule_based_fallback(req: RecommendationRequest) -> RecommendationResponse:
    """Intelligent rule-based recommendation fallback when Gemini API is unavailable or rate-limited.
    Matches user's missing skills and target career against the available database courses and certifications.
    """
    profile = req.user_profile
    user_skills_lower = {s.lower().strip() for s in profile.skills}
    target_role_lower = profile.target_role.lower().strip()

    # Determine gaps based on target role keywords
    role_skill_map: Dict[str, List[str]] = {
        "java": ["Spring Boot", "Hibernate", "REST API", "Microservices", "Docker"],
        "full stack": ["Spring Boot", "React", "REST API", "Docker", "TypeScript"],
        "frontend": ["React", "TypeScript", "Next.js", "Redux", "Tailwind"],
        "data": ["SQL", "Python", "Power BI", "Tableau", "Pandas"],
        "cloud": ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform"],
        "devops": ["Docker", "Kubernetes", "CI/CD", "AWS", "Terraform"],
    }

    expected_skills = []
    for key, skills in role_skill_map.items():
        if key in target_role_lower:
            expected_skills.extend(skills)

    if not expected_skills:
        expected_skills = ["Spring Boot", "React", "SQL", "Docker", "AWS"]

    # Filter out skills the user already has
    missing_skills = [s for s in expected_skills if s.lower() not in user_skills_lower]

    skill_gaps = [
        SkillGapItem(
            skill=s,
            importance="HIGH" if idx < 2 else "MEDIUM",
            reason=f"Important required competency to succeed as a {profile.target_role}.",
        )
        for idx, s in enumerate(missing_skills[:6])
    ]

    # Match courses that teach the missing skills
    recommended_courses = []
    seen_course_ids = set(profile.completed_courses)
    priority = 1

    for c in req.available_courses:
        if c.id in seen_course_ids:
            continue
        course_skills = [s.lower() for s in c.skills]
        # Check overlap with missing skills or target role
        overlap = [ms for ms in missing_skills if ms.lower() in course_skills]
        if overlap or any(kw in c.title.lower() for kw in target_role_lower.split()):
            recommended_courses.append(
                CourseRecommendationItem(
                    courseId=c.id,
                    priority=priority,
                    reason=f"Covers key skill gap: {', '.join(overlap) if overlap else c.title}, directly supporting your {profile.target_role} goal.",
                    skillsCovered=c.skills,
                )
            )
            seen_course_ids.add(c.id)
            priority += 1
            if len(recommended_courses) >= 4:
                break

    # If still empty, take top available courses
    if not recommended_courses and req.available_courses:
        for c in req.available_courses[:3]:
            if c.id not in seen_course_ids:
                recommended_courses.append(
                    CourseRecommendationItem(
                        courseId=c.id,
                        priority=priority,
                        reason=f"Recommended foundational course for {profile.target_role}.",
                        skillsCovered=c.skills,
                    )
                )
                priority += 1

    # Match certifications
    recommended_certs = []
    seen_cert_ids = set(profile.existing_certifications)
    cert_priority = 1

    for cert in req.available_certifications:
        if cert.id in seen_cert_ids:
            continue
        cert_skills = [s.lower() for s in cert.skills]
        overlap = [ms for ms in missing_skills if ms.lower() in cert_skills]
        if overlap or any(kw in cert.name.lower() for kw in target_role_lower.split()):
            recommended_certs.append(
                CertificationRecommendationItem(
                    certificationId=cert.id,
                    priority=cert_priority,
                    reason=f"Industry-recognized credential validating your capabilities in {', '.join(cert.skills[:3])}.",
                )
            )
            seen_cert_ids.add(cert.id)
            cert_priority += 1
            if len(recommended_certs) >= 3:
                break

    if not recommended_certs and req.available_certifications:
        for cert in req.available_certifications[:2]:
            if cert.id not in seen_cert_ids:
                recommended_certs.append(
                    CertificationRecommendationItem(
                        certificationId=cert.id,
                        priority=cert_priority,
                        reason=f"Professional credential to boost credibility for {profile.target_role}.",
                    )
                )
                cert_priority += 1

    # Learning path
    learning_path = []
    step_num = 1
    for cr in recommended_courses:
        learning_path.append(
            LearningPathStep(
                step=step_num,
                type="COURSE",
                resourceId=cr.courseId,
                reason=cr.reason,
            )
        )
        step_num += 1

    for cert_r in recommended_certs:
        learning_path.append(
            LearningPathStep(
                step=step_num,
                type="CERTIFICATION",
                resourceId=cert_r.certificationId,
                reason="Certify and validate your acquired skills for employers.",
            )
        )
        step_num += 1

    summary = (
        f"Based on your background and target career as {profile.target_role}, we identified "
        f"{len(skill_gaps)} key skill gap(s). We have curated {len(recommended_courses)} course(s) "
        f"and {len(recommended_certs)} certification(s) from our verified catalog to advance your career."
    )

    return RecommendationResponse(
        summary=summary,
        skillGaps=skill_gaps,
        courseRecommendations=recommended_courses,
        certificationRecommendations=recommended_certs,
        learningPath=learning_path,
    )


async def generate_recommendations(req: RecommendationRequest) -> RecommendationResponse:
    """Invokes Google Gemini with structured instructions to produce personalized recommendations
    strictly bounded to database items.
    """
    profile = req.user_profile

    # Format available resources into a compact catalog representation
    courses_context = [
        {
            "id": c.id,
            "title": c.title,
            "provider": c.provider,
            "skills": c.skills,
            "level": c.level,
            "duration": c.duration,
            "description": c.description[:140] if c.description else "",
        }
        for c in req.available_courses
    ]

    certs_context = [
        {
            "id": cert.id,
            "name": cert.name,
            "provider": cert.provider,
            "skills": cert.skills,
            "level": cert.level,
            "preparation_time": cert.preparation_time,
            "cost": cert.cost,
        }
        for cert in req.available_certifications
    ]

    system_instruction = (
        "You are an expert AI Career Advisor for NextStep-AI.\n"
        "Analyze the user's current profile and target career.\n"
        "Identify the skills the user already has.\n"
        "Identify important missing skills for the target career.\n\n"
        "CRITICAL RULES:\n"
        "1. From the provided list of courses and certifications ONLY, select the most relevant resources.\n"
        "2. Do NOT invent resources, names, providers, or IDs. Every courseId and certificationId MUST match an exact 'id' from the provided lists.\n"
        "3. Do not recommend courses the user has already completed.\n"
        "4. Do not recommend certifications the user already has.\n"
        "5. Prefer recommendations that directly address the user's skill gaps.\n"
        "6. Consider the user's current skill level and prerequisites to build an ordered learning path (foundations first, then advanced, then certification).\n"
        "7. For every recommendation explain why it is relevant to this particular user using their actual profile context.\n"
        "8. Return ONLY valid JSON matching the required schema.\n"
    )

    human_prompt = (
        f"USER PROFILE:\n"
        f"- Name: {profile.name}\n"
        f"- Target Career: {profile.target_role}\n"
        f"- Current Skills: {', '.join(profile.skills) if profile.skills else 'None listed'}\n"
        f"- Skill Levels: {json.dumps(profile.skill_levels)}\n"
        f"- Education: {profile.education or 'Not specified'}\n"
        f"- Experience: {profile.experience or 'Student / Entry-level'}\n"
        f"- Projects: {', '.join(profile.projects) if profile.projects else 'None listed'}\n"
        f"- Interests: {', '.join(profile.interests) if profile.interests else 'None listed'}\n"
        f"- Existing Certifications: {', '.join(profile.existing_certifications) if profile.existing_certifications else 'None'}\n"
        f"- Completed Courses: {', '.join(profile.completed_courses) if profile.completed_courses else 'None'}\n\n"
        f"AVAILABLE DATABASE COURSES (Choose ONLY from these IDs):\n{json.dumps(courses_context, indent=2)}\n\n"
        f"AVAILABLE DATABASE CERTIFICATIONS (Choose ONLY from these IDs):\n{json.dumps(certs_context, indent=2)}\n\n"
        f"Generate personalized skill gaps, course recommendations, certification recommendations, and an ordered learning path."
    )

    try:
        llm = get_gemini_model()

        try:
            structured_llm = llm.with_structured_output(RecommendationResponse)
            prompt = ChatPromptTemplate.from_messages([
                ("system", system_instruction),
                ("human", human_prompt),
            ])
            chain = prompt | structured_llm
            result = await chain.ainvoke({})
            if result and isinstance(result, RecommendationResponse):
                return result
        except Exception as struct_err:
            if is_gemini_timeout_error(struct_err):
                logger.warning("Gemini timeout in structured call, falling back to rule-based.")
                return build_rule_based_fallback(req)
            logger.warning(f"Structured output failed ({str(struct_err)}), falling back to raw prompt invocation.")

            # Fallback to direct raw prompt
            raw_response = await llm.ainvoke(
                f"{system_instruction}\n\n{human_prompt}\n\nOutput only a JSON object matching the required schema."
            )
            raw_content = str(raw_response.content).strip()
            # Clean markdown codeblocks
            if raw_content.startswith("```json"):
                raw_content = raw_content[7:]
            if raw_content.startswith("```"):
                raw_content = raw_content[3:]
            if raw_content.endswith("```"):
                raw_content = raw_content[:-3]
            parsed_json = json.loads(raw_content.strip())
            return RecommendationResponse(**parsed_json)

    except Exception as e:
        logger.error(f"Gemini API error in recommendation_service ({str(e)}). Switching to intelligent rule-based fallback.")
        return build_rule_based_fallback(req)
