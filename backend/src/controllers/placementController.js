import { sendSuccess } from '../utils/response.js';
import { evaluatePlacementReadiness, getPlacementReadiness } from '../services/placementReadinessService.js';

export const getPlacementReadinessController = async (req, res, next) => {
  try {
    const readiness = await getPlacementReadiness(req.user._id);
    return sendSuccess(res, 200, 'Placement readiness retrieved', { readiness });
  } catch (error) { return next(error); }
};

export const evaluatePlacementReadinessController = async (req, res, next) => {
  try {
    const readiness = await evaluatePlacementReadiness(req.user);
    return sendSuccess(res, 201, 'Placement readiness evaluated', { readiness });
  } catch (error) { return next(error); }
};
