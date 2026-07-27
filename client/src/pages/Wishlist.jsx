import React, { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';

const Wishlist = () => {
  const { wishlist } = useContext(WishlistContext);
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <SEO title="My Wishlist" description="Please sign in to view your wishlist." />
        <div className="py-5">
          <i className="bi bi-person-lock fs-1 text-crimson mb-3 d-block"></i>
          <h2 className="h4 fw-bold text-dark mb-2">Please Sign In</h2>
          <p className="text-muted mb-4 small">Sign in to your Navari account to view and manage your saved wishlist items.</p>
          <Link to="/login?redirect=wishlist" className="btn btn-hero-primary">Sign In to Wishlist</Link>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="container py-5 text-center">
        <SEO title="My Wishlist" description="Your wishlist is empty." />
        <div className="py-5">
          <i className="bi bi-heart fs-1 text-crimson mb-3 d-block"></i>
          <h2 className="h4 fw-bold text-dark mb-2">Your Wishlist is Empty</h2>
          <p className="text-muted mb-4 small">Save your favorite Indian handloom items here to buy them later.</p>
          <a href="/shop" className="btn btn-hero-primary">Start Exploring</a>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5 bg-light">
      <SEO title="My Wishlist" description="View and manage your saved items at Navari." />
      <div className="container">
        <h1 className="h3 fw-bold text-dark mb-4">My Wishlist</h1>
        <div className="row g-4">
          {wishlist.map((prod) => (
            <div key={prod._id} className="col-lg-3 col-md-4 col-sm-6">
              <ProductCard product={prod} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
