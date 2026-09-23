import logging
from typing import List, Dict, Any
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from app.services.gemini_service import get_gemini_model
from app.schemas.skill_gap import SkillGapRequest, SkillGapResponse, SkillGapItem

logger = logging.getLogger(__name__)


ROLE_TEMPLATES: Dict[str, List[Dict[str, Any]]] = {
    "full stack developer": [
        {
            "skill": "React.js & Frontend State Management",
            "aliases": ["react", "react.js", "redux", "frontend"],
            "reason": "Essential for building interactive, scalable client-side user interfaces.",
            "whatToLearn": ["React Hooks", "Redux Toolkit / Context API", "Component Lifecycle & Performance"],
            "nextSteps": ["Build a full-stack dashboard with dynamic React components", "Optimize re-renders using useMemo and useCallback"]
        },
        {
            "skill": "Node.js & Express API Backend",
            "aliases": ["node", "node.js", "express", "backend"],
            "reason": "Core requirement for creating RESTful microservices and server-side application logic.",
            "whatToLearn": ["Express Routing & Middleware", "JWT Authentication", "Async/Await & Error Handling"],
            "nextSteps": ["Develop secure authentication middleware", "Implement robust request validation with Joi or Zod"]
        },
        {
            "skill": "Database Management (MongoDB / PostgreSQL)",
            "aliases": ["mongodb", "sql", "postgresql", "mongoose", "database"],
            "reason": "Crucial for persistent data storage, schema design, and performant query aggregation.",
            "whatToLearn": ["Schema Design & Indexing", "MongoDB Aggregation Pipelines / SQL Joins", "ORM/ODM Mongoose Patterns"],
            "nextSteps": ["Design a relational or document database schema for a project", "Add indexes to optimize frequent queries"]
        },
        {
            "skill": "RESTful & GraphQL API Design",
            "aliases": ["rest", "rest api", "graphql", "api"],
            "reason": "Standard protocol for seamless data communication between frontend and backend services.",
            "whatToLearn": ["HTTP Verbs & Status Codes", "API Pagination & Filtering", "OpenAPI / Swagger Documentation"],
            "nextSteps": ["Document endpoints with Postman or Swagger", "Build pagination and filtering for list APIs"]
        },
        {
            "skill": "Git & Collaborative Version Control",
            "aliases": ["git", "github", "version control"],
            "reason": "Mandatory industry skill for code management, team collaboration, and CI/CD integration.",
            "whatToLearn": ["Feature Branching Workflows", "Rebase & Conflict Resolution", "Pull Request Reviews"],
            "nextSteps": ["Maintain clean commit history with feature branches", "Set up GitHub Actions for automated linting"]
        },
        {
            "skill": "System Design & Deployment (Docker / AWS)",
            "aliases": ["docker", "system design", "aws", "deployment", "devops"],
            "reason": "Key requirement for scaling applications and containerizing services for production.",
            "whatToLearn": ["Dockerizing Node/React Apps", "Caching with Redis", "Environment & Cloud Configuration"],
            "nextSteps": ["Containerize frontend and backend using Docker Compose", "Deploy application on Vercel/Render or AWS"]
        }
    ],
    "frontend engineer": [
        {
            "skill": "Modern JavaScript & TypeScript",
            "aliases": ["javascript", "js", "typescript", "ts"],
            "reason": "Foundation of modern frontend development ensuring type safety and clean code.",
            "whatToLearn": ["ES6+ Features", "TypeScript Interfaces & Generics", "Async Programming & Promises"],
            "nextSteps": ["Migrate JavaScript components to TypeScript", "Implement strict type definitions for API responses"]
        },
        {
            "skill": "React / Next.js Frameworks",
            "aliases": ["react", "next.js", "nextjs", "frontend"],
            "reason": "Industry-standard framework for building server-rendered and single-page web applications.",
            "whatToLearn": ["Next.js App Router", "Server Components & SSR/SSG", "Custom Hooks & State Patterns"],
            "nextSteps": ["Build a Next.js application using Server Side Rendering", "Create reusable UI component libraries"]
        },
        {
            "skill": "Responsive Styling (Tailwind CSS / CSS Grid)",
            "aliases": ["css", "tailwind", "html", "styling"],
            "reason": "Ensures polished, mobile-responsive, and accessible user interfaces across all devices.",
            "whatToLearn": ["Tailwind Utility Classes", "CSS Flexbox & Grid Layouts", "Dark Mode & Glassmorphism Aesthetics"],
            "nextSteps": ["Build a fully responsive layout tailored for mobile, tablet, and desktop", "Implement dark mode theme switching"]
        },
        {
            "skill": "Web Performance & Accessibility (a11y)",
            "aliases": ["performance", "seo", "a11y"],
            "reason": "Critical for SEO, fast page load times, and inclusive user experience.",
            "whatToLearn": ["Core Web Vitals Optimization", "Code Splitting & Lazy Loading", "ARIA Roles & Keyboard Navigation"],
            "nextSteps": ["Audit site performance using Google Lighthouse", "Implement lazy loading for images and heavy components"]
        }
    ],
    "backend engineer": [
        {
            "skill": "Node.js / Python Server Architecture",
            "aliases": ["node", "python", "express", "fastapi", "backend"],
            "reason": "Core runtime environment for high-throughput asynchronous backend services.",
            "whatToLearn": ["Asynchronous Event Loop", "Microservices Architecture", "Scalable Server Structure"],
            "nextSteps": ["Build a modular backend microservice architecture", "Implement centralized log management and monitoring"]
        },
        {
            "skill": "Database Architecture & Query Tuning",
            "aliases": ["sql", "postgresql", "mongodb", "database", "mysql"],
            "reason": "Essential for reliable transactions, complex queries, and high database throughput.",
            "whatToLearn": ["ACID Properties & Transactions", "Query Execution Plans & Indexing", "Database Normalization vs Denormalization"],
            "nextSteps": ["Optimize slow database queries with indexes", "Implement database migrations and connection pooling"]
        },
        {
            "skill": "Security & Authentication Protocols",
            "aliases": ["security", "auth", "jwt", "oauth"],
            "reason": "Protects user data against vulnerabilities like OWASP Top 10, XSS, and SQL Injection.",
            "whatToLearn": ["OAuth2 & OpenID Connect", "JWT Refresh Token Rotation", "Rate Limiting & CORS Configuration"],
            "nextSteps": ["Implement secure JWT authentication with HttpOnly cookies", "Add rate-limiting middleware to express endpoints"]
        },
        {
            "skill": "Docker Containerization & CI/CD",
            "aliases": ["docker", "ci/cd", "kubernetes", "devops"],
            "reason": "Ensures consistent execution environments from development to production deployment.",
            "whatToLearn": ["Dockerfile Optimization", "Docker Compose Multi-container Setup", "Automated CI/CD Pipelines"],
            "nextSteps": ["Create multi-stage Docker builds for small image sizes", "Set up GitHub Actions workflow for automated testing"]
        }
    ],
    "ai web application engineer": [
        {
            "skill": "Python & FastAPI Microservices",
            "aliases": ["python", "fastapi", "backend"],
            "reason": "Primary technology stack for serving AI/ML inference endpoints and asynchronous APIs.",
            "whatToLearn": ["FastAPI Async Endpoints", "Pydantic Schema Validation", "Dependency Injection Patterns"],
            "nextSteps": ["Build asynchronous FastAPI endpoints for AI tasks", "Implement background task processing"]
        },
        {
            "skill": "LLM Integration & Prompt Engineering",
            "aliases": ["llm", "langchain", "openai", "gemini", "prompt engineering", "ai"],
            "reason": "Core competency for connecting language models to web applications and crafting reliable prompts.",
            "whatToLearn": ["LangChain Core & Chains", "Structured JSON Outputs from LLMs", "Prompt Formatting & System Instructions"],
            "nextSteps": ["Implement structured output parsing using Pydantic", "Build robust fallback mechanisms for LLM rate limits"]
        },
        {
            "skill": "Vector Databases & RAG Architecture",
            "aliases": ["vector database", "rag", "embeddings", "pinecone", "chroma"],
            "reason": "Enables context-aware AI applications via semantic search over private documents.",
            "whatToLearn": ["Text Embedding Models", "Vector Similarity Search", "Chunking Strategies & RAG Retrieval"],
            "nextSteps": ["Build a document search chatbot using vector embeddings", "Evaluate retrieval accuracy and latency"]
        }
    ]
}


def generate_fallback_skill_gap_analysis(request: SkillGapRequest) -> SkillGapResponse:
    """Generates a rule-based fallback skill gap analysis when Gemini API is unavailable or rate-limited."""
    target_role_lower = request.targetRole.strip().lower()
    
    # Match role template or use full stack as default
    matched_template = None
    for role_key, template in ROLE_TEMPLATES.items():
        if role_key in target_role_lower or target_role_lower in role_key:
            matched_template = template
            break
            
    if not matched_template:
        matched_template = ROLE_TEMPLATES["full stack developer"]

    user_skills_lower = [s.strip().lower() for s in request.skills]
    user_soft_lower = [s.strip().lower() for s in request.softSkills]
    all_user_skills = set(user_skills_lower + user_soft_lower)

    skill_gaps: List[SkillGapItem] = []

    for item in matched_template:
        aliases = item.get("aliases", [])
        
        # Check if user has this skill or alias
        is_exact_match = any(alias in all_user_skills for alias in aliases)
        is_partial_match = any(any(alias in u_skill for alias in aliases) for u_skill in all_user_skills)

        if is_exact_match:
            status = "Strong"
            priority = "Low"
        elif is_partial_match:
            status = "Needs Improvement"
            priority = "Medium"
        else:
            status = "Missing"
            priority = "High"

        skill_gaps.append(
            SkillGapItem(
                skill=item["skill"],
                status=status,
                priority=priority,
                reason=item["reason"],
                whatToLearn=item["whatToLearn"],
                nextSteps=item["nextSteps"]
            )
        )

    # Build executive summary
    strong_count = sum(1 for g in skill_gaps if g.status == "Strong")
    missing_count = sum(1 for g in skill_gaps if g.status == "Missing")
    needs_imp_count = sum(1 for g in skill_gaps if g.status == "Needs Improvement")

    summary = (
        f"Skill Gap Evaluation for {request.targetRole}: Based on your profile analysis, you possess "
        f"{strong_count} strong matching skills, {needs_imp_count} skills needing refinement, and {missing_count} "
        f"critical skills to acquire. Focus on addressing High Priority missing skills to accelerate your job readiness."
    )

    return SkillGapResponse(
        summary=summary,
        targetRole=request.targetRole,
        currentSkills=request.skills,
        skillGaps=skill_gaps
    )


async def generate_skill_gap_analysis(request: SkillGapRequest) -> SkillGapResponse:
    """Analyzes a student's current skills against a target role using Google Gemini with automatic fallback."""
    try:
        llm = get_gemini_model()

        system_instruction = (
            "You are the Career Skill-Gap Analyst for NextStep AI. Your task is to evaluate a student's current "
            "skill set against the technical and professional requirements of their target career role.\n\n"
            "RULES:\n"
            "1. Compare current skills against typical requirements for the target role: {target_role}.\n"
            "2. Categorize skill statuses strictly as one of: 'Strong', 'Needs Improvement', or 'Missing'.\n"
            "3. Assign priorities strictly as one of: 'High', 'Medium', or 'Low'.\n"
            "4. 'Strong': Skills student possesses that align well with the target role.\n"
            "5. 'Needs Improvement': Skills student has basic knowledge of but needs to deepen for professional readiness.\n"
            "6. 'Missing': Critical or important skills expected for the role that the student currently lacks.\n"
            "7. For every skill item, explain why it matters, what concepts to learn, and actionable next steps.\n"
            "8. Keep advice realistic and encouraging for students/freshers without expecting years of enterprise experience.\n"
        )

        human_message = (
            "Analyze the following profile for the target role '{target_role}':\n\n"
            "Current Technical Skills: {skills}\n"
            "Current Soft Skills: {soft_skills}\n"
            "Experience Level: {experience_level}\n"
            "Education: {education}\n"
            "Completed Projects: {projects}\n"
        )

        # Attempt structured output
        try:
            structured_llm = llm.with_structured_output(SkillGapResponse)
            prompt = ChatPromptTemplate.from_messages([
                ("system", system_instruction),
                ("human", human_message)
            ])
            chain = prompt | structured_llm
            result = await chain.ainvoke({
                "target_role": request.targetRole,
                "skills": ", ".join(request.skills) if request.skills else "None specified",
                "soft_skills": ", ".join(request.softSkills) if request.softSkills else "None specified",
                "experience_level": request.experienceLevel or "Fresher",
                "education": request.education or "Not specified",
                "projects": ", ".join(request.projects) if request.projects else "None specified",
            })

            if isinstance(result, SkillGapResponse):
                return result
            elif isinstance(result, dict):
                return SkillGapResponse(**result)
        except Exception as struct_err:
            logger.warning(f"Structured output call failed for skill gap analysis, falling back to Pydantic parser: {str(struct_err)}")

        # Fallback with Pydantic parser
        parser = PydanticOutputParser(pydantic_object=SkillGapResponse)
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_instruction + "\n\n{format_instructions}"),
            ("human", human_message)
        ])
        chain = prompt | llm
        raw_response = await chain.ainvoke({
            "target_role": request.targetRole,
            "skills": ", ".join(request.skills) if request.skills else "None specified",
            "soft_skills": ", ".join(request.softSkills) if request.softSkills else "None specified",
            "experience_level": request.experienceLevel or "Fresher",
            "education": request.education or "Not specified",
            "projects": ", ".join(request.projects) if request.projects else "None specified",
            "format_instructions": parser.get_format_instructions()
        })

        content = raw_response.content if hasattr(raw_response, 'content') else str(raw_response)
        
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
        logger.error(f"Gemini AI service error/rate limit encountered ({str(e)}). Switching to intelligent rule-based skill gap fallback.")
        return generate_fallback_skill_gap_analysis(request)

