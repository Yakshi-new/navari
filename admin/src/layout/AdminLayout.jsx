import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navGroups = [
  {
    label: 'Overview',
    links: [
      { path: '/', label: 'Dashboard', icon: 'bi-speedometer2', exact: true },
    ],
  },
  {
    label: 'Catalogue',
    links: [
      { path: '/products', label: 'Products', icon: 'bi-bag-heart' },
      { path: '/categories', label: 'Categories', icon: 'bi-grid-3x3-gap' },
      { path: '/banners', label: 'Banners & Slides', icon: 'bi-images' },
    ],
  },
  {
    label: 'Promotions',
    links: [
      { path: '/special-offer', label: 'Special Offer', icon: 'bi-fire' },
      { path: '/coupons', label: 'Coupons', icon: 'bi-ticket-perforated' },
      { path: '/newsletter', label: 'Newsletter', icon: 'bi-envelope-check' },
    ],
  },
  {
    label: 'Sales',
    links: [
      { path: '/orders', label: 'Orders', icon: 'bi-box-seam' },
    ],
  },
  {
    label: 'Community',
    links: [
      { path: '/users', label: 'Customers', icon: 'bi-people' },
      { path: '/reviews', label: 'Reviews', icon: 'bi-star' },
    ],
  },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'AD';

  return (
    <div className="crm-shell">
      {/* ── SIDEBAR ── */}
      <aside className="crm-sidebar">
        {/* Logo */}
        <div className="crm-sidebar-logo">
          <div className="logo-icon">N</div>
          <div>
            <div className="logo-text">Navari CRM</div>
            <div className="logo-sub">Admin Portal</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="crm-nav">
          {navGroups.map((group) => (
            <React.Fragment key={group.label}>
              <div className="crm-nav-section">{group.label}</div>
              {group.links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`crm-nav-link ${isActive(link.path, link.exact) ? 'active' : ''}`}
                >
                  <i className={`bi ${link.icon}`}></i>
                  <span>{link.label}</span>
                </Link>
              ))}
            </React.Fragment>
          ))}
        </nav>

        {/* Footer */}
        <div className="crm-sidebar-footer">
          <div className="crm-user-chip">
            <div className="crm-user-avatar">{initials}</div>
            <div>
              <div className="crm-user-name">{user?.name || 'Administrator'}</div>
              <div className="crm-user-role">Super Admin</div>
            </div>
          </div>
          <button className="btn-crm-logout" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="crm-main">
        {/* Header */}
        <header className="crm-header">
          <div>
            <div className="crm-header-title">Control Panel</div>
            <div className="crm-header-sub">Welcome back, {user?.name || 'Administrator'}</div>
          </div>
          <div className="crm-header-right">
            <span className="crm-badge-admin">
              <i className="bi bi-shield-check" style={{ marginRight: '5px' }}></i>
              Admin Access
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="crm-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
