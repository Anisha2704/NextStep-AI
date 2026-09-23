import logging
import json
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from app.services.gemini_service import get_gemini_model
from app.schemas.career import CareerProfileRequest, CareerRecommendationResponse, RecommendedCareer

logger = logging.getLogger(__name__)


def generate_fallback_career_recommendations(profile: CareerProfileRequest) -> CareerRecommendationResponse:
    """Generates a rule-based fallback career recommendation response when Gemini API is unavailable or rate-limited."""
    user_skills = profile.skills or []
    target_role = profile.targetRole or "Full Stack Developer"
    
    rec_careers = [
        RecommendedCareer(
            role=target_role,
            reason=f"Directly matches your specified target career role and aligns with your background.",
            matchingSkills=user_skills[:4] if user_skills else ["Problem Solving"],
            missingSkills=["System Design", "Cloud Deployment (AWS/Docker)", "Advanced API Architecture"],
            nextSteps=[
                "Build a complete full-stack web application featuring RESTful API design.",
                "Containerize your application using Docker Compose.",
                "Prepare for technical interviews with Data Structures & Algorithms practice."
            ]
        ),
        RecommendedCareer(
            role="Frontend Engineer",
            reason="Excellent career path emphasizing interactive UI development, component architecture, and user experience.",
            matchingSkills=[s for s in user_skills if any(k in s.lower() for k in ["react", "js", "html", "css", "ui"])] or (user_skills[:2] if user_skills else ["JavaScript"]),
            missingSkills=["TypeScript", "Next.js App Router", "Web Performance Optimization"],
            nextSteps=[
                "Master React Custom Hooks and State Management patterns.",
                "Build a responsive web app with Tailwind CSS and Next.js."
            ]
        ),
        RecommendedCareer(
            role="Backend Engineer",
            reason="High-demand engineering role focused on scalable server logic, database management, and microservice APIs.",
            matchingSkills=[s for s in user_skills if any(k in s.lower() for k in ["node", "express", "sql", "mongo", "python"])] or (user_skills[:2] if user_skills else ["Node.js"]),
            missingSkills=["Microservices Architecture", "Database Query Optimization", "OAuth2 / JWT Security"],
            nextSteps=[
                "Develop secure REST APIs with JWT authentication.",
                "Learn database indexing and schema optimization."
            ]
        )
    ]

    summary = (
        f"Career Analysis Summary: Based on your current technical skill set ({', '.join(user_skills[:5]) if user_skills else 'general technical foundation'}), "
        f"we recommend pursuing roles in {target_role}, Frontend Engineering, and Backend Engineering. Focus on building hands-on projects and deepening core architecture concepts."
    )

    return CareerRecommendationResponse(
        summary=summary,
        recommendedCareers=rec_careers
    )


async def generate_career_recommendations(profile: CareerProfileRequest) -> CareerRecommendationResponse:
    """Analyzes a student's profile and generates structured career recommendations using Google Gemini."""
    try:
        llm = get_gemini_model()

        system_instruction = (
            "You are the Career Guidance Assistant for NextStep AI. Your role is to analyze student profiles "
            "and provide realistic, encouraging, and actionable career guidance.\n\n"
            "RULES:\n"
            "1. Recommend 3 to 5 relevant career roles strictly tailored to the supplied profile.\n"
            "2. Base all analysis on the provided skills, soft skills, interests, experience level, target role, education, and projects.\n"
            "3. Do NOT invent skills the student does not possess. Clearly distinguish existing matching skills from recommended missing skills.\n"
            "4. Do NOT make unsupported salary claims, employment guarantees, or fabricated job market statistics.\n"
            "5. Avoid claiming absolute certainty about a student's career outcome.\n"
            "6. Provide practical, highly actionable next steps for every role.\n"
        )

        human_message = (
            "Please analyze the following student profile and generate career recommendations:\n\n"
            "Technical Skills: {skills}\n"
            "Soft Skills: {soft_skills}\n"
            "Interests: {interests}\n"
            "Experience Level: {experience_level}\n"
            "Target Role: {target_role}\n"
            "Education: {education}\n"
            "Projects: {projects}\n"
        )

        # Attempt structured output via LangChain native support
        try:
            structured_llm = llm.with_structured_output(CareerRecommendationResponse)
            prompt = ChatPromptTemplate.from_messages([
                ("system", system_instruction),
                ("human", human_message)
            ])
            chain = prompt | structured_llm
            result = await chain.ainvoke({
                "skills": ", ".join(profile.skills) if profile.skills else "None specified",
                "soft_skills": ", ".join(profile.softSkills) if profile.softSkills else "None specified",
                "interests": ", ".join(profile.interests) if profile.interests else "None specified",
                "experience_level": profile.experienceLevel or "Fresher",
                "target_role": profile.targetRole or "Not specified",
                "education": profile.education or "Not specified",
                "projects": ", ".join(profile.projects) if profile.projects else "None specified",
            })
            
            if isinstance(result, CareerRecommendationResponse):
                return result
            elif isinstance(result, dict):
                return CareerRecommendationResponse(**result)
        except Exception as struct_err:
            logger.warning(f"Structured output call failed, attempting Pydantic parser fallback: {str(struct_err)}")

        # Fallback with Pydantic parser
        parser = PydanticOutputParser(pydantic_object=CareerRecommendationResponse)
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_instruction + "\n\n{format_instructions}"),
            ("human", human_message)
        ])
        chain = prompt | llm
        raw_response = await chain.ainvoke({
            "skills": ", ".join(profile.skills) if profile.skills else "None specified",
            "soft_skills": ", ".join(profile.softSkills) if profile.softSkills else "None specified",
            "interests": ", ".join(profile.interests) if profile.interests else "None specified",
            "experience_level": profile.experienceLevel or "Fresher",
            "target_role": profile.targetRole or "Not specified",
            "education": profile.education or "Not specified",
            "projects": ", ".join(profile.projects) if profile.projects else "None specified",
            "format_instructions": parser.get_format_instructions()
        })

        content = raw_response.content if hasattr(raw_response, 'content') else str(raw_response)
        
        # Strip markdown json code block fences if present
        cleaned_content = content.strip()
        if cleaned_content.startswith("```"):
            lines = cleaned_content.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned_content = "\n".join(lines).strip()

        parsed_obj = parser.parse(cleaned_content)
        return parsed_obj

    except Exception as e:
        logger.error(f"Gemini AI error in career_service ({str(e)}). Switching to intelligent rule-based fallback.")
        return generate_fallback_career_recommendations(profile)

