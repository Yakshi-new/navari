import React, { useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/admin', label: 'Dashboard', icon: 'bi-speedometer2' },
    { path: '/admin/products', label: 'Products', icon: 'bi-bag-heart' },
    { path: '/admin/categories', label: 'Categories', icon: 'bi-grid-3x3-gap' },
    { path: '/admin/orders', label: 'Orders', icon: 'bi-box-seam' },
    { path: '/admin/users', label: 'Users', icon: 'bi-people' },
    { path: '/admin/banners', label: 'Banners & Slides', icon: 'bi-images' },
    { path: '/admin/coupons', label: 'Coupons', icon: 'bi-ticket-perforated' },
    { path: '/admin/reviews', label: 'Reviews', icon: 'bi-star' },
  ];

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar shadow-sm">
        <div className="sidebar-heading">
          <span>Vastra Admin</span>
        </div>
        <nav className="nav flex-column flex-grow-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              <i className={`bi ${link.icon}`}></i>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-4 mt-auto">
          <Link to="/" className="btn btn-outline-light w-100 btn-sm mb-2" style={{ fontSize: '0.8rem' }}>
            <i className="bi bi-shop me-1"></i> Visit Shop
          </Link>
          <button className="btn btn-danger w-100 btn-sm" onClick={handleLogout} style={{ fontSize: '0.8rem' }}>
            <i className="bi bi-box-arrow-right me-1"></i> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h2 className="h4 fw-bold text-dark mb-0">Control Panel</h2>
            <span className="text-muted small">Welcome, {user?.name || 'Administrator'}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-danger">Admin Portal</span>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
