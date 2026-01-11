const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = (req, res, next) => {
  try {
    const token = req.headers['authorization'];
    
    console.log('=== AUTH MIDDLEWARE DEBUG ===');
    console.log('All headers:', req.headers);
    console.log('Authorization header:', token);
    console.log('Token type:', typeof token);
    console.log('Token length:', token ? token.length : 0);
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }
    
    const decoded = jwt.verify(token, 'secretkey');
    console.log('Decoded token:', decoded);
    
    User.findByPk(decoded.userId).then(user => {
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      req.user = user;
      next();
    }).catch(err => { 
      throw new Error(err);
    });
    
  } catch(err) {
    console.log('Auth error:', err.message);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
}

module.exports = { authenticate };