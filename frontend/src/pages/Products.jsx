import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Star, SlidersHorizontal, Grid3X3, LayoutGrid, ShoppingBag, BookOpen, Home, Dumbbell, Palette, UtensilsCrossed, Gift, Zap, ArrowUpDown } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../services/api';

const catIcons = { Electronics: Zap, Clothing: ShoppingBag, Books: BookOpen, Home, Sports: Dumbbell, Beauty: Palette, Food: UtensilsCrossed, Toys: Gift };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } };
const stagger = { visible: { transition: { staggerChildren: 0.04 } } };

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState('grid'); // 'grid' or 'compact'

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    productsAPI.getAll(params)
      .then(res => {
        let list = res.data.products || res.data || [];
        setProducts(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    categoriesAPI.getAll().then(res => setCategories(res.data.categories || res.data || [])).catch(console.error);
  }, [search, category]);

  const sorted = [...products].sort((a, b) => {
    if (sort === 'price-low') return Number(a.price) - Number(b.price);
    if (sort === 'price-high') return Number(b.price) - Number(a.price);
    if (sort === 'name') return (a.title || a.name || '').localeCompare(b.title || b.name || '');
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    setSearchParams(params);
  };

  return (
    <div className="shop-page">
      <div className="container">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          {/* Page header */}
          <div className="shop-header">
            <div>
              <p className="shop-eyebrow">Shop</p>
              <h1 className="shop-title">Discover Products</h1>
              <p className="shop-subtitle">Curated collection of premium items across {categories.length} categories</p>
            </div>
          </div>

          {/* Search + filters row */}
          <div className="shop-toolbar">
            <form onSubmit={handleSearch} className="shop-search-form">
              <Search size={18} className="shop-search-icon" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="shop-search-input"
              />
            </form>
            <div className="shop-toolbar-right">
              <div className="shop-sort">
                <ArrowUpDown size={14} />
                <select value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low → High</option>
                  <option value="price-high">Price: High → Low</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
              <div className="shop-view-toggle">
                <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><LayoutGrid size={16} /></button>
                <button className={view === 'compact' ? 'active' : ''} onClick={() => setView('compact')}><Grid3X3 size={16} /></button>
              </div>
            </div>
          </div>

          {/* Category pills */}
          <motion.div className="shop-categories" initial="hidden" animate="visible" variants={stagger}>
            <motion.button variants={fadeUp} className={`shop-cat-pill ${!category ? 'active' : ''}`} onClick={() => setCategory('')}>
              All <span className="cat-count">{products.length}</span>
            </motion.button>
            {categories.map(cat => {
              const Icon = catIcons[cat.name] || Package;
              return (
                <motion.button key={cat._id || cat.id} variants={fadeUp}
                  className={`shop-cat-pill ${category === cat.name ? 'active' : ''}`}
                  onClick={() => setCategory(category === cat.name ? '' : cat.name)}>
                  <Icon size={14} /> {cat.name}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Results count */}
          <div className="shop-results-bar">
            <span className="shop-results-count">
              Showing <strong>{sorted.length}</strong> product{sorted.length !== 1 ? 's' : ''}
              {category && <> in <strong>{category}</strong></>}
            </span>
          </div>

          {/* Product grid */}
          {loading ? (
            <div className="shop-loading">
              {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card"><div className="skeleton-img" /><div className="skeleton-body"><div className="skeleton-line w60" /><div className="skeleton-line w80" /><div className="skeleton-line w40" /></div></div>)}
            </div>
          ) : sorted.length > 0 ? (
            <motion.div className={`shop-grid ${view === 'compact' ? 'shop-grid-compact' : ''}`} initial="hidden" animate="visible" variants={stagger}>
              <AnimatePresence>
                {sorted.map(product => (
                  <motion.div key={product._id || product.id} variants={fadeUp} layout whileHover={{ y: -6 }}>
                    <Link to={`/products/${product._id || product.id}`} className="product-card">
                      <div className="product-card-img">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.title || product.name} loading="lazy" />
                        ) : <Package size={36} color="var(--fg-light)" />}
                        <div className="product-card-overlay">
                          <span className="product-card-view">View Details</span>
                        </div>
                      </div>
                      <div className="product-card-info">
                        <span className="product-card-cat">{product.category || product.category_name || 'General'}</span>
                        <h3 className="product-card-name">{product.title || product.name}</h3>
                        <p className="product-card-desc">{product.description}</p>
                        <div className="product-card-footer">
                          <span className="product-card-price">₹{Number(product.price).toLocaleString()}</span>
                          {(product.averageRating || product.average_rating) > 0 && (
                            <span className="product-card-rating">
                              <Star size={12} fill="#f59e0b" stroke="#f59e0b" />
                              {Number(product.averageRating || product.average_rating).toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="shop-empty">
              <Package size={52} strokeWidth={1.2} color="var(--fg-light)" />
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button className="btn btn-primary" onClick={() => { setSearch(''); setCategory(''); }}>Clear Filters</button>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}

export default Products;