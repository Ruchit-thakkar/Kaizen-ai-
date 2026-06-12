import { registerUser, loginUser } from './auth.service.js';

// Secure cookie settings configuration
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

/**
 * Handle new user registration.
 */
export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await registerUser(name, email, password);
    
    // Set secure session cookie
    res.cookie('token', token, cookieOptions);
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Handle user login authentication.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser(email, password);

    // Set secure session cookie
    res.cookie('token', token, cookieOptions);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

/**
 * Handle user session logout.
 */
export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

/**
 * Get currently authenticated user details.
 */
export const getMe = (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};
