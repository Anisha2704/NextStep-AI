import logging
import json
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from app.services.gemini_service import get_gemini_model
from app.schemas.career import CareerProfileRequest, CareerRecommendationResponse

logger = logging.getLogger(__name__)


async def generate_career_recommendations(profile: CareerProfileRequest) -> CareerRecommendationResponse:
    """Analyzes a student's profile and generates structured career recommendations using Google Gemini."""
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

    try:
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
        logger.error(f"Error in career_service: {str(e)}")
        raise e
