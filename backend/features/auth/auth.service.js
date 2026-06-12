import jwt from 'jsonwebtoken';
import User from '../user/user.model.js';
import env from '../../config/env.js';

/**
 * Generates a signed JWT session token for the user.
 * @param {Object} user - User document
 * @returns {string} Signed JWT
 */
export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    env.JWT_SECRET,
    { expiresIn: '7d' } // 7-day session token duration
  );
};

/**
 * Register a new user in MongoDB.
 */
export const registerUser = async (name, email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('An account with this email address already exists.');
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    },
    token
  };
};

/**
 * Authenticate user email and password.
 */
export const loginUser = async (email, password) => {
  // Retrieve user matching email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  // Compare candidate password with stored hash
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password.');
  }

  const token = generateToken(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    },
    token
  };
};
