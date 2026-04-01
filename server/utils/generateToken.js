const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token
 * @param {string} id - User's MongoDB ObjectId
 * @param {string} role - User's role (student | mentor | admin)
 * @param {string} fullName - User's full name
 * @returns {string} Signed JWT
 */
const generateToken = (id, role, fullName) => {
  return jwt.sign(
    { id, role, fullName },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = generateToken;
