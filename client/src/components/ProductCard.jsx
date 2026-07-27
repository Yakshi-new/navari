import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `http://localhost:5000${imagePath}`;
    if (imagePath.startsWith('/images')) return imagePath;
    if (imagePath.startsWith('/')) return `http://localhost:5000${imagePath}`;
    return `http://localhost:5000/${imagePath}`;
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      localStorage.setItem(
        'pendingCart',
        JSON.stringify({ product, quantity: 1, size: 'Free Size', color: '' })
      );
      toast.error('Please sign in to add items to your cart & proceed to checkout');
      navigate('/login?redirect=checkout');
      return;
    }
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
    navigate('/checkout');
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    const res = await toggleWishlist(product._id);
    if (res && res.success) {
      if (res.action === 'added') {
        toast.success('Added to wishlist!');
      } else {
        toast.success('Removed from wishlist!');
      }
    } else if (res && res.requireLogin) {
      localStorage.setItem('pendingWishlist', product._id);
      toast.error('Please login to add items to your wishlist');
      navigate('/login');
    } else if (res) {
      toast.error(res.error);
    }
  };

  const discountPercent = product.discountPrice > 0 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
    : 0;

  const currentPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  return (
    <div className="product-card h-100 d-flex flex-column cursor-pointer" onClick={() => navigate(`/product/${product.slug || product._id}`)}>
      <div className="product-img-wrap">
        <img src={getImageUrl(product.images[0])} alt={product.name} className="img-fluid" />
        
        <div className="product-badges">
          {product.isNew && <span className="badge-new">NEW</span>}
          {product.isSale && <span className="badge-sale">SALE</span>}
          {product.stock <= 0 && <span className="badge bg-danger text-white">OUT OF STOCK</span>}
        </div>

        <div className="product-actions">
          <button className="product-action-btn" onClick={handleWishlistToggle} aria-label="Toggle Wishlist">
            <i className={`bi ${isInWishlist(product._id) ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
          </button>
          <button className="product-action-btn" onClick={() => navigate(`/product/${product.slug || product._id}`)} aria-label="Quick View">
            <i className="bi bi-eye"></i>
          </button>
        </div>
      </div>

      <div className="product-body d-flex flex-column flex-grow-1">
        <div className="product-category">{product.category?.name || 'Ethnic Wear'}</div>
        <h3 className="product-name fs-6 text-truncate mb-1">{product.name}</h3>
        
        <div className="product-rating">
          <span className="stars">
            {[...Array(5)].map((_, i) => (
              <i key={i} className={`bi ${i < Math.floor(product.ratingsAverage || 0) ? 'bi-star-fill' : 'bi-star'}`}></i>
            ))}
          </span>
          <span className="rating-count">({product.ratingsCount || 0})</span>
        </div>

        <div className="product-price mt-auto">
          <span className="price-current">₹{currentPrice.toLocaleString('en-IN')}</span>
          {product.discountPrice > 0 && (
            <>
              <span className="price-original">₹{product.price.toLocaleString('en-IN')}</span>
              <span className="price-discount">{discountPercent}% OFF</span>
            </>
          )}
        </div>

        {product.stock > 0 ? (
          <button className="btn-add-cart mt-2" onClick={handleAddToCart}>
            <i className="bi bi-bag-plus me-1"></i> Add to Cart
          </button>
        ) : (
          <button className="btn btn-secondary w-100 mt-2 disabled" style={{ borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
