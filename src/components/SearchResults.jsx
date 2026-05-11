import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useCart } from '../context/CartContext';

const SearchResults = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [sortBy, setSortBy] = useState('relevance');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';

  // Fetch all products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const ref = collection(db, "products");
        const snap = await getDocs(ref);

        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Extract unique categories
        const uniqueCategories = [...new Set(list.map(p => p.category?.name || 'Uncategorized'))];
        setCategories(['all', ...uniqueCategories]);
        
        setProducts(list);
        
        // Initial filter based on search query
        filterProducts(list, searchQuery, 'all', priceRange, 'relevance');
      } catch (err) {
        console.error("Error searching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  const filterProducts = (productList, query, category, priceRange, sortType) => {
    let filtered = productList.filter((p) => {
      const matchesSearch = query ? (
        p.searchKeywords?.some((k) => k.toLowerCase().includes(query.toLowerCase())) ||
        p.name?.toLowerCase().includes(query.toLowerCase()) ||
        p.productTag?.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase())
      ) : true;

      const matchesCategory = category === 'all' || p.category?.name === category;
      
      const price = p.variants?.[0]?.price || p.price || 0;
      const matchesPrice = price >= priceRange.min && price <= priceRange.max;

      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort products
    switch (sortType) {
      case 'price-low':
        filtered.sort((a, b) => {
          const priceA = a.variants?.[0]?.price || a.price || 0;
          const priceB = b.variants?.[0]?.price || b.price || 0;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => {
          const priceA = a.variants?.[0]?.price || a.price || 0;
          const priceB = b.variants?.[0]?.price || b.price || 0;
          return priceB - priceA;
        });
        break;
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // relevance - keep as is
        break;
    }

    setFilteredProducts(filtered);
  };

  // Apply filters when any filter changes
  useEffect(() => {
    filterProducts(products, searchQuery, selectedCategory, priceRange, sortBy);
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    
    const price = product.variants?.[0]?.price || product.price || 0;
    
    const item = {
      id: product.id,
      name: product.name,
      price: price,
      quantity: 1,
      image: product.mainImageUrl || 'https://placehold.co/300x200',
      variantId: product.variants?.[0]?.variantId || null,
    };

    addToCart(item);
    
    // Show toast notification (you might want to implement this)
    const event = new CustomEvent('showToast', { 
      detail: { 
        message: `${product.name} added to cart!`,
        type: 'success'
      }
    });
    window.dispatchEvent(event);
  };

  const handleQuickView = (e, product) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`, { state: { product } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-14 w-14 rounded-full border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Searching for "{searchQuery}"...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
          </h1>
          <p className="text-gray-600">
            Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-4 text-gray-900">Filters</h2>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Category</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`block w-full text-left px-3 py-2 rounded ${
                      selectedCategory === 'all' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.slice(1).map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`block w-full text-left px-3 py-2 rounded ${
                        selectedCategory === category 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">₹{priceRange.min}</span>
                    <span className="text-sm text-gray-600">₹{priceRange.max}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex gap-2">
                     
                    
                  </div>
                </div>
              </div>

              {/* Clear Filters Button */}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setPriceRange({ min: 0, max: 100000 });
                  setSortBy('relevance');
                }}
                className="w-full py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {/* Sort Bar */}
            <div className="bg-white rounded-lg shadow mb-6 p-4 flex flex-wrap items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
              <div className="text-sm text-gray-600 mt-2 md:mt-0">
                Showing {filteredProducts.length} of {products.length} products
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any products matching "{searchQuery}"
                </p>
                <button
                  onClick={() => navigate('/e-store')}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
                >
                  Browse All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const price = product.variants?.[0]?.price || product.price || 0;
                  const originalPrice = product.variants?.[0]?.originalPrice || product.originalPrice;
                  const discount = originalPrice > price 
                    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
                    : 0;

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                      onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                    >
                      {/* Product Image */}
                      <div className="relative overflow-hidden">
                        <img
                          src={product.mainImageUrl || 'https://placehold.co/400x300?text=No+Image'}
                          alt={product.name}
                          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {discount > 0 && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                            {discount}% OFF
                          </div>
                        )}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleQuickView(e, product)}
                            className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                            title="Quick View"
                          >
                            👁️
                          </button>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                            {product.name}
                          </h3>
                          {product.rating && (
                            <div className="flex items-center bg-green-50 px-2 py-1 rounded">
                              <span className="text-green-700 font-bold mr-1">{product.rating}</span>
                              <span className="text-green-600">★</span>
                            </div>
                          )}
                        </div>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {product.productTag || product.description}
                        </p>

                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-xl font-bold text-gray-900">₹{price.toLocaleString()}</span>
                            {originalPrice > price && (
                              <span className="ml-2 text-sm text-gray-500 line-through">
                                ₹{originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {product.category?.name || 'Uncategorized'}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center gap-2"
                          >
                            <span>Add to Cart</span>
                          </button>
                          <button
                            onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                            className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination (optional - if you have many results) */}
            {filteredProducts.length > 0 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center gap-2">
                  <button className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-4 py-2 border rounded bg-purple-600 text-white">
                    1
                  </button>
                  <button className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">
                    3
                  </button>
                  <span className="px-2">...</span>
                  <button className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;