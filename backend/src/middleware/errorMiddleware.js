import { sendError } from '../utils/response.js';

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

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
  return sendError(res, statusCode, err.message || 'Internal server error');
};

export default errorHandler;
