const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Recipe title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  instructions: [{
    step: Number,
    text: String
  }],
  category: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverage', 'Other'],
    default: 'Other'
  },
  cuisine: {
    type: String,
    default: ''
  },
  prepTime: {
    type: Number, // minutes
    default: 0
  },
  cookTime: {
    type: Number, // minutes
    default: 0
  },
  servings: {
    type: Number,
    default: 1
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  image: {
    type: String,
    default: ''
  },
  chef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  tags: [String],
  isPublished: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Update likesCount automatically
recipeSchema.pre('save', function(next) {
  this.likesCount = this.likes.length;
  next();
});

module.exports = mongoose.model('Recipe', recipeSchema);
