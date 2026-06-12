import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * REST Route Guard: Protects endpoints by verifying cookie-based JWT sessions.
 */
export const protect = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Please log in to your account.' 
      });
    }

    // Verify user JWT token against current server secret key
    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // Attach decoded user information: id, email, name
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(451).clearCookie('token').json({ 
      success: false, 
      message: 'Your session has expired. Please log in again.' 
    });
  }
};
