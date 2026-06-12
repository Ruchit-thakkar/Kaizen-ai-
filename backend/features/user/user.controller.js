import { getUserById, updateUserProfile } from './user.service.js';

/**
 * Get current user profile details.
 */
export const getProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update current user profile details.
 */
export const updateProfile = async (req, res) => {
  try {
    const user = await updateUserProfile(req.user.id, req.body);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(550).json({ success: false, message: error.message });
  }
};
