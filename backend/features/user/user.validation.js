/**
 * Validates updates made to the user's profile.
 */
export const validateUpdateProfile = (body) => {
  const { name } = body;
  if (name !== undefined && !name.trim()) {
    return 'Name cannot be empty.';
  }
  return null;
};
