import { sendError } from '../utils/response.js';

const errorHandler = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'Malformed JSON request body');
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 400, 'Validation failed', messages);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, 400, `${field} already exists`);
  }

  if (err.name === 'CastError') {
    return sendError(res, 400, 'Invalid ID format');
  }

  const statusCode = err.statusCode || err.status || 500;
  if (statusCode >= 500) {
    console.error(err.stack);
    return sendError(res, 500, 'Internal server error');
  }
  return sendError(res, statusCode, err.message || 'Request failed');
};

export default errorHandler;
