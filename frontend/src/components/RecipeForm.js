import React, { useState, useEffect } from 'react';
import './RecipeForm.css';

const CATEGORIES   = ['Breakfast','Lunch','Dinner','Dessert','Snack','Beverage','Other'];
const DIFFICULTIES = ['Easy','Medium','Hard'];

export default function RecipeForm({ initialData = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    title:        initialData.title        || '',
    description:  initialData.description  || '',
    category:     initialData.category     || 'Other',
    cuisine:      initialData.cuisine      || '',
    prepTime:     initialData.prepTime     || '',
    cookTime:     initialData.cookTime     || '',
    servings:     initialData.servings     || '',
    difficulty:   initialData.difficulty   || 'Easy',
    tags:         initialData.tags?.join(', ') || '',
    ingredients:  initialData.ingredients  || [''],
    instructions: initialData.instructions?.map(i => i.text) || [''],
    image:        null
  });

  const [preview, setPreview] = useState(
    initialData.image ? `http://localhost:5000${initialData.image}` : null
  );

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  // Ingredients helpers
  const updateIngredient = (idx, val) => {
    const updated = [...form.ingredients];
    updated[idx] = val;
    set('ingredients', updated);
  };
  const addIngredient    = () => set('ingredients', [...form.ingredients, '']);
  const removeIngredient = (idx) => set('ingredients', form.ingredients.filter((_, i) => i !== idx));

  // Instructions helpers
  const updateInstruction = (idx, val) => {
    const updated = [...form.instructions];
    updated[idx] = val;
    set('instructions', updated);
  };
  const addInstruction    = () => set('instructions', [...form.instructions, '']);
  const removeInstruction = (idx) => set('instructions', form.instructions.filter((_, i) => i !== idx));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      set('image', file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title',       form.title);
    formData.append('description', form.description);
    formData.append('category',    form.category);
    formData.append('cuisine',     form.cuisine);
    formData.append('prepTime',    form.prepTime);
    formData.append('cookTime',    form.cookTime);
    formData.append('servings',    form.servings);
    formData.append('difficulty',  form.difficulty);

    const filteredIngredients = form.ingredients.filter(i => i.trim());
    const filteredInstructions = form.instructions
      .filter(s => s.trim())
      .map((text, idx) => ({ step: idx + 1, text }));

    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);

    formData.append('ingredients',  JSON.stringify(filteredIngredients));
    formData.append('instructions', JSON.stringify(filteredInstructions));
    formData.append('tags',         JSON.stringify(tags));

    if (form.image) formData.append('image', form.image);

    onSubmit(formData);
  };

  return (
    <form className="recipe-form" onSubmit={handleSubmit}>
      {/* Basic Info */}
      <div className="rf-section">
        <h4 className="rf-section-title">Basic Information</h4>
        <div className="form-group">
          <label className="form-label">Recipe Title *</label>
          <input
            className="form-input"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="e.g. Classic Spaghetti Carbonara"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-input form-textarea"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Briefly describe your recipe..."
          />
        </div>
        <div className="rf-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input form-select" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Difficulty</label>
            <select className="form-input form-select" value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cuisine</label>
            <input className="form-input" value={form.cuisine} onChange={e => set('cuisine', e.target.value)} placeholder="e.g. Italian" />
          </div>
        </div>
        <div className="rf-row">
          <div className="form-group">
            <label className="form-label">Prep Time (min)</label>
            <input className="form-input" type="number" min="0" value={form.prepTime} onChange={e => set('prepTime', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Cook Time (min)</label>
            <input className="form-input" type="number" min="0" value={form.cookTime} onChange={e => set('cookTime', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Servings</label>
            <input className="form-input" type="number" min="1" value={form.servings} onChange={e => set('servings', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Tags (comma-separated)</label>
          <input className="form-input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="italian, pasta, quick" />
        </div>
      </div>

      {/* Image */}
      <div className="rf-section">
        <h4 className="rf-section-title">Recipe Photo</h4>
        <div className="image-upload-area">
          {preview && <img src={preview} alt="preview" className="image-preview" />}
          <label className="image-upload-label">
            <input type="file" accept="image/*" onChange={handleImageChange} hidden />
            <span>📷 {preview ? 'Change Photo' : 'Upload Photo'}</span>
          </label>
        </div>
      </div>

      {/* Ingredients */}
      <div className="rf-section">
        <h4 className="rf-section-title">Ingredients</h4>
        {form.ingredients.map((ing, idx) => (
          <div key={idx} className="dynamic-row">
            <input
              className="form-input"
              value={ing}
              onChange={e => updateIngredient(idx, e.target.value)}
              placeholder={`Ingredient ${idx + 1}`}
            />
            {form.ingredients.length > 1 && (
              <button type="button" className="remove-btn" onClick={() => removeIngredient(idx)}>✕</button>
            )}
          </div>
        ))}
        <button type="button" className="add-dynamic-btn" onClick={addIngredient}>+ Add Ingredient</button>
      </div>

      {/* Instructions */}
      <div className="rf-section">
        <h4 className="rf-section-title">Instructions</h4>
        {form.instructions.map((step, idx) => (
          <div key={idx} className="dynamic-row instruction-row">
            <span className="step-num">{idx + 1}</span>
            <textarea
              className="form-input form-textarea"
              value={step}
              onChange={e => updateInstruction(idx, e.target.value)}
              placeholder={`Step ${idx + 1}...`}
              style={{ minHeight: 70 }}
            />
            {form.instructions.length > 1 && (
              <button type="button" className="remove-btn" onClick={() => removeInstruction(idx)}>✕</button>
            )}
          </div>
        ))}
        <button type="button" className="add-dynamic-btn" onClick={addInstruction}>+ Add Step</button>
      </div>

      {/* Actions */}
      <div className="rf-actions">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : (initialData._id ? 'Update Recipe' : 'Create Recipe')}
        </button>
      </div>
    </form>
  );
}
