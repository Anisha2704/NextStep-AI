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
      signal: AbortSignal.timeout(60000), // 60-second timeout for AI completion
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
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      console.error('FastAPI AI service request timed out after 60s');
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
      signal: AbortSignal.timeout(60000), // 60-second timeout for AI analysis
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
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      console.error('FastAPI Skill Gap analysis timed out after 60s');
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

/** Requests one structured learning roadmap from the existing AI service. */
export const generateLearningRoadmap = async (profilePayload) => {
  const url = `${AI_SERVICE_URL}/learning/roadmap/generate`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.AI_SERVICE_INTERNAL_TOKEN
          ? { 'X-AI-Service-Token': process.env.AI_SERVICE_INTERNAL_TOKEN }
          : {}),
      },
      body: JSON.stringify(profilePayload),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      const error = new Error(
        errorData.detail?.message || errorData.detail || errorData.message || 'Roadmap generation failed.'
      );
      error.statusCode = response.status === 504 ? 504 : response.status >= 500 ? 503 : response.status;
      throw error;
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      const error = new Error('Roadmap generation timed out. Please try again.');
      error.statusCode = 504;
      throw error;
    }
    if (err.statusCode) throw err;
    console.error('Failed to communicate with FastAPI learning service:', err.message);
    const error = new Error('Learning roadmap service is currently unavailable.');
    error.statusCode = 503;
    throw error;
  }
};

const resumeServiceError = (statusCode, message) => Object.assign(new Error(message), { statusCode });

const requestResumeService = async (path, options) => {
  const token = process.env.AI_SERVICE_INTERNAL_TOKEN;
  if (!token) throw resumeServiceError(503, 'Resume analysis is currently unavailable.');

  try {
    const response = await fetch(`${AI_SERVICE_URL}${path}`, {
      ...options,
      headers: { ...(options.headers || {}), 'X-AI-Service-Token': token },
      signal: AbortSignal.timeout(60000),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const statusCode = [400, 429, 504].includes(response.status)
        ? response.status
        : response.status >= 500 || response.status === 401 ? 503 : 502;
      throw resumeServiceError(statusCode, statusCode === 429
        ? 'Gemini’s resume-analysis quota has been reached. Try again after it resets or enable billing/increased quota for the Google AI project.'
        : statusCode === 504
          ? 'Resume analysis timed out. Please try again.'
          : statusCode === 400 && typeof payload.detail === 'string'
            ? payload.detail
            : 'Resume analysis is currently unavailable.');
    }
    return await response.json();
  } catch (error) {
    if (error.statusCode) throw error;
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      throw resumeServiceError(504, 'Resume analysis timed out. Please try again.');
    }
    console.error('Failed to communicate with FastAPI resume service:', error.message);
    throw resumeServiceError(503, 'Resume analysis is currently unavailable.');
  }
};

export const analyzeResumeText = async ({ resumeText, targetRole }) => requestResumeService('/resume/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ resumeText, targetRole }),
});

export const analyzeResumeFile = async ({ fileBuffer, fileName, contentType, targetRole }) => {
  const form = new FormData();
  form.append('file', new Blob([fileBuffer], { type: contentType }), fileName);
  form.append('targetRole', targetRole || '');
  return requestResumeService('/resume/analyze-file', { method: 'POST', body: form });
};

