// pages/LocalMarket.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getApps, initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext"; 

// ---------------- FIREBASE INIT ----------------
const firebaseConfig =
  typeof __firebase_config !== "undefined" ? JSON.parse(__firebase_config) : {};
const appName = (typeof __app_id !== "undefined" && __app_id) ? `lm-${__app_id}` : "[DEFAULT]";

const app = getApps().find(a => a.name === appName) || initializeApp(firebaseConfig, appName);
const db = getFirestore(app);

// ---------------- HELPERS ----------------
const PLACEHOLDER_IMAGE = "https://placehold.co/400x300?text=No+Image";
const MAX_SLIDER = 100000;

const getMainImageUrl = (product) => {
  if (product.mainImageUrl) return product.mainImageUrl;
  if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
    const main = product.imageUrls.find(x => x.isMain);
    return (main?.url || product.imageUrls[0].url);
  }
  return PLACEHOLDER_IMAGE;
};

const pickVariant = (product) => {
  if (!Array.isArray(product.variants)) return null;
  return product.variants.find(v => Number(v.price) > 0) || product.variants[0] || null;
};

const getPriceData = (product) => {
  const variant = pickVariant(product);
  const price = variant ? Number(variant.price || 0) : Number(product.price || 0);
  const offer = variant?.offerPrice ? Number(variant.offerPrice) : 0;

  const finalPrice = offer && offer < price ? offer : price;
  const original = offer && offer < price ? price : 0;
  const discount = original > 0 ? Math.round(((original - finalPrice) / original) * 100) : 0;

  return { finalPrice, original, discount, variant };
};

const keywordMatches = (text, query) => {
  if (!text || !query) return false;
  return String(text).toLowerCase().includes(query.toLowerCase());
};

const extractMainCategories = (products) => {
  const set = new Set(["All Products"]);
  products.forEach(p => {
    if (p.category?.name) set.add(p.category.name);
  });
  return [...set];
};

const extractSubcategories = (products, mainCategory) => {
  const set = new Set(["All"]);
  if (mainCategory === "All Products") {
    products.forEach(p => {
      if (p.subCategory?.name) set.add(p.subCategory.name);
    });
  } else {
    products.forEach(p => {
      if (p.category?.name === mainCategory && p.subCategory?.name) {
        set.add(p.subCategory.name);
      }
    });
  }
  return [...set];
};

// 🔥 UPDATED: Robust Brand Extraction
const extractBrands = (products) => {
  const set = new Set(["All Brands"]);
  products.forEach(p => {
    // Trim spaces to avoid duplicates like "Nike " and "Nike"
    if (p.brand && p.brand.trim() !== "") {
      set.add(p.brand.trim());
    }
  });
  return [...set];
};

// ---------------- TOAST NOTIFICATION ----------------
const ToastNotification = ({ message, type = "success", onClose }) => {
  if (!message) return null;
  const bg = type === "success" ? "bg-green-600" : "bg-red-600";

  return (
    <div className="fixed top-5 right-5 z-50 animate-fade-in-down">
      <div className={`${bg} text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3`}>
        <span>{message}</span>
        <button onClick={onClose} className="text-white hover:text-gray-200 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ---------------- STAR RATING COMPONENT ----------------
const StarRating = ({ rating = 0, size = "w-4 h-4", showEmptyStars = true, showRatingNumber = false }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center">
      {Array(5).fill(0).map((_, i) => {
          const starValue = i + 1;
          return (
            <div key={i} className="relative">
              {showEmptyStars && (
                <svg className={`${size} text-gray-300`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
              {(starValue <= fullStars || (starValue === fullStars + 1 && hasHalfStar)) && (
                <svg className={`${size} text-yellow-500 absolute inset-0`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </div>
          );
        })}
      {showRatingNumber && <span className="ml-1 text-xs text-gray-600">{rating.toFixed(1)}</span>}
    </div>
  );
};

// ---------------- PRODUCT CARD COMPONENT ----------------
const ProductCard = ({ 
  product, 
  addToCart, 
  getQuantity, 
  onWishlistToggle, 
  isLoggedIn,
  calculateProductRating,
  productReviews
}) => {
  const navigate = useNavigate();
  const qty = getQuantity(product.id);
  const { finalPrice, original, discount } = getPriceData(product);
 const getAvailableStock = (product) => {
  // No variants → assume in stock
  if (!Array.isArray(product?.variants) || product.variants.length === 0) {
    return Infinity;
  }

  // Find ANY variant with stock > 0
  const variantWithStock = product.variants.find(
    v => Number(v.stock) > 0
  );

  return variantWithStock ? Number(variantWithStock.stock) : 0;
};


const availableStock = getAvailableStock(product);
const isOutOfStock = availableStock === 0;


  const productRating = calculateProductRating(product.id);
  const rating = productRating !== null ? productRating : (product.rating || 4.3);
  const reviewCount = productReviews[product.id]?.length || 0;
  
  const { toggleWishlist, isProductInWishlist } = useWishlist();
  const inWishlist = isProductInWishlist(product.id);

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate("/login");
      if (onWishlistToggle) onWishlistToggle("⚠️ Please login to add to wishlist");
      return;
    }
    
    toggleWishlist(product);
    if (onWishlistToggle) {
       
    }
  };
  
  const handleNotifyMe = (e) => {
  e.stopPropagation();

  const phoneNumber = "918762978777"; // 🔁 replace if needed
  const message = encodeURIComponent(
    `Hello, please notify me when this product is back in stock.\n\nProduct: ${product.name}`
  );

  window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
};

 const handleAddToCart = (e) => {
  e.stopPropagation();

  if (availableStock === 0) return;

  addToCart({
    id: product.id,
    productId: product.id,
    name: product.name,
    price: finalPrice,
    originalPrice: original,
    quantity: 1,
    stock: availableStock,      // ✅ REQUIRED
    image: product.image,
    productTag: "Local Market", // ✅ helpful for routing
  });
};


  // 🔥 UPDATED: Image container with full image display
  return (
      <div
  key={product.id}
  className="bg-white rounded-lg shadow-sm hover:shadow-md transition border cursor-pointer flex flex-col h-full"
  onClick={() =>
    navigate(`/product/${product.id}`, {
      state: {
        product,
        source: "local-market", // ✅ FIX
      },
    })
  }
>

      {/* 🔥 UPDATED: Image container with full image display */}
<div className="relative flex items-center justify-center bg-white p-4 h-48 sm:h-56 overflow-hidden rounded-lg">
  
  <img
    src={product.image}
    alt={product.name}
    className={`object-contain w-full h-full transition-transform duration-300 ${
      isOutOfStock ? "scale-105 blur-[1px]" : "scale-110 sm:scale-100"
    }`}
    onError={(e) => (e.target.src = PLACEHOLDER_IMAGE)}
  />

  {/* ❤️ WISHLIST (ALWAYS VISIBLE) */}
  <button
    onClick={handleWishlistToggle}
    className="absolute top-3 right-3 z-30
               w-9 h-9 flex items-center justify-center
               bg-white rounded-full
               shadow-[0_4px_12px_rgba(0,0,0,0.15)]
               hover:scale-110 transition"
    title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
  >
    <svg
      className="w-4 h-4 text-red-500"
      fill={inWishlist ? "#fdd8d8ff" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 26 28"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 25s-9.5-5.6-12-12.3C-1.4 7.9 1.6 2.4 7 2.1
           c2.9-.1 5.1 1.8 6 3.4
           1-1.6 3.1-3.5 6-3.4
           5.4.3 8.4 5.8 6 10.6
           C22.5 19.4 13 25 13 25z"
      />
    </svg>
  </button>

  {/* 🟥 OUT OF STOCK OVERLAY */}
  {isOutOfStock && (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70 z-10"></div>

      <div className="absolute top-12 right-[-55px] rotate-45 z-20">
        <span className="block bg-red-600 text-white text-xs sm:text-sm font-extrabold px-20 py-2 shadow-2xl tracking-widest uppercase">
          OUT OF STOCK
        </span>
      </div>
    </>
  )}
</div>

      <button
  onClick={handleWishlistToggle}
  className="absolute top-3 right-3 z-30
             w-9 h-9 flex items-center justify-center
             bg-white rounded-full
             shadow-[0_4px_12px_rgba(0,0,0,0.15)]
             hover:scale-110 transition"
  title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
>
  <svg
    className="w-4 h-4 text-red-500"
    fill={inWishlist ? "#fdd8d8ff" : "none"}
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 26 28"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 25s-9.5-5.6-12-12.3C-1.4 7.9 1.6 2.4 7 2.1
         c2.9-.1 5.1 1.8 6 3.4
         1-1.6 3.1-3.5 6-3.4
         5.4.3 8.4 5.8 6 10.6
         C22.5 19.4 13 25 13 25z"
    />
  </svg>
</button>

   

 


<div className="px-2 pt-0 pb-1 sm:px-4 sm:pt-1 sm:pb-3 flex flex-col">
  <h3 className="font-medium text-xs sm:text-base leading-tight line-clamp-2">
    {product.name}
  </h3>

  <div className="flex items-center mt-0">
    <span className="text-[11px] sm:text-sm font-medium text-yellow-500 mr-1">
      {rating.toFixed(1)}
    </span>
    <StarRating rating={rating} size="w-3 h-3 sm:w-4 sm:h-4" />
    <span className="text-[11px] text-gray-500 ml-1">
      ({reviewCount})
    </span>
  </div>

  <div className="flex items-center space-x-1 mt-0">
    {original > finalPrice ? (
      <>
        <span className="text-red-600 font-semibold text-sm sm:text-lg">
          ₹ {finalPrice}
        </span>
        <span className="line-through text-gray-500 text-xs sm:text-base">
          ₹ {original}
        </span>
      </>
    ) : (
      <span className="text-gray-900 font-bold text-sm sm:text-lg">
        ₹ {finalPrice}
      </span>
    )}
  </div>
{isOutOfStock ? (
  <button
    onClick={handleNotifyMe}
    className="w-full bg-green-600 hover:bg-green-700 text-white py-1.5 sm:py-2 rounded-md font-medium transition text-xs sm:text-base mt-1"
  >
    Notify Me
  </button>
) : qty > 0 ? (
  <button
    onClick={(e) => {
      e.stopPropagation();
      navigate("/cart");
    }}
    className="w-full bg-green-600 hover:bg-green-700 text-white py-1.5 sm:py-2 rounded-md font-medium transition text-xs sm:text-base mt-1"
  >
    View Cart
  </button>
) : (
  <button
    onClick={handleAddToCart}
    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 sm:py-2 rounded-md font-medium transition text-xs sm:text-base mt-1"
  >
    Add to Cart
  </button>
)}

</div>



</div>
     
      
     
  );
};

// ---------------- MAIN COMPONENT ----------------
const LocalMarket = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items = [], addToCart } = useCart();
 
  const [products, setProducts] = useState([]);
  const [productReviews, setProductReviews] = useState({});
  const [mainCategories, setMainCategories] = useState(["All Products"]);
  const [selectedMainCategory, setSelectedMainCategory] = useState("All Products");
  const [subCategories, setSubCategories] = useState(["All"]);
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  
  // 🔥 Brand State
  const [brands, setBrands] = useState(["All Brands"]);
  const [selectedBrand, setSelectedBrand] = useState("All Brands");
  
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedRatings, setSelectedRatings] = useState([]);

  useEffect(() => {
    if (location.state?.resetFilters) {
      setSelectedMainCategory("All Products");
      setSelectedSubCategory("All");
      setSelectedBrand("All Brands");
      setSelectedRatings([]);
      setPriceRange([0, MAX_SLIDER]);
      setShowFilters(false);
  
      // clear state so it doesn’t loop
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.key]); // ✅ THIS IS THE KEY FIX
  
  const { isLoggedIn } = useWishlist();

  const searchQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("q") || "";
  }, [location.search]);

  const getQuantity = (id) => {
    const item = items.find(i => i.id === id);
    return item ? item.quantity : 0;
  };

  const fetchAllReviews = async (productsList) => {
    try {
      const productIds = productsList.map(p => p.id);
      const reviewsRef = collection(db, "reviews");
      const reviewsSnapshot = await getDocs(reviewsRef);
      const reviewsByProduct = {}; 
      productIds.forEach(id => reviewsByProduct[id] = []);
      reviewsSnapshot.forEach((doc) => {
        const data = doc.data();
        const productId = data.productId;
        if (productId && reviewsByProduct[productId] !== undefined) {
          reviewsByProduct[productId].push({
            id: doc.id,
            rating: data.rating || 0,
            ...data
          });
        }
      });
      setProductReviews(reviewsByProduct);
    } catch (error) {
      console.error("❌ Error fetching reviews:", error);
    }
  };

  const calculateProductRating = (productId) => {
    const reviews = productReviews[productId] || [];
    if (reviews.length === 0) return null;
    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return total > 0 ? +(sum / total).toFixed(1) : null;
  };

  // ---------------- FETCH PRODUCTS ----------------
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const productsRef = collection(db, "products");
        // Only fetch products tagged with 'Local Market'
        const q = query(productsRef, where("productTag", "==", "Local Market"));
        const snap = await getDocs(q);

        const list = snap.docs.map(doc => {
          const data = doc.data();
          const img = getMainImageUrl(data);
          const { finalPrice, original, discount, variant } = getPriceData(data);
          return {
            ...data,
            id: doc.id,
            image: img,
            price: finalPrice,
            originalPrice: original,
            discount,
            variant,
            rating: data.rating || 4.3,
          };
        });

        setProducts(list);
        setMainCategories(extractMainCategories(list));
        setSubCategories(extractSubcategories(list, "All Products"));

        // 🔥 EXTRACT BRANDS DYNAMICALLY
        const brandList = extractBrands(list);
        setBrands(brandList);

        const maxPrice = Math.max(...list.map(p => p.price || 0), 1000);
        setPriceRange([0, Math.min(Math.ceil(maxPrice / 1000) * 1000, MAX_SLIDER)]);

        await fetchAllReviews(list);
        
      } catch (err) {
        console.error("Local Market Fetch Error:", err);
        setToastMessage("Error loading products");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const subs = extractSubcategories(products, selectedMainCategory);
    setSubCategories(subs);
    if (!searchQuery) setSelectedSubCategory("All");
  }, [selectedMainCategory, products, searchQuery]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleRatingToggle = (rating) => {
    setSelectedRatings(prev => {
      if (prev.includes(rating)) return prev.filter(r => r !== rating);
      return [...prev, rating];
    });
  };

  const clearRatingFilter = () => setSelectedRatings([]);

  const clearAllFilters = () => {
    setSelectedRatings([]);
    setSelectedBrand("All Brands");
    setSelectedSubCategory("All");
    setPriceRange([0, MAX_SLIDER]);
  };

  // ---------------- FILTERING ----------------
  const filtered = useMemo(() => {
    const queryTerm = searchQuery.trim().toLowerCase();

    return products.filter(p => {
      const cat = p.category?.name || "";
      const sub = p.subCategory?.name || "";
      const brand = p.brand || "";
      
      const dynamicRating = calculateProductRating(p.id);
      const productRating = dynamicRating !== null ? dynamicRating : (p.rating || 4.3);

      const price = p.price || 0;
      const priceMatch = price >= priceRange[0] && price <= priceRange[1];

      let ratingMatch = true;
      if (selectedRatings.length > 0) {
        ratingMatch = selectedRatings.some(rating => productRating >= rating);
      }

      // 🔥 BRAND MATCH
      const brandMatch = selectedBrand === "All Brands" || brand === selectedBrand;

      const searchMatch = !queryTerm || (
        keywordMatches(p.name, queryTerm) ||
        keywordMatches(p.description, queryTerm) ||
        (Array.isArray(p.searchKeywords) && p.searchKeywords.some(keyword => keywordMatches(keyword, queryTerm))) ||
        keywordMatches(p.category?.name, queryTerm) ||
        keywordMatches(p.subCategory?.name, queryTerm) ||
        keywordMatches(p.brand, queryTerm)
      );

      if (queryTerm) {
        return priceMatch && ratingMatch && brandMatch && searchMatch;
      } else {
        const mainCategoryMatch = selectedMainCategory === "All Products" || cat === selectedMainCategory;
        const subCategoryMatch = selectedSubCategory === "All" || sub === selectedSubCategory;
        return priceMatch && ratingMatch && brandMatch && mainCategoryMatch && subCategoryMatch;
      }
    });
  }, [products, selectedMainCategory, selectedSubCategory, selectedBrand, priceRange, searchQuery, selectedRatings, productReviews]);

  const handlePriceChange = (index, value) => {
    const v = Number(value) || 0;
    const copy = [...priceRange];
    copy[index] = v;
    if (copy[0] > copy[1]) {
      if (index === 0) copy[1] = copy[0];
      else copy[0] = copy[1];
    }
    setPriceRange(copy);
  };
  
  // ---------------- RENDER ----------------
  return (
    <div className="min-h-screen bg-gray-50 ml-5">
      <ToastNotification message={toastMessage} onClose={() => setToastMessage("")} />

      {/* Mobile Filter Button */}
      <div className="lg:hidden bg-white border-b shadow-sm sticky top-0 z-30">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white shadow hover:scale-110 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Local Market</h1>
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{filtered.length} products</div>
          </div>
        </div>
      </div>

      {/* Category Navbar */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-2 sm:px-4">
          <div className="flex overflow-x-auto py-2 sm:py-3 space-x-2 sm:space-x-4">
            {!searchQuery ? (
              mainCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedMainCategory(category)}
                  className={`flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition text-sm sm:text-base whitespace-nowrap ${selectedMainCategory === category ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  {category}
                </button>
              ))
            ) : (
              <h2 className="text-lg sm:text-xl font-semibold py-2">Search Results for: <span className="text-blue-600">"{searchQuery}"</span></h2>
            )}
          </div>
        </div>
      </div>

      <div className="px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-72 bg-white p-4 rounded-lg shadow-sm border lg:sticky lg:top-20 self-start z-20 max-h-[calc(100vh-120px)] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-3 lg:hidden">
              <h2 className="font-semibold text-lg">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <button onClick={clearAllFilters} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear all filters
              </button>
            </div>

            {/* 1. SUBCATEGORIES */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Subcategories</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {subCategories.map((subCat) => (
                  <label key={subCat} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="radio"
                      name="subcategory"
                      checked={selectedSubCategory === subCat}
                      onChange={() => setSelectedSubCategory(subCat)}
                      className="text-blue-600"
                    />
                    <span className="text-sm">{subCat}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="my-4" />

            {/* 2. BRAND - 🔥 DYNAMIC BRAND FILTER */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Brand</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {brands.map((brand) => (
                  <label 
                    key={brand} 
                    className={`flex items-center space-x-2 cursor-pointer p-1 rounded transition ${selectedBrand === brand ? "bg-blue-50 border-blue-200 border" : "hover:bg-gray-50"}`}
                  >
                    <input
                      type="radio"
                      name="brand"
                      checked={selectedBrand === brand}
                      onChange={() => setSelectedBrand(brand)} // 🔥 Update selected brand state
                      className="text-blue-600"
                    />
                    <span className={`text-sm ${selectedBrand === brand ? "font-semibold text-blue-700" : "text-gray-700"}`}>
                      {brand}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="my-4" />

            {/* 3. CUSTOMER RATINGS */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium">Customer Ratings</h3>
                
              </div>
              <div className="space-y-3">
                {[4, 3, 2, 1].map(star => {
                  const count = products.filter(p => { 
                    const dynamicRating = calculateProductRating(p.id);
                    const rating = dynamicRating !== null ? dynamicRating : (p.rating || 4.3);
                    return rating >= star;
                  }).length;
                  return (
                    <label key={star} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={selectedRatings.includes(star)} onChange={() => handleRatingToggle(star)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                        <div className="flex items-center">
                          <span className="text-yellow-500 text-sm">{"★".repeat(star)}</span>
                          <span className="ml-2 text-sm font-medium text-gray-700">& above</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{count}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <hr className="my-4" />

            {/* 4. PRICE RANGE */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-4">Price Range</h3>
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Min: ₹{priceRange[0].toLocaleString()}</span>
                <span>Max: ₹{priceRange[1].toLocaleString()}</span>
              </div>
              <div className="relative pt-1 mb-2">
                <input type="range" min="0" max={MAX_SLIDER} value={priceRange[0]} onChange={(e) => handlePriceChange(0, e.target.value)} className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-40 opacity-0" />
                <input type="range" min="0" max={MAX_SLIDER} value={priceRange[1]} onChange={(e) => handlePriceChange(1, e.target.value)} className="absolute w-full h-2 bg-transparent appearance-none pointer-events-auto z-50 custom-range-slider focus:outline-none" style={{ WebkitAppearance: 'none' }} />
                <div className="h-2 bg-gray-300 rounded-full"></div> 
                <div className="absolute h-2 bg-blue-600 rounded-full pointer-events-none top-1" style={{ left: `${(priceRange[0] / MAX_SLIDER) * 100}%`, width: `${((priceRange[1] - priceRange[0]) / MAX_SLIDER) * 100}%` }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>₹0</span>
                <span>₹{MAX_SLIDER.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="lg:hidden">
              <button onClick={() => setShowFilters(false)} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">Apply Filters</button>
            </div>
          </div>
          
          {/* Products Area */}
          <div className="flex-1 ml-4">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">
                  {searchQuery ? `Results for "${searchQuery}"` : selectedMainCategory === "All Products" ? "All Products" : selectedMainCategory}
                  {!searchQuery && selectedSubCategory !== "All" && ` - ${selectedSubCategory}`}
                  {selectedBrand !== "All Brands" && ` - ${selectedBrand}`}
                   
                </h2>
                {(selectedSubCategory !== "All" || selectedBrand !== "All Brands" || selectedRatings.length > 0) && (
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                     
                     
                     
                  </div>
                )}
              </div>
              <div className="hidden sm:block text-sm text-gray-600 bg-gray-100 px-3 py-1 mr-5 rounded-full">{filtered.length} products</div>
            </div>

            {loading && <div className="text-center py-10 text-gray-500">Loading products…</div>}

            {!loading && filtered.length === 0 && (
              <div className="bg-white border rounded-lg shadow-sm text-center py-10 text-gray-500">
                {searchQuery ? `No products found matching "${searchQuery}"` : "No products found"}
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters.</p>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filtered.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    addToCart={addToCart}
                    getQuantity={getQuantity}
                    navigate={navigate}
                    onWishlistToggle={(msg) => setToastMessage(msg)}
                    isLoggedIn={isLoggedIn}
                    calculateProductRating={calculateProductRating}
                    productReviews={productReviews}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalMarket;