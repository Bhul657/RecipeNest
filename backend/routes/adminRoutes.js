const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const { protect, authorize } = require('../middleware/authMiddleware');

const adminOnly = [protect, authorize('admin')];

// @route   GET /api/admin/stats
// @desc    Get dashboard stats
// @access  Admin only
router.get('/stats', ...adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalChefs, totalFoodLovers, totalRecipes] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'chef' }),
      User.countDocuments({ role: 'foodlover' }),
      Recipe.countDocuments()
    ]);

    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentRecipes = await Recipe.find()
      .populate('chef', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: { totalUsers, totalChefs, totalFoodLovers, totalRecipes },
      recentUsers,
      recentRecipes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin only
router.get('/users', ...adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/toggle
// @desc    Activate or deactivate a user
// @access  Admin only
router.put('/users/:id/toggle', ...adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Admin only
router.delete('/users/:id', ...adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Also delete their recipes if chef
    if (user.role === 'chef') {
      await Recipe.deleteMany({ chef: user._id });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/recipes
// @desc    Get all recipes (including unpublished)
// @access  Admin only
router.get('/recipes', ...adminOnly, async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate('chef', 'name email')
      .sort({ createdAt: -1 });
    res.json({ recipes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/recipes/:id
// @desc    Delete any recipe
// @access  Admin only
router.delete('/recipes/:id', ...adminOnly, async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/recipes/:id/toggle
// @desc    Publish or unpublish a recipe
// @access  Admin only
router.put('/recipes/:id/toggle', ...adminOnly, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    recipe.isPublished = !recipe.isPublished;
    await recipe.save();

    res.json({
      message: `Recipe ${recipe.isPublished ? 'published' : 'unpublished'}`,
      recipe
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
