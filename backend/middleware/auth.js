const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const authenticate = (req, res, next) => {
  console.log('🔵 Checking Authorization Header:', req.header('Authorization'));

  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🟢 Token Decoded:', decoded);

    // ❌ Wrong: req.user = decoded;
    // ✅ Fix: Set req.user correctly
    req.user = { id: decoded.userId };

    next();
  } catch (err) {
    console.error('❌ JWT Error:', err.message);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authenticate;
