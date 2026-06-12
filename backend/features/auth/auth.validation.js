/**
 * Input validations for user registration.
 */
export const validateSignUp = (body) => {
  const { name, email, password } = body;
  if (!name || !name.trim()) return 'Name is required.';
  if (!email || !email.trim()) return 'Email is required.';
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) return 'Please provide a valid email address.';
  
  return null;
};

/**
 * Input validations for login.
 */
export const validateLogin = (body) => {
  const { email, password } = body;
  if (!email || !email.trim()) return 'Email is required.';
  if (!password) return 'Password is required.';
  
  return null;
};
