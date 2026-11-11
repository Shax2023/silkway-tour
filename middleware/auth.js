const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'silkway_uzbekistan_admin_secret_key_2026_x89';

function requireAdminAuth(req, res, next) {
  let token = null;

  // Check Authorization Header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.headers['x-admin-token']) {
    token = req.headers['x-admin-token'];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Kirish taqiqlangan: Admin avtorizatsiyasi talab etiladi (Access Denied: Admin authorization required)'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: 'Yaroqsiz yoki muddati o\'tgan admin sessiyasi (Invalid or expired token)'
    });
  }
}

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

module.exports = {
  requireAdminAuth,
  generateToken,
  JWT_SECRET
};
