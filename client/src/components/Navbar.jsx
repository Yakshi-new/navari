import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import API from '../services/api';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get('/categories');
        if (data.success) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error('Error fetching navbar categories', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Group categories into Main Categories (parent is null) with their subcategories
  const mainCategories = categories.filter((c) => !c.parent);

  // Default hardcoded fallback in case DB categories are not loaded yet
  const defaultCategories = [
    {
      name: 'Sarees',
      subcategories: ['Silk Sarees', 'Banarasi Sarees', 'Chiffon Sarees', 'Cotton Sarees', 'Kanjivaram Sarees', 'Designer Sarees'],
    },
    {
      name: 'Lehengas',
      subcategories: ['Bridal Lehengas', 'Party Wear', 'Indo-Western', 'Festive Lehengas'],
    },
    {
      name: 'Kurtis & Suits',
      subcategories: ['Anarkali Suits', 'Salwar Kameez', 'Straight Kurtis', 'Palazzo Sets', 'Sharara Suits'],
    },
  ];

  return (
    <>
      <header className="top-header" id="mainHeader">
        <div className="container">
          <div className="d-flex align-items-center gap-4 flex-wrap">
            <Link to="/" className="text-decoration-none flex-shrink-0">
              <div className="brand-logo">Navari</div>
              <div className="brand-tagline">Premium Women's Fashion</div>
            </Link>

            <form onSubmit={handleSearchSubmit} className="search-bar flex-grow-1 d-none d-lg-block">
              <input
                type="text"
                placeholder="Search sarees, lehengas, kurtis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit"><i className="bi bi-search"></i></button>
            </form>

            <div className="header-actions ms-auto">
              <Link to="/wishlist" className="action-btn text-decoration-none">
                <i className="bi bi-heart"></i>
                <span>Wishlist</span>
                {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
              </Link>

              <Link to="/cart" className="action-btn text-decoration-none">
                <i className="bi bi-bag"></i>
                <span>Cart</span>
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </Link>

              {user ? (
                <div className="dropdown">
                  <button className="action-btn dropdown-toggle border-0 bg-transparent" data-bs-toggle="dropdown">
                    <i className="bi bi-person-circle"></i>
                    <span>{user.name.split(' ')[0]}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 p-2">
                    <li><Link className="dropdown-item" to="/profile">My Profile</Link></li>
                    <li><Link className="dropdown-item" to="/orders">My Orders</Link></li>
                    {user.role === 'admin' && (
                      <li><Link className="dropdown-item fw-semibold text-crimson" to="/admin">Admin Panel</Link></li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-danger" onClick={logout}>Logout</button></li>
                  </ul>
                </div>
              ) : (
                <Link to="/login" className="action-btn text-decoration-none">
                  <i className="bi bi-person-circle"></i>
                  <span>Account</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="main-nav navbar navbar-expand-lg py-0">
        <div className="container">
          <button className="navbar-toggler border-0 py-2" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
            <i className="bi bi-list fs-4 text-crimson"></i>
          </button>
          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>

              {/* Dynamic Categories from DB or Fallback */}
              {mainCategories.length > 0
                ? mainCategories.map((mainCat) => {
                    const subCats = categories.filter((c) => {
                      if (!c.parent) return false;
                      const parentId = typeof c.parent === 'object' ? c.parent._id : c.parent;
                      return parentId === mainCat._id;
                    });

                    if (subCats.length > 0) {
                      return (
                        <li key={mainCat._id} className="nav-item dropdown">
                          <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                            {mainCat.name}
                          </a>
                          <ul className="dropdown-menu">
                            <li>
                              <Link className="dropdown-item fw-bold border-bottom" to={`/shop?category=${encodeURIComponent(mainCat.name)}`}>
                                All {mainCat.name}
                              </Link>
                            </li>
                            {subCats.map((sub) => (
                              <li key={sub._id}>
                                <Link
                                  className="dropdown-item"
                                  to={`/shop?category=${encodeURIComponent(mainCat.name)}&subcategory=${encodeURIComponent(sub.name)}`}
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      );
                    }

                    return (
                      <li key={mainCat._id} className="nav-item">
                        <Link className="nav-link" to={`/shop?category=${encodeURIComponent(mainCat.name)}`}>
                          {mainCat.name}
                        </Link>
                      </li>
                    );
                  })
                : defaultCategories.map((cat, idx) => (
                    <li key={idx} className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                        {cat.name}
                      </a>
                      <ul className="dropdown-menu">
                        {cat.subcategories.map((sub, sIdx) => (
                          <li key={sIdx}>
                            <Link
                              className="dropdown-item"
                              to={`/shop?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sub)}`}
                            >
                              {sub}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}

              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">Occasion</a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/shop?occasion=bridal">Bridal Collection</Link></li>
                  <li><Link className="dropdown-item" to="/shop?occasion=festive">Festival Wear</Link></li>
                  <li><Link className="dropdown-item" to="/shop?occasion=party">Party Wear</Link></li>
                  <li><Link className="dropdown-item" to="/shop?occasion=casual">Casual Wear</Link></li>
                  <li><Link className="dropdown-item" to="/shop?occasion=office">Office Wear</Link></li>
                </ul>
              </li>

              <li className="nav-item"><Link className="nav-link" to="/shop?category=Accessories">Accessories</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/shop?sort=new">New Arrivals</Link></li>
              <li className="nav-item"><Link className="nav-link sale-link" to="/shop?sort=sale"><i className="bi bi-tag-fill me-1"></i>Sale</Link></li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
