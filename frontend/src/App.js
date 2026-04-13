import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public pages
import Home        from './pages/Home';
import ChefsList   from './pages/ChefsList';
import ChefProfile from './pages/ChefProfile';
import RecipeList  from './pages/RecipeList';
import RecipeDetail from './pages/RecipeDetail';
import Login       from './pages/Login';
import Register    from './pages/Register';

// Protected pages
import ChefDashboard from './pages/ChefDashboard';
import EditProfile   from './pages/EditProfile';
import FoodLoverDashboard from './pages/FoodLoverDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Route guards
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user)   return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 130px)' }}>
        <Routes>
          {/* Public */}
          <Route path="/"          element={<Home />} />
          <Route path="/chefs"     element={<ChefsList />} />
          <Route path="/chefs/:id" element={<ChefProfile />} />
          <Route path="/recipes"   element={<RecipeList />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/login"     element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register"  element={user ? <Navigate to="/" /> : <Register />} />

          {/* Chef protected */}
          <Route path="/dashboard" element={
            <PrivateRoute roles={['chef']}>
              <ChefDashboard />
            </PrivateRoute>
          } />
          <Route path="/edit-profile" element={
            <PrivateRoute roles={['chef']}>
              <EditProfile />
            </PrivateRoute>
          } />

          {/* Food Lover protected */}
          <Route path="/my-favourites" element={
            <PrivateRoute roles={['foodlover']}>
              <FoodLoverDashboard />
            </PrivateRoute>
          } />

          {/* Admin protected */}
          <Route path="/admin" element={
            <PrivateRoute roles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}