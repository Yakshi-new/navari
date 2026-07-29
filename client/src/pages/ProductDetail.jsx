import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

const ProductDetail = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  /* ── per-action loading states ── */
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/products/${idOrSlug}`);
        if (data.success) {
          setProduct(data.data);
          setActiveImg(data.data.images[0] || '');
          if (data.data.sizes?.length > 0) {
            setSelectedSize(data.data.sizes[0]);
          }
          if (data.data.colors?.length > 0) {
            setSelectedColor(data.data.colors[0].name);
          }
          setReviews(data.data.reviews || []);
        }
      } catch (err) {
        toast.error('Product not found');
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [idOrSlug, navigate]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `http://localhost:5000${imagePath}`;
    if (imagePath.startsWith('/images')) return imagePath;
    if (imagePath.startsWith('/')) return `http://localhost:5000${imagePath}`;
    return `http://localhost:5000/${imagePath}`;
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) {
      localStorage.setItem(
        'pendingCart',
        JSON.stringify({
          product,
          quantity,
          size: selectedSize,
          color: selectedColor,
        })
      );
      toast.error('Please sign in to add items to your cart & proceed to checkout');
      navigate('/login?redirect=checkout');
      return;
    }
    setCartLoading(true);
    setTimeout(() => {
      addToCart(product, quantity, selectedSize, selectedColor);
      toast.success(`${product.name} added to cart!`);
      setCartLoading(false);
      navigate('/checkout');
    }, 3000);
  };

  const handleWishlistToggle = async () => {
    setWishlistLoading(true);
    await new Promise((r) => setTimeout(r, 3000));
    const res = await toggleWishlist(product._id);
    setWishlistLoading(false);
    if (res?.success) {
      toast.success(res.action === 'added' ? 'Added to wishlist!' : 'Removed from wishlist!');
    } else if (res?.requireLogin) {
      localStorage.setItem('pendingWishlist', product._id);
      toast.error('Please login to add items to your wishlist');
      navigate('/login');
    } else {
      toast.error(res?.error || 'Failed to update wishlist');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to write a review');
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('Review comment cannot be empty');
      return;
    }

    setSubmittingReview(true);
    try {
      const { data } = await API.post('/reviews', {
        product: product._id,
        rating: reviewRating,
        comment: reviewComment,
      });

      if (data.success) {
        toast.success('Review submitted successfully!');
        setReviewComment('');
        // Reload reviews
        const updatedReviews = [data.data, ...reviews];
        setReviews(updatedReviews);
      }
    } catch (err) {
      toast.error(err.message || 'Already reviewed this product');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-crimson" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const discountPercent = product.discountPrice > 0 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
    : 0;

  const currentPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  return (
    <div className="py-5">
      <SEO
        title={product ? product.name : 'Product'}
        description={product ? product.description.substring(0, 160) : 'View product details.'}
      />
      <div className="container">
        
        {/* BREADCRUMB */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/" className="text-crimson text-decoration-none">Home</a></li>
            <li className="breadcrumb-item"><a href="/shop" className="text-crimson text-decoration-none">Shop</a></li>
            <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="row g-5">
          
          {/* GALLERY */}
          <div className="col-lg-6">
            <div className="product-gallery">
              <div className="main-img-container">
                <img src={getImageUrl(activeImg)} alt={product.name} />
              </div>
              {product.images?.length > 1 && (
                <div className="thumb-grid">
                  {product.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`thumb-item ${activeImg === img ? 'active' : ''}`}
                      onClick={() => setActiveImg(img)}
                    >
                      <img src={getImageUrl(img)} alt={`${product.name} thumb ${idx}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div className="col-lg-6">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="product-category text-crimson fw-semibold text-uppercase">{product.category?.name}</span>
              {product.isNew && (
                <span className="badge bg-crimson text-white px-2 py-1" style={{ fontSize: '0.7rem', borderRadius: '12px', fontWeight: 600 }}>
                  ✨ NEW ARRIVAL
                </span>
              )}
            </div>
            <h1 className="h2 mb-2 fw-bold text-dark">{product.name}</h1>
            
            {/* Rating Summary */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="stars text-gold">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className={`bi ${i < Math.floor(product.ratingsAverage || 0) ? 'bi-star-fill' : 'bi-star'}`}></i>
                ))}
              </span>
              <span className="text-muted small">({product.ratingsCount || 0} reviews)</span>
            </div>

            {/* Pricing */}
            <div className="d-flex align-items-center gap-3 mb-4">
              <span className="fs-3 fw-bold text-crimson">₹{currentPrice.toLocaleString('en-IN')}</span>
              {product.discountPrice > 0 && (
                <>
                  <span className="text-decoration-line-through text-muted">₹{product.price.toLocaleString('en-IN')}</span>
                  <span className="badge bg-success">{discountPercent}% OFF</span>
                </>
              )}
            </div>

            <p className="text-muted mb-4">{product.shortDescription || product.description.substring(0, 180) + '...'}</p>
            <hr />

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="mb-4">
                <label className="fw-semibold text-dark mb-2 d-block">Select Size:</label>
                <div className="d-flex gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="mb-4">
                <label className="fw-semibold text-dark mb-2 d-block">Select Color:</label>
                <div className="d-flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      className={`btn btn-sm btn-outline-secondary ${selectedColor === color.name ? 'active border-dark' : ''}`}
                      onClick={() => setSelectedColor(color.name)}
                    >
                      <span className="d-inline-block rounded-circle me-1" style={{ width: '12px', height: '12px', backgroundColor: color.hex }}></span>
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="d-flex align-items-center gap-3 mb-4">
              <label className="fw-semibold text-dark">Quantity:</label>
              <div className="qty-input">
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
                <input type="text" value={quantity} readOnly />
                <button type="button" onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <span className="text-muted small">
                {product.stock > 0 ? `${product.stock} items left in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Actions */}
            <div className="d-flex gap-3 mb-4">
              {product.stock > 0 ? (
                <button
                  className={`btn-hero-primary flex-grow-1 py-3${cartLoading ? ' btn-loading' : ''}`}
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  id="btn-add-to-bag"
                >
                  {cartLoading ? (
                    <><span className="btn-spinner" />Adding to Bag…</>
                  ) : (
                    <><i className="bi bi-bag-plus me-2" />Add to Bag</>
                  )}
                </button>
              ) : (
                <button className="btn btn-secondary flex-grow-1 disabled py-3" style={{ borderRadius: '30px' }}>
                  Out of Stock
                </button>
              )}
              <button
                className={`btn ${isInWishlist(product._id) ? 'btn-danger' : 'btn-outline-danger'} px-4${wishlistLoading ? ' btn-loading' : ''}`}
                style={{ borderRadius: '30px' }}
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                id="btn-wishlist-detail"
              >
                {wishlistLoading ? (
                  <span
                    className="btn-spinner"
                    style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
                  />
                ) : (
                  <i className={`bi ${isInWishlist(product._id) ? 'bi-heart-fill' : 'bi-heart'}`} />
                )}
              </button>
            </div>

          </div>

        </div>

        {/* TABS DETAILS & REVIEWS */}
        <div className="mt-5">
          <ul className="nav nav-tabs custom-tabs" id="productTabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button className="nav-link active" id="desc-tab" data-bs-toggle="tab" data-bs-target="#desc-pane" type="button" role="tab">
                Description
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link" id="spec-tab" data-bs-toggle="tab" data-bs-target="#spec-pane" type="button" role="tab">
                Specifications
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link" id="reviews-tab" data-bs-toggle="tab" data-bs-target="#reviews-pane" type="button" role="tab">
                Reviews ({reviews.length})
              </button>
            </li>
          </ul>

          <div className="tab-content border-start border-end border-bottom p-4 bg-white rounded-bottom" id="productTabsContent">
            
            {/* Description */}
            <div className="tab-pane fade show active" id="desc-pane" role="tabpanel" aria-labelledby="desc-tab">
              <p className="mb-0 text-muted" style={{ lineHeight: '1.8' }}>{product.description}</p>
            </div>

            {/* Specifications */}
            <div className="tab-pane fade" id="spec-pane" role="tabpanel" aria-labelledby="spec-tab">
              <table className="table table-bordered mb-0">
                <tbody>
                  <tr>
                    <td className="fw-semibold" style={{ width: '200px' }}>Fabric</td>
                    <td>{product.fabric || 'Not Specified'}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold">Occasion</td>
                    <td className="text-capitalize">{product.occasion}</td>
                  </tr>
                  {product.weight && (
                    <tr>
                      <td className="fw-semibold">Weight</td>
                      <td>{product.weight}</td>
                    </tr>
                  )}
                  {product.careInstructions && (
                    <tr>
                      <td className="fw-semibold">Care Instructions</td>
                      <td>{product.careInstructions}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Reviews */}
            <div className="tab-pane fade" id="reviews-pane" role="tabpanel" aria-labelledby="reviews-tab">
              <div className="row g-4">
                
                {/* List of Reviews */}
                <div className="col-lg-7">
                  <h3 className="h5 fw-bold mb-4">Customer Reviews</h3>
                  {reviews.length === 0 ? (
                    <p className="text-muted">No reviews yet. Be the first to review this product!</p>
                  ) : (
                    <div className="d-flex flex-column gap-4">
                      {reviews.map((rev) => (
                        <div key={rev._id} className="border-bottom pb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-bold text-dark">{rev.user?.name || 'Anonymous Customer'}</span>
                            <span className="text-muted small">{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="mb-2 text-gold">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`bi ${i < rev.rating ? 'bi-star-fill' : 'bi-star'}`}></i>
                            ))}
                          </div>
                          <p className="text-muted mb-0 small">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Write a Review */}
                <div className="col-lg-5">
                  <div className="p-4 bg-light rounded">
                    <h3 className="h5 fw-bold mb-3 text-dark">Write a Review</h3>
                    {user ? (
                      <form onSubmit={handleReviewSubmit}>
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-muted">Rating</label>
                          <select
                            className="form-select form-select-sm"
                            value={reviewRating}
                            onChange={(e) => setReviewRating(Number(e.target.value))}
                          >
                            <option value="5">5 Stars (Excellent)</option>
                            <option value="4">4 Stars (Good)</option>
                            <option value="3">3 Stars (Average)</option>
                            <option value="2">2 Stars (Poor)</option>
                            <option value="1">1 Star (Very Bad)</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-muted">Comment</label>
                          <textarea
                            className="form-control"
                            rows="4"
                            placeholder="Share your thoughts about this product..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                          ></textarea>
                        </div>
                        <button type="submit" className="btn btn-hero-primary btn-sm w-100" disabled={submittingReview}>
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    ) : (
                      <div className="text-center py-3">
                        <p className="text-muted small mb-2">Please login to write a review.</p>
                        <button className="btn btn-sm btn-hero-primary" onClick={() => navigate('/login')}>Login Now</button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;
