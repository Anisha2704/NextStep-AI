import * as userService from '../services/userService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getProfile(req.user._id);
    return sendSuccess(res, 200, 'Profile retrieved', { user: profile });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const profile = await userService.updateProfile(req.user._id, req.body);
    return sendSuccess(res, 200, 'Profile updated', { user: profile });
  } catch (error) {
    next(error);
  }
};

export const addSkill = async (req, res, next) => {
  try {
    const { name, category, proficiency, yearsOfExperience } = req.body;
    if (!name?.trim()) {
      return sendError(res, 400, 'Skill name is required');
    }

    const skill = await userService.addSkill(req.user._id, {
      name: name.trim(),
      category: category || '',
      proficiency: proficiency || 'Beginner',
      yearsOfExperience: yearsOfExperience || 0,
    });

    return sendSuccess(res, 201, 'Skill added', { skill });
  } catch (error) {
    next(error);
  }
};

export const updateSkill = async (req, res, next) => {
  try {
    const skill = await userService.updateSkill(req.user._id, req.params.skillId, req.body);
    return sendSuccess(res, 200, 'Skill updated', { skill });
  } catch (error) {
    next(error);
  }
};

export const deleteSkill = async (req, res, next) => {
  try {
    await userService.deleteSkill(req.user._id, req.params.skillId);
    return sendSuccess(res, 200, 'Skill deleted');
  } catch (error) {
    next(error);
  }
};

export const addProject = async (req, res, next) => {
  try {
    const { name, description, technologies, githubUrl, liveUrl, role } = req.body;
    if (!name?.trim()) {
      return sendError(res, 400, 'Project name is required');
    }

    const project = await userService.addProject(req.user._id, {
      name: name.trim(),
      description: description || '',
      technologies: technologies || [],
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      role: role || '',
    });

    return sendSuccess(res, 201, 'Project added', { project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await userService.updateProject(
      req.user._id,
      req.params.projectId,
      req.body
    );
    return sendSuccess(res, 200, 'Project updated', { project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    await userService.deleteProject(req.user._id, req.params.projectId);
    return sendSuccess(res, 200, 'Project deleted');
  } catch (error) {
    next(error);
  }
};

export const addCertification = async (req, res, next) => {
  try {
    const { name, provider, issueDate, credentialUrl } = req.body;
    if (!name?.trim()) {
      return sendError(res, 400, 'Certification name is required');
    }

    const certification = await userService.addCertification(req.user._id, {
      name: name.trim(),
      provider: provider || '',
      issueDate: issueDate || null,
      credentialUrl: credentialUrl || '',
    });

    return sendSuccess(res, 201, 'Certification added', { certification });
  } catch (error) {
    next(error);
  }
};

export const deleteCertification = async (req, res, next) => {
  try {
    await userService.deleteCertification(req.user._id, req.params.certificationId);
    return sendSuccess(res, 200, 'Certification deleted');
  } catch (error) {
    next(error);
  }
};
