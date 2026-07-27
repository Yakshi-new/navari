import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Current filters
  const categoryParam = searchParams.get('category') || '';
  const subcategoryParam = searchParams.get('subcategory') || '';
  const occasionParam = searchParams.get('occasion') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const sortParam = searchParams.get('sort') || '-createdAt';
  const pageParam = searchParams.get('page') || '1';
  const searchParam = searchParams.get('search') || '';

  // Local sidebar state
  const [minPrice, setMinPrice] = useState(minPriceParam || 0);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam || 25000);
  const [selectedSub, setSelectedSub] = useState(subcategoryParam);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const { data } = await API.get('/categories');
        if (data.success) setCategories(data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFilterData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Find category ID if category name is passed
        let categoryId = '';
        if (categoryParam) {
          const matchedCat = categories.find(
            (c) => c.name.toLowerCase() === categoryParam.toLowerCase()
          );
          if (matchedCat) categoryId = matchedCat._id;
        }

        const params = {
          page: pageParam,
          limit: 9,
          sort: sortParam,
          ...(categoryId && { category: categoryId }),
          ...(subcategoryParam && { subcategory: subcategoryParam }),
          ...(occasionParam && { occasion: occasionParam }),
          ...(minPriceParam && { minPrice: minPriceParam }),
          ...(maxPriceParam && { maxPrice: maxPriceParam }),
          ...(searchParam && { search: searchParam }),
        };

        const { data } = await API.get('/products', { params });
        if (data.success) {
          setProducts(data.data);
          setPagination(data.pagination);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    // Only query when categories are loaded (or categoryParam is not set)
    if (categories.length > 0 || !categoryParam) {
      fetchProducts();
    }
  }, [categoryParam, subcategoryParam, occasionParam, minPriceParam, maxPriceParam, sortParam, pageParam, searchParam, categories]);

  const updateFilters = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '') {
        updated.delete(key);
      } else {
        updated.set(key, val);
      }
    });
    // Reset page to 1 on filter change
    if (!newParams.page) {
      updated.set('page', '1');
    }
    setSearchParams(updated);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    updateFilters({ minPrice, maxPrice });
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setMinPrice(0);
    setMaxPrice(25000);
    setSelectedSub('');
  };

  return (
    <div className="py-5 bg-light">
      <SEO
        title={categoryParam ? `${categoryParam}` : 'Shop'}
        description={`Explore the finest collection of women's fashion in our ${categoryParam || 'handloom clothing'} category at Navari.`}
      />
      <div className="container">
        <div className="row g-4">
          
          {/* FILTER SIDEBAR */}
          <div className="col-lg-3">
            <div className="filter-sidebar">
              <div className="filter-title">
                <span>Filters</span>
                <button className="btn btn-sm btn-link text-crimson p-0 text-decoration-none fw-semibold" onClick={clearAllFilters}>
                  Clear All
                </button>
              </div>

              {/* Category */}
              <div className="filter-group">
                <h4 className="filter-group-title">Categories</h4>
                <div className="list-group list-group-flush">
                  <button
                    className={`list-group-item list-group-item-action border-0 px-0 d-flex justify-content-between align-items-center bg-transparent ${!categoryParam ? 'text-crimson fw-bold' : ''}`}
                    onClick={() => updateFilters({ category: '', subcategory: '' })}
                  >
                    <span>All Collections</span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      className={`list-group-item list-group-item-action border-0 px-0 d-flex justify-content-between align-items-center bg-transparent ${categoryParam === cat.name ? 'text-crimson fw-bold' : ''}`}
                      onClick={() => updateFilters({ category: cat.name, subcategory: '' })}
                    >
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategories (only if category selected) */}
              {categoryParam && (
                <div className="filter-group">
                  <h4 className="filter-group-title">Type</h4>
                  <div className="d-flex flex-column gap-2">
                    {categoryParam === 'Sarees' && (
                      ['Silk Sarees', 'Banarasi Sarees', 'Chiffon Sarees', 'Cotton Sarees', 'Kanjivaram Sarees', 'Designer Sarees'].map((sub) => (
                        <div key={sub} className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={sub}
                            checked={subcategoryParam === sub}
                            onChange={() => updateFilters({ subcategory: subcategoryParam === sub ? '' : sub })}
                          />
                          <label className="form-check-label" htmlFor={sub}>{sub}</label>
                        </div>
                      ))
                    )}
                    {categoryParam === 'Lehengas' && (
                      ['Bridal Lehengas', 'Party Wear', 'Indo-Western', 'Festive Lehengas'].map((sub) => (
                        <div key={sub} className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={sub}
                            checked={subcategoryParam === sub}
                            onChange={() => updateFilters({ subcategory: subcategoryParam === sub ? '' : sub })}
                          />
                          <label className="form-check-label" htmlFor={sub}>{sub}</label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Occasion */}
              <div className="filter-group">
                <h4 className="filter-group-title">Occasion</h4>
                <select
                  className="form-select form-select-sm"
                  value={occasionParam}
                  onChange={(e) => updateFilters({ occasion: e.target.value })}
                >
                  <option value="">All Occasions</option>
                  <option value="bridal">Bridal Wear</option>
                  <option value="festive">Festive Wear</option>
                  <option value="party">Party Wear</option>
                  <option value="casual">Casual Wear</option>
                  <option value="office">Office Wear</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <h4 className="filter-group-title">Price Range</h4>
                <form onSubmit={handlePriceApply}>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-sm btn-hero-primary w-100 py-2" style={{ fontSize: '0.8rem' }}>
                    Apply Price
                  </button>
                </form>
              </div>

            </div>
          </div>

          {/* PRODUCT LIST GRID */}
          <div className="col-lg-9">
            
            {/* Toolbar */}
            <div className="shop-toolbar d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 mb-4 rounded shadow-sm bg-white border">
              <div>
                Showing <span className="fw-bold">{products.length}</span> of <span className="fw-bold">{pagination.total}</span> items
                {searchParam && <span> for "<strong>{searchParam}</strong>"</span>}
              </div>

              <div className="d-flex align-items-center gap-2">
                <label className="text-muted small text-nowrap">Sort By:</label>
                <select
                  className="form-select form-select-sm border-0 bg-transparent fw-semibold"
                  style={{ width: '160px', cursor: 'pointer' }}
                  value={sortParam}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                >
                  <option value="-createdAt">New Arrivals</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="-ratingsAverage">Top Rated</option>
                  <option value="-soldCount">Popularity</option>
                </select>
              </div>
            </div>

            {/* Active Chips */}
            {(categoryParam || subcategoryParam || occasionParam || minPriceParam || maxPriceParam) && (
              <div className="active-filters mb-3">
                {categoryParam && (
                  <span className="filter-chip">
                    Category: {categoryParam}
                    <i className="bi bi-x" onClick={() => updateFilters({ category: '', subcategory: '' })}></i>
                  </span>
                )}
                {subcategoryParam && (
                  <span className="filter-chip">
                    Type: {subcategoryParam}
                    <i className="bi bi-x" onClick={() => updateFilters({ subcategory: '' })}></i>
                  </span>
                )}
                {occasionParam && (
                  <span className="filter-chip">
                    Occasion: {occasionParam}
                    <i className="bi bi-x" onClick={() => updateFilters({ occasion: '' })}></i>
                  </span>
                )}
                {(minPriceParam || maxPriceParam) && (
                  <span className="filter-chip">
                    Price: ₹{minPriceParam || 0} - ₹{maxPriceParam || '25k+'}
                    <i className="bi bi-x" onClick={() => updateFilters({ minPrice: '', maxPrice: '' })}></i>
                  </span>
                )}
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
                <div className="spinner-border text-crimson" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-5 bg-white rounded border">
                <i className="bi bi-bag-x fs-1 text-muted mb-3 d-block"></i>
                <h3 className="h5 text-dark fw-bold">No Products Found</h3>
                <p className="text-muted small">Try modifying your filters or search keywords.</p>
                <button className="btn btn-hero-primary btn-sm mt-2" onClick={clearAllFilters}>Reset Filters</button>
              </div>
            ) : (
              <>
                <div className="row g-4">
                  {products.map((prod) => (
                    <div key={prod._id} className="col-md-4 col-sm-6">
                      <ProductCard product={prod} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <nav className="mt-5 d-flex justify-content-center">
                    <ul className="pagination pagination-sm">
                      <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => updateFilters({ page: String(pagination.page - 1) })}
                        >
                          <i className="bi bi-chevron-left"></i>
                        </button>
                      </li>
                      {[...Array(pagination.pages)].map((_, i) => (
                        <li key={i} className={`page-item ${pagination.page === i + 1 ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            style={pagination.page === i + 1 ? { backgroundColor: 'var(--clr-crimson)', borderColor: 'var(--clr-crimson)' } : {}}
                            onClick={() => updateFilters({ page: String(i + 1) })}
                          >
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => updateFilters({ page: String(pagination.page + 1) })}
                        >
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default Shop;
