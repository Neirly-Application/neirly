const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) throw new Error('No token provided');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error('User not found');
    if (user.forceLogout) {
      res.clearCookie('token');
      throw new Error('Force logout');
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Not authorized' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    const roles = req.user?.roles;

    if (!roles || (Array.isArray(roles) && !roles.includes(role)) || (!Array.isArray(roles) && roles !== role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient role.' });
    }

    next();
  };
}


module.exports = { authMiddleware, requireRole };