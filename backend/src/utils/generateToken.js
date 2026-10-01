import jwt from 'jsonwebtoken';

const generateToken = (userId, role, expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

export default generateToken;
