import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('rn_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rn_token');
      localStorage.removeItem('rn_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───────────────────────────────────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser    = (data) => API.post('/auth/login', data);
export const getMe        = ()     => API.get('/auth/me');

// ─── Chefs ──────────────────────────────────────────────────────────────
export const getAllChefs    = ()         => API.get('/chefs');
export const getChefById   = (id)       => API.get(`/chefs/${id}`);
export const updateProfile = (formData) => API.put('/chefs/profile/update', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// ─── Recipes ─────────────────────────────────────────────────────────────
export const getAllRecipes     = (params)    => API.get('/recipes', { params });
export const getRecipeById     = (id)        => API.get(`/recipes/${id}`);
export const getMyRecipes      = ()          => API.get('/recipes/chef/my-recipes');
export const createRecipe      = (formData)  => API.post('/recipes', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateRecipe      = (id, data)  => API.put(`/recipes/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteRecipe      = (id)        => API.delete(`/recipes/${id}`);
export const toggleLikeRecipe  = (id)        => API.post(`/recipes/${id}/like`);

// ─── Admin ───────────────────────────────────────────────────────────────
export const getAdminStats       = ()    => API.get('/admin/stats');
export const getAdminUsers       = ()    => API.get('/admin/users');
export const getAdminRecipes     = ()    => API.get('/admin/recipes');
export const toggleUserStatus    = (id)  => API.put(`/admin/users/${id}/toggle`);
export const deleteUser          = (id)  => API.delete(`/admin/users/${id}`);
export const adminDeleteRecipe   = (id)  => API.delete(`/admin/recipes/${id}`);
export const adminToggleRecipe   = (id)  => API.put(`/admin/recipes/${id}/toggle`);

export default API;
