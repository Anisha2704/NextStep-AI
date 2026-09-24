import dotenv from 'dotenv';
dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:8000';

/**
 * Sends a student profile payload to the FastAPI AI microservice for career recommendations.
 * @param {Object} profilePayload - Formatted career profile request.
 * @returns {Promise<Object>} Career recommendation response from FastAPI.
 */
export const getCareerRecommendations = async (profilePayload) => {
  const url = `${AI_SERVICE_URL}/api/ai/career/recommend`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profilePayload),
      signal: AbortSignal.timeout(20000), // 20-second timeout for AI completion
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseErr) {
        errorData = { message: response.statusText };
      }

      console.error(`FastAPI AI service returned status ${response.status}:`, errorData);

      const error = new Error(
        errorData.detail?.message || errorData.detail || errorData.message || 'AI service request failed.'
      );
      error.statusCode = response.status >= 500 ? 503 : response.status;
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('FastAPI AI service request timed out after 20s');
      const error = new Error('AI service request timed out.');
      error.statusCode = 504;
      throw error;
    }

    if (err.statusCode) {
      throw err;
    }

    console.error('Failed to communicate with FastAPI AI service:', err.message);
    const error = new Error('AI service is currently unavailable.');
    error.statusCode = 503;
    throw error;
  }
};

/**
 * Sends a student profile payload to the FastAPI AI microservice for Skill Gap Analysis.
 * @param {Object} profilePayload - Formatted skill gap request with targetRole.
 * @returns {Promise<Object>} Skill gap response from FastAPI.
 */
export const analyzeSkillGap = async (profilePayload) => {
  const url = `${AI_SERVICE_URL}/api/ai/skill-gap/analyze`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profilePayload),
      signal: AbortSignal.timeout(25000), // 25-second timeout for AI analysis
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseErr) {
        errorData = { message: response.statusText };
      }

      console.error(`FastAPI AI service returned status ${response.status}:`, errorData);

      const error = new Error(
        errorData.detail?.message || errorData.detail || errorData.message || 'Skill gap analysis failed.'
      );
      error.statusCode = response.status >= 500 ? 503 : response.status;
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('FastAPI Skill Gap analysis timed out after 25s');
      const error = new Error('AI service request timed out.');
      error.statusCode = 504;
      throw error;
    }

    if (err.statusCode) {
      throw err;
    }

    console.error('Failed to communicate with FastAPI AI service:', err.message);
    const error = new Error('AI service is currently unavailable.');
    error.statusCode = 503;
    throw error;
  }
};

