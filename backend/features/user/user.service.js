import User from './user.model.js';

/**
 * Fetch user details by Mongo Object ID (omitting password).
 */
export const getUserById = async (id) => {
  return await User.findById(id).select('-password');
};

/**
 * Update user details in MongoDB.
 */
export const updateUserProfile = async (id, data) => {
  const allowedUpdates = {};
  if (data.name) allowedUpdates.name = data.name;

  return await User.findByIdAndUpdate(
    id, 
    { $set: allowedUpdates }, 
    { new: true }
  ).select('-password');
};
