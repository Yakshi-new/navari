import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const { toggleWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  useEffect(() => {
    if (user) {
      navigate(redirect ? `/${redirect}` : '/');
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      toast.success('Logged in successfully!');
      
      const pendingWishlist = localStorage.getItem('pendingWishlist');
      if (pendingWishlist) {
        localStorage.removeItem('pendingWishlist');
        await toggleWishlist(pendingWishlist);
        toast.success('Item added to your wishlist!');
      }

      const pendingCartStr = localStorage.getItem('pendingCart');
      if (pendingCartStr) {
        try {
          const pendingCart = JSON.parse(pendingCartStr);
          localStorage.removeItem('pendingCart');
          addToCart(
            pendingCart.product,
            pendingCart.quantity || 1,
            pendingCart.size || 'Free Size',
            pendingCart.color || ''
          );
          toast.success(`${pendingCart.product?.name || 'Item'} added to cart!`);
          navigate('/checkout');
          return;
        } catch {
          localStorage.removeItem('pendingCart');
        }
      }

      navigate(redirect ? `/${redirect}` : '/');
    } else {
      toast.error(res.error || 'Invalid credentials');
    }
  };

  return (
    <div className="py-5 bg-light d-flex align-items-center" style={{ minHeight: '80vh' }}>
      <SEO
        title="Login"
        description="Sign in to your Navari account to view orders, manage your wishlist, and checkout."
      />
      <div className="container" style={{ maxWidth: '440px' }}>
        <div className="card shadow border-0 p-4 p-md-5 bg-white rounded">
          
          <div className="text-center mb-4">
            <h1 className="h3 fw-bold text-dark mb-1">Welcome Back</h1>
            <p className="text-muted small">Sign in to your Navari account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Email Address</label>
              <input
                type="email"
                className="form-control form-control-sm"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-semibold text-muted d-flex justify-content-between">
                <span>Password</span>
                <Link to="/forgot-password" className="text-crimson text-decoration-none fw-semibold" style={{ fontSize: '0.8rem' }}>Forgot Password?</Link>
              </label>
              <input
                type="password"
                className="form-control form-control-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn-hero-primary w-100 py-2 mb-3" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <p className="text-center small text-muted mb-0">
              Don't have an account? <Link to={`/register${redirect ? `?redirect=${redirect}` : ''}`} className="text-crimson fw-semibold text-decoration-none">Create Account</Link>
            </p>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
