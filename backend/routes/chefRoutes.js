const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   GET /api/chefs
// @desc    Get all chefs (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const chefs = await User.find({ role: 'chef', isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });

    // Attach recipe count to each chef
    const chefsWithCount = await Promise.all(chefs.map(async (chef) => {
      const recipeCount = await Recipe.countDocuments({ chef: chef._id, isPublished: true });
      return { ...chef.toObject(), recipeCount };
    }));

    res.json({ chefs: chefsWithCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/chefs/:id
// @desc    Get a single chef profile
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const chef = await User.findOne({ _id: req.params.id, role: 'chef' }).select('-password');
    if (!chef) return res.status(404).json({ message: 'Chef not found' });

    const recipes = await Recipe.find({ chef: chef._id, isPublished: true }).sort({ createdAt: -1 });

    res.json({ chef, recipes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/chefs/profile
// @desc    Update chef's own profile
// @access  Private (Chef only)
router.put('/profile/update', protect, authorize('chef'), upload.single('profileImage'), async (req, res) => {
  try {
    const { name, bio, specialty, instagram, twitter, youtube } = req.body;

    const updateData = {
      name,
      bio,
      specialty,
      socialLinks: { instagram, twitter, youtube }
    };

    if (req.file) {
      updateData.profileImage = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
