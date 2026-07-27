import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLayout from './layout/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddEditProduct from './pages/AddEditProduct';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Users from './pages/Users';
import Banners from './pages/Banners';
import SpecialOffer from './pages/SpecialOffer';
import Coupons from './pages/Coupons';
import Reviews from './pages/Reviews';
import Newsletters from './pages/Newsletters';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Guard: redirect to login if not authenticated as admin
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0f172a',
      }}>
        <div style={{
          width: '40px', height: '40px',
          border: '3px solid rgba(99,102,241,.3)',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin .7s linear infinite',
        }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Redirect logged-in admin away from login
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
    <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />

    <Route
      path="/"
      element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}
    >
      <Route index element={<Dashboard />} />
      <Route path="products" element={<Products />} />
      <Route path="products/new" element={<AddEditProduct />} />
      <Route path="products/edit/:id" element={<AddEditProduct />} />
      <Route path="categories" element={<Categories />} />
      <Route path="orders" element={<Orders />} />
      <Route path="orders/:id" element={<OrderDetail />} />
      <Route path="users" element={<Users />} />
      <Route path="banners" element={<Banners />} />
      <Route path="special-offer" element={<SpecialOffer />} />
      <Route path="coupons" element={<Coupons />} />
      <Route path="newsletter" element={<Newsletters />} />
      <Route path="reviews" element={<Reviews />} />
    </Route>

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <Router>
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '10px',
            fontSize: '13.5px',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 8px 24px rgba(0,0,0,.12)',
          },
        }}
      />
      <AppRoutes />
    </AuthProvider>
  </Router>
);

export default App;
