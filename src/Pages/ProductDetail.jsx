import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { db } from "../../firebase";
import { useRef } from "react";

import {

  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  runTransaction,
} from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";


// ⭐ Star Rating Component



const StarRating = ({
  rating = 0,
  size = "w-4 h-4",
  color = "text-yellow-500",
  showText = false,
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center">
      {Array(5)
        .fill(0)
        .map((_, i) => {
          const starValue = i + 1;

          return (
            <div key={i} className="relative">
              <svg
                className={`${size} text-gray-300`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>

              {(starValue <= fullStars ||
                (starValue === fullStars + 1 && hasHalfStar)) && (
                <svg
                  className={`${size} ${color} absolute inset-0`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </div>
          );
        })}

      {showText && (
        <span className="ml-2 text-sm font-semibold text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

// ⭐ Review Modal Component
const WriteReviewModal = ({
  onClose,
  onSubmit,
  productName,
  currentUser,
  productId,
  navigate,
}) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [errors, setErrors] = useState({});



  const validateForm = () => {
    const newErrors = {};

    if (!rating) newErrors.rating = "Please select a rating";
    if (!title.trim()) newErrors.title = "Review title is required";
    if (!content.trim()) newErrors.content = "Review content is required";
    if (content.trim().length < 10)
      newErrors.content = "Review must be at least 10 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitReview = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const ok = await onSubmit({ rating, title, content });
      if (ok) {
        onClose();
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      setErrors({ submit: "Failed to submit review. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    if (window.history.state?.state?.showReviewModal) {
      navigate(`/product/${productId}`, { replace: true });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl">Write a Review – {productName}</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-black transition-colors p-1 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {errors.submit}
          </div>
        )}

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Reviewing as:</span>
            {currentUser
              ? currentUser.displayName || currentUser.name || "User"
              : "Guest User"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {currentUser
              ? `User ID: ${currentUser.uid || currentUser.id}`
              : "You're reviewing as a guest"}
          </p>
        </div>

        <form onSubmit={submitReview}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating *
            </label>
            <div className="flex justify-center space-x-1">
              {Array(5)
                .fill(0)
                .map((_, i) => {
                  const starValue = i + 1;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(starValue)}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none"
                    >
                      <svg
                        className={`w-10 h-10 cursor-pointer transition-transform hover:scale-110 ${
                          starValue <= (hoverRating || rating)
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  );
                })}
            </div>
            {errors.rating && (
              <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review Title *
              </label>
              <input
                className={`border ${
                  errors.title ? "border-red-500" : "border-gray-300"
                } p-3 rounded-lg w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                placeholder="What's most important to know?"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors((prev) => ({ ...prev, title: "" }));
                }}
                maxLength={100}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Review *
              </label>
              <textarea
                className={`border ${
                  errors.content ? "border-red-500" : "border-gray-300"
                } p-3 rounded-lg w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                rows={4}
                placeholder="Share your experience with this product..."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setErrors((prev) => ({ ...prev, content: "" }));
                }}
                maxLength={1000}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 rounded-lg text-white font-semibold mt-6 transition-all ${
              submitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            }`}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ⭐ FETCH AVG RATING & REVIEW COUNT FROM REVIEWS COLLECTION
const fetchReviewStats = async (productId) => {
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
};

// ⭐ PRICE HELPER
const getVariantPrice = (product) => {
  if (!Array.isArray(product?.variants)) {
    return {
      finalPrice: product.price || 0,
      originalPrice: 0,
    };
  }

  const variant =
    product.variants.find((v) => v.offerPrice || v.price) ||
    product.variants[0];

  if (!variant) {
    return { finalPrice: 0, originalPrice: 0 };
  }

  const price = Number(variant.price || 0);
  const offer = Number(variant.offerPrice || 0);

  if (offer > 0 && offer < price) {
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

// 🛒 Related Products Component - REMOVED storeLabel from props
const RelatedProducts = ({
  categoryId,
  currentProductId,
  source,
}) => {
  const navigate = useNavigate();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!categoryId || !source) return;

      setLoading(true);
      try {
        let collectionName = "products";
      

        const productsRef = collection(db, collectionName);
        const querySnapshot = await getDocs(productsRef);

        const products = [];

        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();

          const productCategory =
            typeof data.category === "object"
              ? data.category.id
              : data.category;
          const categoryToCompare =
            typeof categoryId === "object" ? categoryId.id : categoryId;

          if (
            productCategory === categoryToCompare &&
            docSnap.id !== currentProductId
          ) {
            const reviewStats = await fetchReviewStats(docSnap.id);

            const { finalPrice, originalPrice } = getVariantPrice(data);

            products.push({
              id: docSnap.id,
              ...data,
              image: data.imageUrls?.[0]?.url || "",
              price: finalPrice,
              originalPrice: originalPrice,
              name: data.name,
              rating: reviewStats.rating,
              reviewCount: reviewStats.reviewCount,
            });
          }
        }

        const selectedProducts = products
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);

        setRelatedProducts(selectedProducts);
      } catch (error) {
        console.error("Error fetching related products:", error);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [categoryId, currentProductId, source]);

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Related Products from
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-300"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded mb-2 w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    console.log("No related products found");
    return null;
  }

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
        <button
          onClick={() => {
            let storePath = "";
            switch (source) {
              case "local-market":
                storePath = "/local-market";
                break;
              case "printing":
                storePath = "/Printing";
                break;
              default:
                storePath = "/e-store";
                break;
            }

          navigate(
  source === "local-market"
    ? "/local-market"
    : source === "printing"
    ? "/Printing"
    : "/e-store"
);


            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }, 0);
          }}
          className="text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-2 hover:underline transition-colors"
        >
          View All
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 h-[299px] mt-2">
        {relatedProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-200 hover:border-purple-300"
            onClick={() =>
              navigate(`/product/${product.id}`, {
                state: {
                  product,
                  source: source,

                },
              })
            }
          >
            <div className="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/300x200?text=Product";
                  }}
                />
              ) : (
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              )}
            </div>

            <div className="p-3">
              <h3 className="font-medium text-xs sm:text-base leading-tight line-clamp-2">
                {product.name}
              </h3>

              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-sm font-medium text-yellow-600">
                  {(product.rating ?? 0).toFixed(1)}
                </span>

                <StarRating
                  rating={product.rating ?? 0}
                  size="w-3 h-3"
                  color="text-yellow-500"
                />

                <span className="text-xs text-gray-500">
                  ({product.reviewCount ?? 0})
                </span>
              </div>
<div className="flex items-center gap-1 mt-0.5">
  <span className="text-base font-bold text-gray-900">
    ₹{product.price > 0 ? product.price.toLocaleString() : "—"}
  </span>

  {product.originalPrice > product.price && (
    <span className="text-xs text-gray-500 line-through">
      ₹{product.originalPrice.toLocaleString()}
    </span>
  )}
</div>


              <div className="mt-1">
                <span className="inline-flex w-full items-center justify-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded transition">
                  View
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ⭐ Stock Management Modal Component
const StockManagementModal = ({
  product,
  variant,
  onClose,
  onStockUpdate
}) => {
  const [stock, setStock] = useState(variant?.stock || 0);
  const [maxStock, setMaxStock] = useState(variant?.maxStock || 100);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await onStockUpdate(stock, maxStock);
      onClose();
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-xl">Manage Stock</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black transition-colors p-1 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Product Details</h3>
            <p className="text-gray-700"><strong>Name:</strong> {product?.name}</p>
            <p className="text-gray-700"><strong>Variant:</strong> {variant?.color} {variant?.size ? `- ${variant.size}` : ''}</p>
            <p className="text-gray-700"><strong>Variant ID:</strong> {variant?.variantId || variant?.variant_id || 'N/A'}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stock
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStock(prev => Math.max(0, prev - 1))}
                  className="w-10 h-10 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center text-lg font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                  className="w-24 text-center py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="0"
                />
                <button
                  onClick={() => setStock(prev => prev + 1)}
                  className="w-10 h-10 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center text-lg font-bold"
                >
                  +
                </button>
                <span className="text-gray-600 ml-2">units</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Stock Capacity
              </label>
              <input
                type="number"
                value={maxStock}
                onChange={(e) => setMaxStock(parseInt(e.target.value) || 0)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="0"
                placeholder="Maximum stock capacity"
              />
              <p className="text-sm text-gray-500 mt-1">Set the maximum stock this variant can hold</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Stock Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current:</span>
                  <span className={`font-bold ${stock === 0 ? 'text-red-600' : stock < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {stock} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-bold text-blue-600">{maxStock} units</span>
                </div>
                <div className="flex justify-between">
                  
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-lg text-gray-700 font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className={`flex-1 py-3 rounded-lg text-white font-semibold transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg"
              }`}
            >
              {loading ? "Updating..." : "Update Stock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to check if URL is a video
const isVideoUrl = (url) => {
  if (!url) return false;

  const videoExtensions = [
    ".mp4",
    ".webm",
    ".ogg",
    ".mov",
    ".avi",
    ".wmv",
    ".flv",
    ".mkv",
  ];
  const urlLower = url.toLowerCase();

  return (
    videoExtensions.some((ext) => urlLower.includes(ext)) ||
    urlLower.includes("video") ||
    (urlLower.includes("firebasestorage") &&
      (urlLower.includes(".mp4") ||
        urlLower.includes(".webm") ||
        urlLower.includes(".ogg")))
  );
};



// ⭐ Main Product Detail Component
const ProductDetail = ({ product: propProduct }) => {
const manualImageChangeRef = useRef(false);

  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const storage = getStorage();
  const { addToCart } = useCart();

  const [popup, setPopup] = useState({
  show: false,
  message: "",
  type: "warning",
});

  const showPopup = (message, type = "warning") => {
  setPopup({ show: true, message, type });

  setTimeout(() => {
    setPopup({ show: false, message: "", type });
  }, 2500);
};

  const productState = useMemo(() => location.state?.product, [location.state]);

  const [product, setProduct] = useState(propProduct || null);
  const resolvedSource = useMemo(() => {
  const path = location.pathname;

  if (path.startsWith("/local-market")) return "local-market";
  if (path.startsWith("/Printing")) return "printing";

  return (
    location.state?.source ||
    product?.productTag ||
    product?.source ||
    "e-store"
  );
}, [location.pathname, location.state, product]);


   const handleNotifyMe = () => {
  const phoneNumber = "918762978777"; // 🔁 replace with YOUR WhatsApp number (with country code)

  const message = encodeURIComponent(
    `Hello, I want to be notified when this product is back in stock.\n\nProduct: ${product.name}`
  );

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  window.open(whatsappUrl, "_blank");
};
  const [loading, setLoading] = useState(!propProduct);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [currentImg, setCurrentImg] = useState("");
  const [currentIsVideo, setCurrentIsVideo] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [variant, setVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [stats, setStats] = useState({
    avg: 0,
    total: 0,
    dist: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { toggleWishlist, isProductInWishlist } = useWishlist();

const inWishlist = product ? isProductInWishlist(product.id) : false;

const handleWishlistToggle = (e) => {
  e.stopPropagation();

  if (!product) return;

  // ✅ TRUST currentUser (already synced with login)
  if (!currentUser) {
    navigate("/login", {
      state: {
        from: `/product/${productId}`,
        wishlistRedirect: true,
        productId,
      },
    });
    return;
  }

  toggleWishlist(product);
};



  const productTag = resolvedSource;
const source = resolvedSource;


  // 🔙 BACK BUTTON HANDLER
  const handleBack = () => {
 

const STORE_ROUTES = {
  "local-market": "/local-market",
  printing: "/Printing",
  "e-store": "/e-store",
};

navigate(STORE_ROUTES[resolvedSource] || "/e-store");



    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  };

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = () => {
      const userDataStr = localStorage.getItem("userData");
      const userStr = localStorage.getItem("user");

      try {
        let userData = null;
        if (userDataStr) userData = JSON.parse(userDataStr);
        else if (userStr) userData = JSON.parse(userStr);

        if (userData) {
          const isAdminUser =
            userData.role === "admin" ||
            userData.role === "superadmin" ||
            (userData.email && userData.email.includes("admin")) ||
            userData.isAdmin === true;

          setIsAdmin(isAdminUser);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();

    const handleStorageChange = () => {
      checkAdminStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // 🔝 AUTO SCROLL TO TOP
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [productId]);

  // 🔄 GET CURRENT LOGGED IN USER
  useEffect(() => {
    const getUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userDataStr = localStorage.getItem("userData");
        const userStr = localStorage.getItem("user");

        if (token) {
          let userData = null;

          if (userDataStr) {
            try {
              userData = JSON.parse(userDataStr);
            } catch (e) {
              console.error("Error parsing userData:", e);
            }
          }

          if (!userData && userStr) {
            try {
              userData = JSON.parse(userStr);
            } catch (e) {
              console.error("Error parsing user:", e);
            }
          }

          if (userData) {
            setCurrentUser({
              uid: userData.uid || token,
              id: userData.uid || token,
              ...userData,
              displayName:
                userData.displayName ||
                userData.name ||
                userData.email?.split("@")[0] ||
                "User",
              email: userData.email || "",
              photoURL: userData.photoURL || "",
            });
          } else {
            try {
              const userRef = doc(db, "users", token);
              const userSnap = await getDoc(userRef);

              if (userSnap.exists()) {
                const userData = userSnap.data();
                setCurrentUser({
                  uid: token,
                  id: token,
                  ...userData,
                  displayName: userData.displayName || userData.name || "User",
                  email: userData.email || "",
                  photoURL: userData.photoURL || "",
                });
              } else {
                setCurrentUser(null);
              }
            } catch (error) {
              console.log("❌ Error fetching from Firestore:", error);
              setCurrentUser(null);
            }
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("❌ Error getting user data:", error);
        setCurrentUser(null);
      }
    };

    getUserData();

    const handleStorageChange = (e) => {
      if (
        e.key === "token" ||
        e.key === "userData" ||
        e.key === "user" ||
        e.key === "isLoggedIn"
      ) {
        getUserData();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const storagePollInterval = setInterval(() => {
      const token = localStorage.getItem("token");
      if ((token && !currentUser) || (!token && currentUser)) {
        getUserData();
      }
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(storagePollInterval);
    };
  }, []);

  // ⭐ Auto-open review modal after login redirect
  useEffect(() => {
    const { state } = location;

    if (state?.showReviewModal && currentUser) {
      setTimeout(() => {
        setShowReviewModal(true);
      }, 300);

      setTimeout(() => {
        if (location.state?.showReviewModal) {
          navigate(`/product/${productId}`, { replace: true });
        }
      }, 500);
    }
  }, [location.state, currentUser, navigate, productId]);

  // Debug: Log variant data when it changes
  useEffect(() => {
    if (variant) {
      console.log("Current variant updated:", variant);
      console.log("Variant stock:", variant.stock);
      console.log("Type of stock:", typeof variant.stock);
      console.log("Current quantity:", quantity);
    }
  }, [variant, quantity]);

  // Helper function to get available stock
  const getAvailableStock = useCallback(() => {
    if (!variant || variant.stock === undefined || variant.stock === null) {
      return 9999; // Unlimited stock if not specified
    }
    
    // Ensure it's a number
    const stock = Number(variant.stock);
    console.log("getAvailableStock - Raw stock:", variant.stock, "Parsed:", stock);
    return isNaN(stock) ? 9999 : stock;
  }, [variant]);

  // 📝 FETCH REVIEWS FROM FIRESTORE
  const fetchReviews = useCallback(async () => {
    try {
      if (!productId) return;

      const q = query(
        collection(db, "reviews"),
        where("productId", "==", productId)
      );

      const querySnapshot = await getDocs(q);

      const reviewsData = [];
      const authenticatedUserIds = new Set();

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        reviewsData.push({
          id: doc.id,
          rating: data.rating || 0,
          title: data.title || "",
          content: data.content || "",
          userName: data.userName || "Anonymous",
          userId: data.userId || "guest",
          userType: data.userType || "guest",
          productId: data.productId || "",
          productName: data.productName || "",
          verifiedPurchase: data.verifiedPurchase || false,
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate()
            : new Date(),
        });

        if (
          data.userId &&
          !data.userId.startsWith("guest_") &&
          data.userType === "authenticated"
        ) {
          authenticatedUserIds.add(data.userId);
        }
      });

      const usersData = {};

      if (authenticatedUserIds.size > 0) {
        const userPromises = Array.from(authenticatedUserIds).map(
          async (userId) => {
            try {
              const userRef = doc(db, "users", userId);
              const userSnap = await getDoc(userRef);

              if (userSnap.exists()) {
                const userData = userSnap.data();
                usersData[userId] = {
                  uid: userId,
                  id: userId,
                  ...userData,
                  displayName:
                    userData.displayName ||
                    userData.name ||
                    userData.email?.split("@")[0] ||
                    "User",
                  photoURL: userData.photoURL || "",
                };
              } else {
                usersData[userId] = {
                  uid: userId,
                  id: userId,
                  displayName: "User",
                  photoURL: "",
                };
              }
            } catch (error) {
              console.error(`Error fetching user ${userId}:`, error);
              usersData[userId] = {
                uid: userId,
                id: userId,
                displayName: "User",
                photoURL: "",
              };
            }
          }
        );

        await Promise.all(userPromises);
      }

      setUsersMap(usersData);

      reviewsData.sort((a, b) => b.createdAt - a.createdAt);
      setReviews(reviewsData);

      const total = reviewsData.length;
      let sum = 0;
      const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      reviewsData.forEach((review) => {
        const rating = Math.max(
          1,
          Math.min(5, Math.floor(Number(review.rating) || 0))
        );
        dist[rating] = (dist[rating] || 0) + 1;
        sum += rating;
      });

      const avg =
        total === 0 ? product?.rating || 4.3 : +(sum / total).toFixed(1);
      setStats({ avg, total, dist });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setStats({
        avg: product?.rating || 4.3,
        total: 0,
        dist: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
    }
  }, [productId, product?.rating]);

 const getCollectionName = () => "products";
useEffect(() => {
  if (!images.length) return;

  // ❌ if image was changed manually, skip auto logic
  if (manualImageChangeRef.current) {
    manualImageChangeRef.current = false;
    return;
  }

  // ✅ color-based image
  if (selectedColor) {
    const colorImages = images.filter(
      img => img.color === selectedColor
    );

    if (colorImages.length > 0) {
      setCurrentImg(colorImages[0].url);
      setCurrentIsVideo(false);
      setImageLoading(true);
      return;
    }
  }

  // fallback
  setCurrentImg(images[0].url);
  setCurrentIsVideo(false);
  setImageLoading(true);
}, [images, selectedColor]);



  // 🔄 LOAD PRODUCT DATA
  useEffect(() => {
    const loadProduct = async () => {
      if (propProduct) {
        setProduct(propProduct);
        processProductData(propProduct);
        await fetchReviews();
        setLoading(false);
        return;
      }

      setLoading(true);
      setImageLoading(true);

      try {
        let productData = null;

        if (productState && productState.id === productId) {
          productData = productState;
        } else {
          const collectionName = getCollectionName();
const productRef = doc(db, collectionName, productId);

      const productSnap = await getDoc(productRef);

if (!productSnap.exists()) {
  setProduct(null);
  setLoading(false);
  return;
}

productData = {
  id: productSnap.id,
  ...productSnap.data(),
  source:
    location.state?.source ||
    productSnap.data()?.productTag ||
    "e-store",
};


        }

        if (productData) {
          setProduct(productData);
          processProductData(productData);
          await fetchReviews();
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Error loading product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    const processProductData = (productData) => {
      const imageUrls = productData.imageUrls || [];
      const galleryImages = imageUrls
  .filter((img) => typeof img === "object" && img.isMain !== true)
  .map((img) => ({
    url: img.url,
    color: img.color || "",
    isMain: img.isMain || false,
  }))
  .filter(img => img.url);

setImages(galleryImages);



      let videoUrls = [];

      if (productData.videoUrls && Array.isArray(productData.videoUrls)) {
        videoUrls = productData.videoUrls
          .map((video) => {
            if (typeof video === "string") return video;
            if (video?.url) return video.url;
            return null;
          })
          .filter(Boolean);
      }

      if (
        productData.videoStoragePaths &&
        Array.isArray(productData.videoStoragePaths)
      ) {
        const videoPromises = productData.videoStoragePaths.map(
          async (storagePath) => {
            try {
              if (!storagePath) return null;
              const videoRef = ref(storage, storagePath);
              const downloadURL = await getDownloadURL(videoRef);
              return downloadURL;
            } catch (error) {
              console.error(
                `Error fetching video from path ${storagePath}:`,
                error
              );
              return null;
            }
          }
        );

        Promise.all(videoPromises).then((fetchedVideoUrls) => {
          const allVideoUrls = [
            ...videoUrls,
            ...fetchedVideoUrls.filter(Boolean),
          ];
          setVideos(allVideoUrls);
        });
      } else {
        setVideos(videoUrls);
      }

      if (productData.videoUrl && !videoUrls.includes(productData.videoUrl)) {
        setVideos((prev) => [...prev, productData.videoUrl]);
      }

      const variants = productData.variants || [];

      const colors = [
        ...new Set(
          variants
            .filter((v) => v.color)
            .map((v) => v.color)
            .filter(Boolean)
        ),
      ];

      const sizes = [
        ...new Set(
          variants
            .filter((v) => v.size)
            .map((v) => v.size)
            .filter(Boolean)
        ),
      ];

      setAvailableColors(colors);
      setAvailableSizes(sizes);

    

    


      if (colors.length > 0) {
        setSelectedColor(colors[0]);
      }
      if (sizes.length > 0) {
        setSelectedSize(sizes[0]);
      }

      let initialVariant = null;

      if (colors.length > 0 && sizes.length > 0) {
        initialVariant = variants.find(
          (v) => v.color === colors[0] && v.size === sizes[0]
        );
      }

      if (!initialVariant && colors.length > 0) {
        initialVariant = variants.find((v) => v.color === colors[0]);
      }

      if (!initialVariant) {
        initialVariant = variants[0] || null;
      }

      setVariant(initialVariant);
    };

    loadProduct();
 
  }, [productId, productState, fetchReviews, propProduct]);

  // 🔄 Update variant when color/size changes
  useEffect(() => {
    if (!product || !product.variants) return;

    const variants = product.variants || [];
    let selectedVariant = null;

    if (selectedColor && selectedSize) {
      selectedVariant = variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      );
    }

    if (!selectedVariant && selectedColor) {
      selectedVariant = variants.find((v) => v.color === selectedColor);
    }

    if (!selectedVariant) {
      selectedVariant = variants[0] || null;
    }

    setVariant(selectedVariant);
  }, [selectedColor, selectedSize, product]);

  // ⭐ FIXED: Get available sizes for selected color
  const getAvailableSizesForColor = useMemo(() => {
    if (!product || !product.variants || !selectedColor) return [];

    return [
      ...new Set(
        product.variants
          .filter((v) => v.color === selectedColor && v.size)
          .map((v) => v.size)
          .filter(Boolean)
      ),
    ];
  }, [product, selectedColor]);

  // 🎨 Handle color selection - updates image based on color
  const handleColorSelect = (color) => {
  setSelectedColor(color);

  const colorImages = images.filter(img => img.color === color);

  if (colorImages.length > 0) {
    setCurrentImg(colorImages[0].url);
    setCurrentIsVideo(false);
    setImageLoading(true);
  }
};

  useEffect(() => {
  if (!product || !selectedColor) return;

  const sizesForColor = [
    ...new Set(
      product.variants
        .filter(v => v.color === selectedColor && v.size)
        .map(v => v.size)
    )
  ];

  if (sizesForColor.length > 0) {
    setSelectedSize(prev =>
      prev && sizesForColor.includes(prev) ? prev : sizesForColor[0]
    );
  }
}, [selectedColor, product]);


 const onThumbnailClick = (media) => {
  // 🚫 SAME IMAGE CLICK → DO NOTHING
  if (currentImg === media.url && currentIsVideo === (media.type === "video")) {
    return;
  }

  manualImageChangeRef.current = true;

  setCurrentImg(media.url);
  setCurrentIsVideo(media.type === "video");
  setImageLoading(true);

  // 🎨 auto select color
  if (media.type === "image" && media.color) {
    setSelectedColor(media.color);
  }
};

  // ➕➖ Quantity handlers with stock limits - UPDATED
const increment = () => {
  const maxAvailable = getAvailableStock();

  if (maxAvailable === 0) {
    showPopup("Product is sold out!", "error");
    return;
  }

  if (quantity >= maxAvailable) {
    showPopup(`Only ${maxAvailable} units available in stock`);
    return;
  }

  setQuantity((prev) => Math.min(prev + 1, maxAvailable));
};

  const decrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

const handleQuantityChange = (e) => {
  const value = parseInt(e.target.value) || 1;
  const maxAvailable = getAvailableStock();

  if (maxAvailable === 0) {
    showPopup("Product is sold out!", "error");
    setQuantity(1);
    return;
  }

  if (value > maxAvailable) {
    showPopup(`Maximum ${maxAvailable} units available`);
    setQuantity(maxAvailable);
    return;
  }

  setQuantity(Math.max(1, value));
};

  // ⭐ Handle review button click - check login status
  const handleReviewButtonClick = () => {
  // ✅ TRUST currentUser ONLY
  if (currentUser) {
    setShowReviewModal(true);
    return;
  }

  // ❌ Only redirect if NOT logged in
  navigate("/login", {
    state: {
      reviewRedirect: true,
      productId,
      productName: product?.name || "Product",
      from: `/product/${productId}`,
    },
  });
};

  // 🛒 Add to cart with stock check - UPDATED
  const onAddToCart = async (e) => {
    e.preventDefault();

    if (!product || !variant) {
      alert("Please select a variant");
      return;
    }

    const maxAvailable = getAvailableStock();
    
   if (maxAvailable === 0) {
  showPopup("This product is sold out!", "error");
  return;
}

if (maxAvailable < quantity) {
  showPopup(`Only ${maxAvailable} units available`);
  return;
}


    setAddingToCart(true);

    const price = variant.offerPrice ?? variant.price ?? product.price ?? 0;
   const item = {
  id: `${product.id}_${variant.variantId ?? variant.variant_id}`, // cart line ID
  productId: product.id,   // 🔥 REQUIRED
  name: product.name,
  price,
  originalPrice: variant.price ?? product.price ?? 0,
  quantity,
  variantId: variant.variantId ?? variant.variant_id ?? variant.id,
  selectedColor,
  selectedSize,
  image: !currentIsVideo
    ? currentImg
    : images[0]?.url || product.imageUrls?.[0]?.url || "",
  stock: maxAvailable,
  colors: availableColors || [],
  sizes: availableSizes || [],
  brand: product.brand || "",
};

    addToCart(item);
    

    const button = e.currentTarget;
    button.classList.add("clicked");
    setTimeout(() => {
      button.classList.remove("clicked");
    }, 300);

    setTimeout(() => {
      setAddingToCart(false);
    }, 300);
  };

  // 📊 Update stock in Firestore
  const updateStockInFirestore = async (stockValue, maxStockValue) => {
    if (!product || !variant) return;

    try {
     const collectionName =
  product.source === "local-market"
    ? "localmarket"
    : product.source === "printing"
    ? "printing"
    : "products";

const productRef = doc(db, collectionName, product.id);


      await runTransaction(db, async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) {
          throw new Error("Product does not exist!");
        }

        const productData = productDoc.data();
        const variants = productData.variants || [];

        let variantIndex = -1;

        if (variant.variantId || variant.variant_id) {
          variantIndex = variants.findIndex(
            (v) => (v.variantId || v.variant_id) === (variant.variantId || variant.variant_id)
          );
        }

        if (variantIndex === -1 && selectedColor) {
          variantIndex = variants.findIndex(
            (v) => v.color === selectedColor && v.size === selectedSize
          );
        }

        if (variantIndex === -1) {
          variantIndex = 0;
        }

        if (variantIndex !== -1 && variants[variantIndex]) {
          variants[variantIndex] = {
            ...variants[variantIndex],
            stock: stockValue,
            maxStock: maxStockValue
          };

          transaction.update(productRef, { variants: variants });

          setVariant({
            ...variant,
            stock: stockValue,
            maxStock: maxStockValue
          });

          setProduct(prev => ({
            ...prev,
            variants: variants
          }));
        }
      });

      alert(`Stock updated to ${stockValue} units`);
      return true;
    } catch (error) {
      console.error("Error updating stock:", error);
      alert(`Failed to update stock: ${error.message}`);
      return false;
    }
  };
const onBuyNow = async (e) => {
  e.preventDefault();

  if (buyNowLoading) return; // 🔒 prevent double click

  if (!product || !variant) {
    showPopup("Please select a variant", "error");
    return;
  }

  const maxAvailable = getAvailableStock();

  if (maxAvailable === 0) {
    showPopup("This product is sold out!", "error");
    return;
  }

  if (quantity > maxAvailable) {
    showPopup(`Only ${maxAvailable} units available`);
    return;
  }

  try {
    setBuyNowLoading(true); // ✅ START LOADING

    const price = variant.offerPrice ?? variant.price ?? product.price ?? 0;

    const buyNowItem = {
      productId: product.id,
      id: product.id,
      name: product.name,
      price,
      originalPrice: variant.price ?? product.price ?? 0,
      quantity,
      variantId: variant.variantId ?? variant.variant_id ?? variant.id,
      selectedColor,
      selectedSize,
      image: !currentIsVideo
        ? currentImg
        : images[0]?.url?.url || product.imageUrls?.[0]?.url || "",
      stock: maxAvailable,
      brand: product.brand || "",
    };

    // store only Buy Now item
    sessionStorage.setItem("buyNowItem", JSON.stringify(buyNowItem));

    navigate("/buy-now");
    window.scrollTo({ top: 0, behavior: "smooth" });

  } finally {
    setBuyNowLoading(false); // ✅ STOP LOADING (safety)
  }
};


  // ⭐ Submit review to Firestore - Guest or User
  const submitReview = async ({ rating, title, content }) => {
    try {
      const isGuest = !currentUser;

      if (isGuest) {
        const guestId = `guest_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 9)}`;
        const guestName = "Guest User";

        const payload = {
          productId,
          productName: product?.name || "",
          rating: Number(rating),
          title,
          content,
          userId: guestId,
          userName: guestName,
          userEmail: "",
          userType: "guest",
          verifiedPurchase: false,
          createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, "reviews"), payload);
      } else {
        const payload = {
          productId,
          productName: product?.name || "",
          rating: Number(rating),
          title,
          content,
          userId: currentUser.uid || currentUser.id,
          userName: currentUser.displayName || currentUser.name || "User",
          userEmail: currentUser.email || "",
          userType: "authenticated",
          verifiedPurchase: false,
          createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, "reviews"), payload);
      }

      await fetchReviews();

      return true;
    } catch (error) {
      console.error("Error submitting review:", error);
      return false;
    }
  };

  // 📦 Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 rounded-full border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // ❌ Product not found
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="text-center p-8 rounded-2xl bg-white shadow-lg max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/e-store")}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Back to Store
          </button>
        </div>
      </div>
    );
  }

const displayPrice =
  variant?.offerPrice > 0
    ? variant.offerPrice
    : variant?.price ?? product.price ?? 0;

  const originalPrice = variant?.price ?? product.price ?? 0;
  const discount =
    originalPrice > displayPrice
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : 0;

  const availableStock = getAvailableStock();
  const isInStock = availableStock > 0;
  const stockLevel = availableStock;
  const maxStock = variant?.maxStock || 100;
  const stockPercentage = (stockLevel / maxStock) * 100;

const allMedia = [
  ...images.map(img => ({
    type: "image",
    url: img.url,
    color: img.color || ""
  })),
  ...videos.map(v => ({
    type: "video",
    url: v
  })),
];


  return (
    
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 relative">
      {/* Review Modal */}
      {popup.show && (
  <div
    className={`fixed top-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-xl shadow-2xl text-white font-semibold
      animate-slide-in
      ${popup.type === "error"
        ? "bg-red-600"
        : popup.type === "success"
        ? "bg-green-600"
        : "bg-yellow-500"
      }`}
  >
    {/* Icon */}
    <span className="text-xl">
      {popup.type === "error" && "❌"}
      {popup.type === "success" && "✅"}
      {popup.type === "warning" && "⚠️"}
    </span>

    {/* Message */}
    <span className="max-w-xs leading-snug">
      {popup.message}
    </span>
  </div>
)}

      {showReviewModal && (
        <WriteReviewModal
          onClose={() => setShowReviewModal(false)}
          onSubmit={submitReview}
          productName={product.name}
          currentUser={currentUser}
          productId={productId}
          navigate={navigate}
        />
      )}

      {/* Stock Management Modal */}
      {showStockModal && isAdmin && (
        <StockManagementModal
          product={product}
          variant={variant}
          onClose={() => setShowStockModal(false)}
          onStockUpdate={updateStockInFirestore}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 🔙 Back Button and Breadcrumb Layout */}
        <div className="flex justify-between items-center mb-6">
          <nav className="text-sm text-gray-600 flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
            <button
              onClick={() => navigate("/")}
              className="hover:text-gray-800 hover:underline transition-colors"
            >
              Home
            </button>

            {productTag && (
              <>
                <svg
                  className="w-3 h-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>

                <button
  onClick={() => {
    const STORE_ROUTES = {
      "local-market": "/local-market",
      printing: "/Printing",
      "e-store": "/e-store",
    };

    navigate(STORE_ROUTES[resolvedSource] || "/e-store");
  }}
  className="capitalize text-purple-600 hover:text-purple-800 hover:underline"
>
  {resolvedSource.replace("-", " ")}
</button>

              </>
            )}

            <svg
              className="w-3 h-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>

            <span className="text-gray-800 font-medium truncate max-w-xs">
              {product.name}
            </span>
          </nav>

          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors py-2 px-4 hover:bg-gray-100 rounded-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 p-3 md:p-4">
            {/* LEFT SIDE — MEDIA */}
            <div className="space-y-3">
              <div className="relative w-full max-w-[450px] h-[280px] sm:h-[360px] md:h-[420px] lg:h-[500px] mx-auto lg:ml-12 rounded-lg overflow-hidden flex items-center justify-center">
                {/* SOLD OUT OVERLAY */}
                {/* ❤️ WISHLIST BUTTON */}
<button
  onClick={handleWishlistToggle}
  className="absolute top-4 right-4 z-10
             w-11 h-11 flex items-center justify-center
             bg-white rounded-full shadow-md
             hover:scale-110 transition-transform
             pointer-events-auto"
>

  <svg
    className="w-5 h-5 text-red-500"
    fill={inWishlist ? "#fca5a5" : "none"}
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



                
{availableStock === 0 && (
  <>
    {/* Dark overlay */}
    
<div className="absolute inset-0 bg-black/50 z-5 pointer-events-none"></div>

    {/* OUT OF STOCK ribbon */}
    <div className="absolute top-4 right-[-60px] z-30 rotate-45 mt-10">
      <span className="block bg-red-600 text-white text-sm font-bold px-16 py-2 shadow-xl tracking-widest">
        OUT OF STOCK
      </span>
    </div>
  </>
)}


                {currentImg ? (
                  <>
                    {imageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin h-14 w-14 rounded-full border-b-2 border-purple-600"></div>
                      </div>
                    )}

                   {currentIsVideo ? (

                      <div className="w-full h-full flex items-center justify-center">
                        <video
                          src={currentImg}
                          controls
                          controlsList="nodownload"
                          className="w-full h-full object-contain transition-opacity duration-300 rounded-xl"
                          onLoadedData={() => setImageLoading(false)}
                          onError={() => {
                            setImageLoading(false);
                            if (images.length > 0) {
                              setCurrentImg(images[0]?.url);
                              setCurrentIsVideo(false);
                            }
                          }}
                          poster={
                            images[0]?.url ||
                            "https://placehold.co/600x400?text=Video+Loading"
                          }
                          playsInline
                        />

                        <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          VIDEO
                        </div>
                      </div>
                    ) : (
                      <img
                        src={currentImg}
                        alt={product.name}
                        className={`w-full h-full object-contain transition-opacity duration-300 ${
                          imageLoading ? "opacity-0" : "opacity-100"
                        }`}
                        onLoad={() => setImageLoading(false)}
                        loading="lazy"
                      />
                    )}
                  </>
                ) : images.length > 0 ? (
                  <>
                    {imageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-purple-600"></div>
                      </div>
                    )}

                    <img
                      src={images[0]?.url}
                      alt={product.name}
                      className="w-full h-full object-contain transition-opacity duration-300"
                      onLoad={() => setImageLoading(false)}
                      onError={(e) => {
                        e.target.src = "https://placehold.co/500x300?text=No+Image";
                        setImageLoading(false);
                      }}
                      loading="lazy"
                    />
                  </>
                ) : (
                  <div className="text-center p-8">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
              </div>
              

           {allMedia.length > 1 && (
  <div className="grid grid-cols-4 gap-3 w-full max-w-[420px] mx-auto lg:ml-[62px]">
    {allMedia.map((media, i) => {
      const isVideo = media.type === "video";

      return (
        <button
          key={i}
          onClick={() => onThumbnailClick(media)}
          className={`rounded-xl overflow-hidden border-2 transition-all duration-200 ${
            currentImg === media.url
              ? "border-purple-500 ring-2 ring-purple-200"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          {isVideo ? (
            <div className="relative h-20 sm:h-24 w-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">VIDEO</span>
            </div>
          ) : (
            <img
              src={media.url}
              alt={`Thumbnail ${i + 1}`}
              className="h-20 sm:h-24 w-full object-contain bg-white transition-opacity"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/150x100?text=Image";
              }}
            />
          )}
        </button>
      );
    })}
  </div>
)}
</div>


            {/* RIGHT SIDE — DETAILS */}
            <div className="ml-0 lg:-ml-20">

              <div>
                {product.brand && (
                  <p className="text-purple-600 font-semibold uppercase tracking-wider text-sm mb-2">
                    {product.brand}
                  </p>
                )}
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* ⭐ Rating */}
              <div className="flex items-center space-x-4">
                {stats.avg > 0 && (
                  <div className="flex items-center px-0.5 py-1.5 rounded-full">
                    <span className="font-bold text-lg">
                      {stats.avg.toFixed(1)}
                    </span>
                    <StarRating
                      rating={stats.avg}
                      size="w-5 h-5"
                      color="text-yellow-500"
                    />
                  </div>
                )}
                <button
                  onClick={() => {
                    const reviewsSection =
                      document.getElementById("reviews-section");
                    reviewsSection?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors hover:underline"
                >
                  {stats.total} {stats.total === 1 ? "review" : "reviews"}
                </button>
              </div>

              {/* Price */}
              <div className="flex items-end space-x-4">
                <p className="text-4xl font-bold text-gray-900">
                  ₹{displayPrice.toLocaleString()}
                </p>
                {originalPrice > displayPrice && (
                  <div className="space-y-1">
                    <p className="line-through text-gray-500 text-lg">
                      ₹{originalPrice.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* ⭐ Color Selection */}
              {availableColors.length > 0 && (
                <div className="space-y-3 mt-4">
                  <h3 className="font-semibold text-gray-700">
                    Color:{" "}
                    <span className="font-normal text-gray-900">
                      {selectedColor}
                    </span>
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        className={`px-3 py-1.5 text-sm rounded-md border transition-all duration-200 font-medium flex items-center gap-1.5 ${
                          selectedColor === color
                            ? "border-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 shadow-md"
                            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        <span>{color}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ⭐ Size Selection */}
              {getAvailableSizesForColor.length > 0 && (
                <div className="space-y-3 mt-4">
                  <h3 className="font-semibold text-gray-700">
                    Size:{" "}
                    <span className="font-normal text-gray-900">
                      {selectedSize ||
                        (getAvailableSizesForColor.length > 0
                          ? "Select size"
                          : "No sizes available")}
                    </span>
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {getAvailableSizesForColor.map((size) => {
                      return (
                        <button
                          key={`${selectedColor}-${size}`}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-1.5 text-sm rounded-md border transition-all duration-200 font-medium ${
                            selectedSize === size
                              ? "border-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 shadow-md"
                              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                          }`}
                          title={`Select size ${size}`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="pt-4 border-t mt-4">
                  <h3 className="font-semibold text-gray-700 mb-3 text-lg">
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Quantity with Stock Management */}
              <div className="space-y-2 pt-4 border-t mt-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-sm text-gray-700">Quantity</h3>
                  {isAdmin && (
                    <button
                      onClick={() => setShowStockModal(true)}
                      className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-2 py-1 rounded transition-colors flex items-center gap-1"
                      title="Manage stock for admin"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Manage Stock
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                    <button
                      onClick={decrement}
                      disabled={quantity <= 1}
                      className="px-3 py-2 text-gray-700 text-sm hover:bg-gray-50 disabled:text-gray-400 disabled:hover:bg-white transition-colors"
                    >
                      −
                    </button>

                    <input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-12 text-center py-2 text-sm border-x border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      min="1"
                      max={availableStock}
                    />

                   <button
  onClick={increment}
  className="px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
>
  +
</button>

                  </div>

                  
                </div>

                {/* Debug info - remove in production */}
                
              </div>

              {/* Buttons */}
{availableStock > 0 ? (
  <div className="flex gap-4 pt-6">
    <button
      onClick={onAddToCart}
      disabled={addingToCart || !selectedColor}
      className={`flex-1 py-4 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 ${
        !addingToCart && selectedColor
          ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          : "bg-gray-400 cursor-not-allowed"
      }`}
    >
      {addingToCart ? "Adding..." : "Add to Cart"}
    </button>

    <button
  onClick={onBuyNow}
  disabled={
    !selectedColor ||        // variant not selected
    availableStock === 0 ||  // out of stock
    buyNowLoading            // processing
  }
  className={`flex-1 py-4 rounded-xl text-white font-semibold
    transition-all duration-300 shadow-lg
    transform active:translate-y-0
    ${
      !selectedColor || availableStock === 0 || buyNowLoading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:-translate-y-1"
    }`}
>
  {buyNowLoading
    ? "Processing..."
    : availableStock === 0
    ? "Out of Stock"
    : "Buy Now"}
</button>

  </div>
) : (
  <div className="pt-6">
    <button
      onClick={handleNotifyMe}
      className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
    >
      <svg
        className="w-6 h-6"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M20.52 3.48A11.85 11.85 0 0012 0C5.37 0 .03 5.34 0 11.94c0 2.1.54 4.16 1.57 5.97L0 24l6.25-1.64a11.9 11.9 0 005.75 1.47h.01c6.63 0 12-5.34 12-11.94 0-3.19-1.24-6.18-3.49-8.41z"/>
      </svg>
      Notify Me on WhatsApp
    </button>
  </div>
)}

            </div>
          </div>
        </div>

        {/* REVIEWS BLOCK */}
        <div
          id="reviews-section"
          className="bg-white rounded-2xl shadow-lg overflow-hidden mt-8"
        >
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Ratings & Reviews
              </h2>
              <button
                onClick={handleReviewButtonClick}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
              >
                Write a Review
              </button>
            </div>

            {stats.total > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:border-r lg:pr-8">
                  <div className="text-center mb-6">
                    <p className="text-6xl font-extrabold text-gray-900 mb-2">
                      {stats.avg.toFixed(1)}
                    </p>
                    <div className="flex justify-center mb-3">
                      <StarRating
                        rating={stats.avg}
                        size="w-8 h-8"
                        color="text-yellow-500"
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      Based on {stats.total}{" "}
                      {stats.total === 1 ? "review" : "reviews"}
                    </p>
                  </div>

                  {/* Distribution */}
                  <div className="space-y-4">
                    {[5, 4, 3, 2, 1].map((s) => {
                      const percentage = stats.total
                        ? (stats.dist[s] / stats.total) * 100
                        : 0;
                      return (
                        <div key={s} className="flex items-center gap-4">
                          <span className="w-8 text-gray-600">{s}★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                s >= 3
                                  ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                                  : "bg-gradient-to-r from-red-400 to-pink-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="w-12 text-right text-gray-600 font-medium">
                            {stats.dist[s]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="space-y-6">
                    {(showAllReviews ? reviews : reviews.slice(0, 4)).map(
                      (r) => {
                        const isGuest =
                          r.userId?.startsWith("guest_") ||
                          r.userType === "guest";
                        const displayName = isGuest
                          ? "Guest User"
                          : usersMap[r.userId]?.displayName ||
                          r.userName ||
                          "Anonymous";

                        return (
                          <div
                            key={r.id}
                            className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <StarRating rating={r.rating} size="w-5 h-5" />
                                <h4 className="font-semibold text-gray-900">
                                  {r.title}
                                </h4>
                              </div>
                              <span className="text-sm text-gray-500">
                                {r.createdAt?.toLocaleDateString?.() ||
                                  "Recently"}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700">
                                {isGuest
                                  ? "👤"
                                  : displayName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">
                                  {displayName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {isGuest ? "Guest User" : "Verified User"}
                                </p>
                              </div>
                            </div>

                            <p className="text-gray-700 leading-relaxed mb-3">
                              {r.content}
                            </p>

                            {r.verifiedPurchase && (
                              <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                ✔ Verified Purchase
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>

                  {reviews.length > 4 && (
                    <div className="text-center pt-4">
                      <button
                        onClick={() => setShowAllReviews(true)}
                        className="text-purple-600 hover:text-purple-800 font-semibold hover:underline transition-colors"
                      >
                        View all {reviews.length} reviews →
                      </button>
                      {showAllReviews && (
                        <div className="text-center mt-6">
                          <button
                            onClick={() => {
                              setShowAllReviews(false);
                              setTimeout(() => {
                                const reviewsSection =
                                  document.getElementById("reviews-section");
                                reviewsSection?.scrollIntoView({
                                  behavior: "smooth",
                                });
                              }, 0);
                            }}
                            className="text-gray-600 hover:underline"
                          >
                            Show less reviews ↑
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <p className="text-gray-500 text-lg">
                  No reviews yet. Be the first to share your thoughts!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS SECTION - FIXED: Removed storeLabel prop */}
        <RelatedProducts
          categoryId={product.category || product.categoryId}
          currentProductId={productId}
          source={source}
        />
      </div>

      {/* Floating Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors z-40"
        aria-label="Scroll to top"
      >
        ↑
      </button>

      <style jsx="true">{`
        @keyframes buttonClick {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
          }
        }

        html {
          scroll-behavior: smooth;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #ec4899);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #db2777);
        }

        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }

        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        
        button:disabled:hover {
          background-color: white !important;
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;