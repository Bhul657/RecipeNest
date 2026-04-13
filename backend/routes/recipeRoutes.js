const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   GET /api/recipes
// @desc    Get all published recipes (with optional filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search, sort, chef } = req.query;

    const query = { isPublished: true };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (chef) query.chef = chef;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    let sortObj = { createdAt: -1 }; // Default: newest
    if (sort === 'popular')    sortObj = { likesCount: -1 };
    if (sort === 'oldest')     sortObj = { createdAt: 1 };
    if (sort === 'az')         sortObj = { title: 1 };
    if (sort === 'za')         sortObj = { title: -1 };

    const recipes = await Recipe.find(query)
      .populate('chef', 'name profileImage specialty')
      .sort(sortObj);

    res.json({ recipes, count: recipes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/recipes/:id
// @desc    Get a single recipe
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('chef', 'name profileImage specialty bio socialLinks');

    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    res.json({ recipe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/recipes
// @desc    Create a new recipe
// @access  Private (Chef only)
router.post('/', protect, authorize('chef'), upload.single('image'), async (req, res) => {
  try {
    const {
      title, description, ingredients, instructions,
      category, cuisine, prepTime, cookTime, servings, difficulty, tags
    } = req.body;

    if (!title) return res.status(400).json({ message: 'Recipe title is required' });

    // Parse JSON fields if they come as strings
    const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    const parsedInstructions = typeof instructions === 'string' ? JSON.parse(instructions) : instructions;
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;

    const recipe = await Recipe.create({
      title,
      description,
      ingredients: parsedIngredients || [],
      instructions: parsedInstructions || [],
      category,
      cuisine,
      prepTime: Number(prepTime) || 0,
      cookTime: Number(cookTime) || 0,
      servings: Number(servings) || 1,
      difficulty,
      tags: parsedTags || [],
      image: req.file ? `/uploads/${req.file.filename}` : '',
      chef: req.user._id
    });

    await recipe.populate('chef', 'name profileImage');

    res.status(201).json({ message: 'Recipe created successfully', recipe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/recipes/:id
// @desc    Update a recipe
// @access  Private (Chef - own recipes only, or Admin)
router.put('/:id', protect, authorize('chef', 'admin'), upload.single('image'), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    // Check ownership (unless admin)
    if (req.user.role !== 'admin' && recipe.chef.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this recipe' });
    }

    const {
      title, description, ingredients, instructions,
      category, cuisine, prepTime, cookTime, servings, difficulty, tags, isPublished
    } = req.body;

    const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    const parsedInstructions = typeof instructions === 'string' ? JSON.parse(instructions) : instructions;
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;

    const updateData = {
      title, description, category, cuisine,
      prepTime: Number(prepTime) || 0,
      cookTime: Number(cookTime) || 0,
      servings: Number(servings) || 1,
      difficulty,
      isPublished: isPublished !== undefined ? isPublished : recipe.isPublished,
      ingredients: parsedIngredients || recipe.ingredients,
      instructions: parsedInstructions || recipe.instructions,
      tags: parsedTags || recipe.tags
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('chef', 'name profileImage');

    res.json({ message: 'Recipe updated successfully', recipe: updatedRecipe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/recipes/:id
// @desc    Delete a recipe
// @access  Private (Chef - own recipes only, or Admin)
router.delete('/:id', protect, authorize('chef', 'admin'), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    if (req.user.role !== 'admin' && recipe.chef.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this recipe' });
    }

    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/recipes/:id/like
// @desc    Like or unlike a recipe (Food Lover)
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    const userId = req.user._id;
    const alreadyLiked = recipe.likes.includes(userId);

    if (alreadyLiked) {
      recipe.likes.pull(userId);
      // Remove from user's liked recipes
      await User.findByIdAndUpdate(userId, { $pull: { likedRecipes: recipe._id } });
    } else {
      recipe.likes.push(userId);
      // Add to user's liked recipes
      await User.findByIdAndUpdate(userId, { $addToSet: { likedRecipes: recipe._id } });
    }

    recipe.likesCount = recipe.likes.length;
    await recipe.save();

    res.json({
      message: alreadyLiked ? 'Recipe unliked' : 'Recipe liked',
      likesCount: recipe.likesCount,
      liked: !alreadyLiked
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/recipes/chef/my-recipes
// @desc    Get current chef's own recipes
// @access  Private (Chef only)
router.get('/chef/my-recipes', protect, authorize('chef'), async (req, res) => {
  try {
    const recipes = await Recipe.find({ chef: req.user._id }).sort({ createdAt: -1 });
    res.json({ recipes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
