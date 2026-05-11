import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { db } from "../../firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";

const PLACEHOLDER_IMAGE = "https://placehold.co/400x300?text=No+Image";

// ⭐ STAR RATING COMPONENT
const StarRating = ({ rating = 0, size = "w-4 h-4" }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1;
        return (
          <div key={i} className="relative">
            {/* Gray background star */}
            <svg
              className={`${size} text-gray-300`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>

            {/* Colored star overlay */}
            {(starValue <= fullStars ||
              (starValue === fullStars + 1 && hasHalfStar)) && (
              <svg
                className={`${size} text-yellow-400 absolute inset-0`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ⭐ FETCH REVIEW STATS FROM FIREBASE
const fetchReviewStats = async (productId) => {
  try {
    const q = query(
      collection(db, "reviews"),
      where("productId", "==", productId)
    );

    const snap = await getDocs(q);

    let total = 0;
    let count = 0;

    snap.forEach((doc) => {
      const data = doc.data();
      if (typeof data.rating === "number") {
        total += data.rating;
        count++;
      }
    });

    return {
      rating: count > 0 ? Number((total / count).toFixed(1)) : 0,
      reviewCount: count,
    };
  } catch (error) {
    console.error(`Error fetching review stats for ${productId}:`, error);
    return {
      rating: 0,
      reviewCount: 0,
    };
  }
};

// ⭐ PRICE HELPER FUNCTION
const getVariantPrice = (product) => {
  if (!Array.isArray(product?.variants) || product.variants.length === 0) {
    const price = Number(product.price || 0);
    return {
      finalPrice: price,
      originalPrice: 0,
    };
  }

  const variant =
    product.variants.find(v => Number(v.price) > 0) ||
    product.variants[0];

  if (!variant) {
    return { finalPrice: 0, originalPrice: 0 };
  }

  const price = Number(variant.price || 0);
  const offer = Number(variant.offerPrice);

  if (!isNaN(offer) && offer > 0 && offer < price) {
    return {
      finalPrice: offer,
      originalPrice: price,
    };
  }

  return {
    finalPrice: price,
    originalPrice: 0,
  };
};



  

// ⭐ UNIFIED PRODUCT FETCH FUNCTION
const fetchProductDetails = async (productId) => {
  try {
    // Try different collections in order
    const collections = ["products", "localmarket", "printing", "e-store"];
    
    for (const collectionName of collections) {
      try {
        const productRef = doc(db, collectionName, productId);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          const productData = productSnap.data();
          
          // Fetch reviews for this product
          const reviewStats = await fetchReviewStats(productId);
          
          // Determine image URL
          const image = 
            productData.imageUrls?.find((i) => i.isMain)?.url ||
            productData.imageUrls?.[0]?.url ||
            productData.mainImageUrl || 
            productData.image || 
            PLACEHOLDER_IMAGE;
          
          // Determine productTag from collection or data
          const productTag = productData.productTag || collectionName;
          
          return {
            id: productSnap.id,
            ...productData,
            rating: reviewStats.rating,
            reviewCount: reviewStats.reviewCount,
            image,
            productTag,
          };
        }
      } catch (error) {
        console.log(`Not found in ${collectionName}:`, error.message);
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching product details:", error);
    return null;
  }
};

/* 🛒 PRODUCT CARD COMPONENT */
const WishlistProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { toggleWishlist } = useWishlist();
  const { addToCart, items } = useCart();
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(true);
// 🔥 STOCK CHECK


  // Fetch product details on component mount
  useEffect(() => {
    const loadProductDetails = async () => {
      setLoading(true);
      try {
        const details = await fetchProductDetails(product.id);
        if (details) {
          setProductDetails(details);
        } else {
          // If not found in Firebase, use the basic product data from wishlist context
          setProductDetails({
            ...product,
            rating: product.rating || 4.3,
            reviewCount: product.reviewCount || 0,
            image: product.image || PLACEHOLDER_IMAGE,
            productTag: product.productTag || "products",
          });
        }
      } catch (error) {
        console.error("Error loading product details:", error);
        setProductDetails({
          ...product,
          rating: product.rating || 4.3,
          reviewCount: product.reviewCount || 0,
          image: product.image || PLACEHOLDER_IMAGE,
          productTag: product.productTag || "products",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProductDetails();
  }, [product]);

  
  // Get price using helper function
  const displayProduct = productDetails || product;
 

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

const availableStock = getAvailableStock(displayProduct);
const isOutOfStock = availableStock === 0;

// 🔔 NOTIFY ME
const handleNotifyMe = (e) => {
  e.stopPropagation();

  const phoneNumber = "918762978777";
  const message = encodeURIComponent(
    `Hello, please notify me when this product is back in stock.\n\nProduct: ${displayProduct.name}`
  );

  window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
};

  const { finalPrice, originalPrice } = getVariantPrice(displayProduct);
  const discount = originalPrice > 0 
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) 
    : 0;

  const qty = items.find((i) => i.id === product.id)?.quantity || 0;

  const handleAddToCart = (e) => {
  e.stopPropagation();

  if (availableStock === 0) return;

  addToCart({
    id: displayProduct.id,
    productId: displayProduct.id,
    name: displayProduct.name,
    price: finalPrice,
    originalPrice,
    quantity: 1,
    stock: availableStock,     // ✅ REQUIRED
    image: displayProduct.image,
  });
};


  const handleViewCart = (e) => {
    e.stopPropagation();
    navigate("/cart");
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    toggleWishlist(displayProduct);
  };

  const handleProductClick = () => {
    navigate(`/product/${product.id}`, { 
      state: { 
        product: displayProduct, 
        source: displayProduct.productTag || "products" 
      } 
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm flex flex-col w-full max-w-[250px] mx-auto animate-pulse">
        <div className="h-48 bg-gray-300"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
          <div className="h-6 bg-gray-300 rounded mb-2 w-1/2"></div>
        </div>
      </div>
    );
  }

  const rating = displayProduct.rating || 4.3;
  const reviewCount = displayProduct.reviewCount || 0;
  const productImage = displayProduct.image || PLACEHOLDER_IMAGE;

  return (
    <div
      className="bg-white rounded-lg border shadow-sm hover:shadow-md transition cursor-pointer flex flex-col w-full max-w-[250px] mx-auto"
      onClick={handleProductClick}
    >
    <div className="relative flex items-center justify-center bg-white p-3 h-48 sm:h-56 overflow-hidden">
  
  {/* PRODUCT IMAGE */}
  <img
    src={productImage}
    alt={displayProduct.name}
    className={`object-contain w-full h-full transition-transform duration-300 ${
      isOutOfStock ? "scale-105 blur-[1px]" : ""
    }`}
    onError={(e) => (e.target.src = PLACEHOLDER_IMAGE)}
  />

  {/* ❤️ WISHLIST BUTTON */}
  <button
    onClick={handleWishlistToggle}
    className="absolute top-3 right-3 z-30
               p-2 bg-white rounded-full
               shadow-md hover:scale-110 transition
               text-red-600"
    aria-label="Remove from wishlist"
  >
    X
  </button>

  {/* 🟥 OUT OF STOCK OVERLAY (SAME AS E-STORE) */}
  {isOutOfStock && (
    <>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70 z-10" />

      {/* Diagonal ribbon */}
      <div className="absolute top-12 right-[-55px] rotate-45 z-20">
        <span className="block bg-red-600 text-white
                         text-xs sm:text-sm
                         font-extrabold
                         px-20 py-2
                         shadow-2xl
                         tracking-widest uppercase">
          Out of Stock
        </span>
      </div>
    </>
  )}

  {/* DISCOUNT BADGE */}
  {discount > 0 && !isOutOfStock && (
    <span className="absolute top-3 left-3 bg-red-600 text-white text-xs px-2 py-1 rounded z-20">
      -{discount}%
    </span>
  )}
</div>


      {/* CONTENT */}
      <div className="px-2 sm:px-4 pb-3 flex flex-col flex-grow">
        <h3 className="font-medium text-xs sm:text-base leading-tight line-clamp-2 min-h-[2.5rem]">
          {displayProduct.name || "Product Name"}
        </h3>

        {/* RATING */}
        <div className="flex items-center mt-1">
          <span className="text-[11px] sm:text-sm font-medium text-yellow-500 mr-1">
            {rating.toFixed(1)}
          </span>
          <StarRating rating={rating} size="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-[11px] text-gray-500 ml-1">
            ({reviewCount})
          </span>
        </div>

        {/* PRICE */}
        <div className="flex items-center gap-1 mt-0.5">
          {originalPrice > finalPrice ? (
            <>
              <span className="text-red-600 font-semibold text-sm sm:text-lg">
                ₹ {finalPrice.toLocaleString()}
              </span>
              <span className="line-through text-gray-500 text-xs sm:text-base">
                ₹ {originalPrice.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-gray-900 font-bold text-sm sm:text-lg">
              ₹ {finalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* ADD TO CART / VIEW CART BUTTON */}
        {isOutOfStock ? (
  <button
    onClick={handleNotifyMe}
    className="w-full mt-2
               bg-green-600 hover:bg-green-700
               text-white py-1.5 sm:py-2
               rounded-md font-medium
               text-xs sm:text-base transition"
  >
    Notify Me
  </button>
) : qty > 0 ? (
  <button
    onClick={handleViewCart}
    className="w-full mt-2
               bg-green-600 hover:bg-green-700
               text-white py-1.5 sm:py-2
               rounded-md font-medium
               text-xs sm:text-base transition"
  >
    View Cart
  </button>
) : (
  <button
    onClick={handleAddToCart}
    className="w-full mt-2
               bg-blue-600 hover:bg-blue-700
               text-white py-1.5 sm:py-2
               rounded-md font-medium
               text-xs sm:text-base transition"
  >
    Add to Cart
  </button>
)}

      </div>
    </div>
  );
};

/* 📦 MAIN WISHLIST PAGE */
const WishlistPage = () => {
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [enhancedWishlist, setEnhancedWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Enhance wishlist items with additional details
  useEffect(() => {
    const enhanceWishlistItems = async () => {
      if (wishlist.length === 0) {
        setEnhancedWishlist([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const enhancedItems = await Promise.all(
          wishlist.map(async (item) => {
            try {
              const details = await fetchProductDetails(item.id);
              if (details) {
                return {
                  ...item,
                  ...details,
                  rating: details.rating || item.rating || 4.3,
                  reviewCount: details.reviewCount || item.reviewCount || 0,
                  image: details.image || item.image || PLACEHOLDER_IMAGE,
                  productTag: details.productTag || item.productTag || "products",
                };
              }
              return item;
            } catch (error) {
              console.error(`Error enhancing item ${item.id}:`, error);
              return item;
            }
          })
        );
        
        setEnhancedWishlist(enhancedItems.filter(Boolean));
      } catch (error) {
        console.error("Error enhancing wishlist:", error);
        setEnhancedWishlist(wishlist);
      } finally {
        setLoading(false);
      }
    };

    enhanceWishlistItems();
  }, [wishlist]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-2 sm:px-4 py-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
          <div className="h-4 bg-gray-200 rounded w-48 mt-2 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg border shadow-sm flex flex-col w-full max-w-[250px] mx-auto animate-pulse">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded mb-2 w-1/2"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 sm:px-4 py-4">
      {/* Page Header */}
      <div className="mb-6">
         
        
      </div>

      {enhancedWishlist.length === 0 ? (
        <div className="bg-white border rounded-lg shadow-sm text-center py-12 text-gray-500 max-w-md mx-auto">
          <svg
            className="w-20 h-20 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <p className="text-xl font-medium mb-2">Your wishlist is empty</p>
          <p className="text-sm text-gray-400 mb-6">
            Save items you love for later by clicking the heart icon
          </p>
          <button
            onClick={() => navigate("/e-store")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          {/* Optional: Clear All Button */}
           
          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {enhancedWishlist.map((product) => (
              <WishlistProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default WishlistPage;