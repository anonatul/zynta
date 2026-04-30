const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

const requireApprovedSeller = (req, res, next) => {
  if (!req.user || req.user.role !== 'seller' || req.user.status !== 'approved') {
    return res.status(403).json({ message: 'Approved seller access required' });
  }
  next();
};

module.exports = { authenticateToken, authorizeRoles, requireApprovedSeller };