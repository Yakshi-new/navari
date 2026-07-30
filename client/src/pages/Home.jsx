import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { getImageUrl } from '../utils/imageUrl';

const Home = () => {
  const [heroBanners, setHeroBanners] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [specialOffer, setSpecialOffer] = useState(null);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [bannersRes, productsRes, categoriesRes, offerRes, newArrivalsRes] = await Promise.all([
          API.get('/banners?type=hero'),
          API.get('/products/featured'),
          API.get('/categories'),
          API.get('/banners?type=offer'),
          API.get('/products/new-arrivals'),
        ]);

        if (bannersRes.data.success) setHeroBanners(bannersRes.data.data);
        if (productsRes.data.success) setFeaturedProducts(productsRes.data.data);
        if (categoriesRes.data.success) setCategories(categoriesRes.data.data);
        if (offerRes.data.success && offerRes.data.data.length > 0) {
          setSpecialOffer(offerRes.data.data[0]);
        }
        if (newArrivalsRes.data.success) setNewArrivals(newArrivalsRes.data.data);
      } catch (err) {
        console.error('Error fetching home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  // Dynamic Countdown timer for special offer
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = specialOffer?.offerEndDate
        ? new Date(specialOffer.offerEndDate)
        : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

      const diff = targetDate - new Date();

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return { days, hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [specialOffer]);

  // getImageUrl is imported from utils/imageUrl — prepends VITE_SERVER_URL automatically

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-crimson" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SEO />
      {/* HERO CAROUSEL */}
      <section className="p-0">
        <div id="heroCarousel" className="carousel slide hero-carousel" data-bs-ride="carousel" data-bs-interval="5000">
          <div className="carousel-indicators">
            {heroBanners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                data-bs-target="#heroCarousel"
                data-bs-slide-to={idx}
                className={idx === 0 ? 'active' : ''}
                aria-current={idx === 0 ? 'true' : 'false'}
              ></button>
            ))}
          </div>
          <div className="carousel-inner">
            {heroBanners.map((banner, idx) => (
              <div key={banner._id} className={`carousel-item ${idx === 0 ? 'active' : ''}`}>
                <div className={`hero-slide hero-slide-${(idx % 3) + 1}`}>
                  <div className="decor-circle decor-1"></div>
                  <div className="decor-circle decor-2"></div>
                  <div className="container">
                    <div className="row align-items-center gy-5">
                      <div className="col-lg-6">
                        {banner.badge && <div className="hero-badge">{banner.badge}</div>}
                        <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: banner.title }}></h1>
                        {banner.subtitle && <p className="hero-subtitle">{banner.subtitle}</p>}
                        <div className="d-flex gap-3 flex-wrap">
                          {banner.primaryBtnText && (
                            <button className="btn-hero-primary" onClick={() => navigate(banner.primaryBtnLink || '/shop')}>
                              {banner.primaryBtnText} <i className="bi bi-arrow-right ms-1"></i>
                            </button>
                          )}
                          {banner.secondaryBtnText && (
                            <button className="btn-hero-outline" onClick={() => navigate(banner.secondaryBtnLink || '/shop')}>
                              {banner.secondaryBtnText}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="hero-img-wrap">
                          {banner.image && <img src={getImageUrl(banner.image)} alt={banner.title} />}
                          
                          {/* TOP FLOATING TAG / POPUP */}
                          {(banner.topTagText || banner.topTagText === undefined) && (
                            <div className="hero-floating-tag tag-1">
                              <span className="dot bg-crimson"></span>
                              <span>{banner.topTagText || 'Premium Silk • ₹4,999'}</span>
                            </div>
                          )}

                          {/* BOTTOM FLOATING TAG / POPUP */}
                          {(banner.bottomTagText || banner.bottomTagText === undefined) && (
                            <div className="hero-floating-tag tag-2">
                              <i className="bi bi-star-fill text-warning me-1"></i>
                              <span>{banner.bottomTagText || '4.9 · 2,300 Reviews'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAR SECTION */}
      <section className="stats-bar p-0 py-4">
        <div className="container">
          <div className="row g-3 text-center align-items-center justify-content-center">
            <div className="col-6 col-sm-4 col-lg">
              <div className="stat-item">
                <div className="stat-number">50,000+</div>
                <div className="stat-label">Happy Customers</div>
              </div>
            </div>
            <div className="col-6 col-sm-4 col-lg">
              <div className="stat-item">
                <div className="stat-number">1,200+</div>
                <div className="stat-label">Unique Designs</div>
              </div>
            </div>
            <div className="col-6 col-sm-4 col-lg">
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">Authentic Fabric</div>
              </div>
            </div>
            <div className="col-6 col-sm-4 col-lg">
              <div className="stat-item">
                <div className="stat-number">15+</div>
                <div className="stat-label">Years of Legacy</div>
              </div>
            </div>
            <div className="col-6 col-sm-4 col-lg">
              <div className="stat-item">
                <div className="stat-number">
                  4.9 <i className="bi bi-star-fill text-gold ms-1 fs-5"></i>
                </div>
                <div className="stat-label">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="section-bg-pink">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">BROWSE CATEGORIES</span>
            <h2 className="section-title">Shop by <span>Category</span></h2>
            <p className="section-subtitle">Explore our curated collections crafted for every woman and every occasion.</p>
            <div className="divider-gold"></div>
          </div>
          <div className="row g-4">
            {categories.filter((c) => !c.parent).slice(0, 4).map((cat, idx) => {
              const defaultImages = [
                '/uploads/sarees/hero-saree.png',
                '/uploads/kurtis/product-kurti.png',
                '/uploads/accessories/product-kurti.png',
                '/uploads/banners/collection.png'
              ];
              const img = cat.image || defaultImages[idx % 4];

              return (
                <div key={cat._id} className="col-lg-3 col-md-6">
                  <div className="category-card" onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.name)}`)}>
                    <img src={getImageUrl(img)} alt={cat.name} />
                    <div className="category-overlay"></div>
                    <div className="category-info">
                      <div className="category-label">{cat.name}</div>
                      <div className="category-count">{cat.description || 'Explore collection'}</div>
                    </div>
                    <div className="category-arrow">
                      <i className="bi bi-arrow-up-right text-white"></i>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section>
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Trending</span>
            <h2 className="section-title">Featured <span>Collection</span></h2>
            <p className="section-subtitle">Explore this week's highly curated best sellers and designer recommendations.</p>
            <div className="divider-gold"></div>
          </div>
          <div className="row g-4">
            {featuredProducts.map((prod) => (
              <div key={prod._id} className="col-lg-3 col-md-6">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIAL OFFER COUNTDOWN */}
      <section className="py-5">
        <div className="container">
          <div className="offer-banner">
            <div className="decor decor-a"></div>
            <div className="decor decor-b"></div>
            <div className="row align-items-center gy-5">
              <div className="col-lg-6">
                <span className="offer-tag">{specialOffer?.badge || 'Limited Offer'}</span>
                <h2 className="offer-title">
                  {specialOffer?.title ? (
                    <span dangerouslySetInnerHTML={{ __html: specialOffer.title }}></span>
                  ) : (
                    <>Festival Sparkle <span>Exclusive Sale</span></>
                  )}
                </h2>
                <p className="offer-text">
                  {specialOffer?.subtitle || 'Get up to 40% OFF on select Bridal Lehengas & Handloom Silk Sarees.'}{' '}
                  {specialOffer?.couponCode && (
                    <>Use checkout code <strong className="text-gold">{specialOffer.couponCode}</strong> for additional discount.</>
                  )}
                </p>

                <div className="countdown-wrap">
                  <div className="countdown-item">
                    <div className="countdown-num">{String(timeLeft.days).padStart(2, '0')}</div>
                    <div className="countdown-lbl">Days</div>
                  </div>
                  <div className="countdown-item">
                    <div className="countdown-num">{String(timeLeft.hours).padStart(2, '0')}</div>
                    <div className="countdown-lbl">Hrs</div>
                  </div>
                  <div className="countdown-item">
                    <div className="countdown-num">{String(timeLeft.minutes).padStart(2, '0')}</div>
                    <div className="countdown-lbl">Mins</div>
                  </div>
                  <div className="countdown-item">
                    <div className="countdown-num">{String(timeLeft.seconds).padStart(2, '0')}</div>
                    <div className="countdown-lbl">Secs</div>
                  </div>
                </div>

                <button className="btn-offer" onClick={() => navigate(specialOffer?.primaryBtnLink || '/shop?sort=sale')}>
                  {specialOffer?.primaryBtnText || 'Shop the Sale'}
                </button>
              </div>
              <div className="col-lg-6 offer-image-col">
                <img
                  src={getImageUrl(specialOffer?.image || '/uploads/banners/collection.png')}
                  alt="Special Offer Collection"
                  className="img-fluid shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES STRIP */}
      <section className="features-strip">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="feature-item">
                <div className="feature-icon"><i className="bi bi-truck"></i></div>
                <div>
                  <h4 className="feature-title">Free Shipping</h4>
                  <p className="feature-text mb-0">Free shipping all over India on orders above ₹999.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="feature-item">
                <div className="feature-icon"><i className="bi bi-shield-check"></i></div>
                <div>
                  <h4 className="feature-title">Authentic Fabric</h4>
                  <p className="feature-text mb-0">100% genuine silks and handloom certified fabrics.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="feature-item">
                <div className="feature-icon"><i className="bi bi-credit-card"></i></div>
                <div>
                  <h4 className="feature-title">Secure Checkout</h4>
                  <p className="feature-text mb-0">UPI, Net Banking, Cards & Cash on Delivery supported.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="feature-item">
                <div className="feature-icon"><i className="bi bi-arrow-counterclockwise"></i></div>
                <div>
                  <h4 className="feature-title">Easy Returns</h4>
                  <p className="feature-text mb-0">Hassle-free 7-day return and exchange policy.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="section-bg-pink py-5">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">JUST DROPPED</span>
            <h2 className="section-title">New <span>Arrivals</span></h2>
            <p className="section-subtitle">Fresh styles added every week — be the first to own the latest designs.</p>
            <div className="divider-gold"></div>
          </div>

          <div className="row g-4">
            {newArrivals.slice(0, 6).map((prod) => {
              const currentPrice = prod.discountPrice > 0 ? prod.discountPrice : prod.price;
              const originalPrice = prod.discountPrice > 0 ? prod.price : null;
              const prodImg = prod.images?.[0] || '/uploads/banners/collection.png';
              const catName = typeof prod.category === 'object' ? prod.category?.name : prod.subcategory || 'Handloom';

              return (
                <div key={prod._id} className="col-lg-4 col-md-6">
                  <div
                    className="new-arrival-card"
                    onClick={() => navigate(`/product/${prod.slug || prod._id}`)}
                  >
                    <img
                      src={getImageUrl(prodImg)}
                      alt={prod.name}
                      className="new-arrival-img"
                    />
                    <div className="new-arrival-body">
                      <div className="new-arrival-cat">{catName}</div>
                      <div className="new-arrival-title" title={prod.name}>
                        {prod.name}
                      </div>
                      <div className="new-arrival-rating">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`bi ${i < Math.floor(prod.ratingsAverage || 5) ? 'bi-star-fill' : 'bi-star'}`}
                          ></i>
                        ))}
                      </div>
                      <div className="new-arrival-price">
                        <span className="new-arrival-current-price">
                          ₹{currentPrice.toLocaleString('en-IN')}
                        </span>
                        {originalPrice && (
                          <span className="new-arrival-original-price">
                            ₹{originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section>
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Reviews</span>
            <h2 className="section-title">What Our <span>Customers Say</span></h2>
            <p className="section-subtitle">Real experiences from customers who embraced Navari.</p>
            <div className="divider-gold"></div>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="testimonial-card">
                <div className="quote-icon"><i className="bi bi-quote"></i></div>
                <p className="testimonial-text">
                  "The Banarasi silk saree is absolutely gorgeous! The gold zari work is so intricate and authentic. Received so many compliments on my sister's wedding."
                </p>
                <div className="testimonial-author">
                  <div>
                    <h5 className="author-name mb-0">Ananya Sharma</h5>
                    <span className="author-location">New Delhi</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="testimonial-card">
                <div className="quote-icon"><i className="bi bi-quote"></i></div>
                <p className="testimonial-text">
                  "I ordered a designer lehenga. The stitching, material, and fit were perfect. Delivery was quick and customer support kept me updated all the way."
                </p>
                <div className="testimonial-author">
                  <div>
                    <h5 className="author-name mb-0">Priya Patel</h5>
                    <span className="author-location">Ahmedabad</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="testimonial-card">
                <div className="quote-icon"><i className="bi bi-quote"></i></div>
                <p className="testimonial-text">
                  "Authentic handlooms are hard to find online, but Navari delivers exactly what they promise. Extremely happy with my purchase."
                </p>
                <div className="testimonial-author">
                  <div>
                    <h5 className="author-name mb-0">Meenakshi Iyer</h5>
                    <span className="author-location">Chennai</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
