// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { db } from "../../firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

// ----------- Helper functions -----------
const PLACEHOLDER_IMAGE = "https://placehold.co/400x300?text=No+Image";

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


const ProductCardHome = ({ product, reviewData }) => {

  const getAvailableStock = (product) => {
  if (!product?.variants || product.variants.length === 0) return 9999;

  const variant =
    product.variants.find(v => Number(v.stock) >= 0) ||
    product.variants[0];

  const stock = Number(variant?.stock);
  return isNaN(stock) ? 9999 : stock;
};

const handleNotifyMe = (e) => {
  e.stopPropagation();

  const phoneNumber = "918762978777"; // 🔁 admin / store number
  const message = encodeURIComponent(
    `Hello, please notify me when this product is back in stock.\n\nProduct: ${product.name}`
  );

  window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
};

const availableStock = getAvailableStock(product);
const isOutOfStock = availableStock === 0;


  const navigate = useNavigate();

  const imageUrl = product.image || PLACEHOLDER_IMAGE;
  const { finalPrice, original, discount } = getPriceData(product);
const rating = reviewData?.rating ?? 0;
const reviewCount = reviewData?.reviewCount ?? 0;



  const handleViewProduct = (e) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`, { state: { product } });
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition border cursor-pointer flex flex-col"
      onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
    >
      {/* IMAGE */}
    <div className="relative flex items-center justify-center bg-white h-44 sm:h-52 overflow-hidden">
  <img
    src={imageUrl}
    alt={product.name}
    className={`object-contain w-full h-full transition ${
      isOutOfStock ? "blur-[1px] scale-105" : ""
    }`}
    onError={(e) => (e.target.src = PLACEHOLDER_IMAGE)}
  />

  {/* 🔥 OUT OF STOCK OVERLAY */}
  {isOutOfStock && (
    <>
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      <div className="absolute top-10 right-[-55px] rotate-45 z-20">
        <span className="block bg-red-600 text-white text-xs font-bold px-20 py-2 tracking-widest shadow-lg">
          OUT OF STOCK
        </span>
      </div>
    </>
  )}

  {/* DISCOUNT BADGE */}
  {discount > 0 && !isOutOfStock && (
    <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded z-30">
      -{discount}%
    </span>
  )}
</div>

      
 

      {/* CONTENT */}
      <div className="px-3 pt-2 pb-3">
        {/* NAME */}
        <h3 className="font-medium text-sm sm:text-base leading-tight line-clamp-2">
          {product.name}
        </h3>

        {/* RATING */}
        <div className="flex items-center mt-1">
          <span className="text-xs font-medium text-yellow-500 mr-1">
  {reviewCount > 0 ? rating.toFixed(1) : "No rating"}
</span>


<div className="flex">
  {Array(5)
    .fill(0)
    .map((_, i) => (
      <svg
        key={i}
        className={`w-3 h-3 sm:w-4 sm:h-4 ${
          i < Math.round(rating)
            ? "text-yellow-400"
            : "text-gray-300"
        } fill-current`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
</div>


          <span className="text-xs text-gray-500 ml-1">
  ({reviewCount} reviews)
</span>

        </div>

        {/* PRICE */}
        <div className="flex items-center gap-2 mt-1">
          {original > finalPrice ? (
            <>
              <span className="text-red-600 font-semibold text-base">
                ₹ {finalPrice}
              </span>
              <span className="line-through text-gray-500 text-sm">
                ₹ {original}
              </span>
            </>
          ) : (
            <span className="text-gray-900 font-bold text-base">
              ₹ {finalPrice}
            </span>
          )}
        </div>

        {/* BUTTON */}
        <button
          onClick={handleViewProduct}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition text-sm mt-2"
        >
          View
        </button>
      </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { items } = useCart();

  const [allProducts, setAllProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [posters, setPosters] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [postersLoading, setPostersLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [reviewsMap, setReviewsMap] = useState({});
  useEffect(() => {
  const fetchReviews = async () => {
    try {
      const reviewsRef = collection(db, "reviews");
      const snapshot = await getDocs(reviewsRef);

      const tempMap = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.productId || typeof data.rating !== "number") return;

        if (!tempMap[data.productId]) {
          tempMap[data.productId] = {
            totalRating: 0,
            count: 0,
          };
        }

        tempMap[data.productId].totalRating += data.rating;
        tempMap[data.productId].count += 1;
      });

      // 🔥 convert to avg rating
      const finalMap = {};
      Object.keys(tempMap).forEach((productId) => {
        finalMap[productId] = {
          rating:
            tempMap[productId].totalRating / tempMap[productId].count,
          reviewCount: tempMap[productId].count,
        };
      });

      setReviewsMap(finalMap);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  fetchReviews();
}, []);



  // Fetch trending products from Firebase
  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        setTrendingLoading(true);
        const productsCollectionRef = collection(db, "products");
        const trendingQuery = query(
          productsCollectionRef,
          where("trending", "==", true)
        );

        const querySnapshot = await getDocs(trendingQuery);

        const fetchedTrendingProducts = [];
        querySnapshot.forEach((doc) => {
          const productData = doc.data();
          if (productData && productData.name) {
            let price = 0;
            let offerPrice = 0;

            if (
              productData.variants &&
              Array.isArray(productData.variants) &&
              productData.variants.length > 0
            ) {
              const firstVariant = productData.variants[0];
              price = Number(firstVariant.price) || 0;
              offerPrice = Number(firstVariant.offerPrice) || price;
            } else if (productData.price || productData.offerPrice) {
              price = Number(productData.price) || 0;
              offerPrice = Number(productData.offerPrice) || price;
            }

            let imageUrl = "";
            if (productData.mainImageUrl && productData.mainImageUrl.trim() !== "") {
              imageUrl = productData.mainImageUrl;
            } else if (
              productData.imageUrls &&
              Array.isArray(productData.imageUrls) &&
              productData.imageUrls.length > 0
            ) {
              const mainImage = productData.imageUrls.find(img => img.isMain === true);
              if (mainImage && mainImage.url) {
                imageUrl = mainImage.url;
              } else if (productData.imageUrls[0].url) {
                imageUrl = productData.imageUrls[0].url;
              }
            } else if (productData.image && productData.image.trim() !== "") {
              imageUrl = productData.image;
            }

           fetchedTrendingProducts.push({
  ...productData,
  id: doc.id,
  price,
  offerPrice,
  originalPrice: price > offerPrice ? price : null,
  image: imageUrl,

  
   
});
          }
        });

        console.log("Fetched trending products:", fetchedTrendingProducts.length);
        setTrendingProducts(fetchedTrendingProducts);
      } catch (err) {
        console.error("Error fetching trending products:", err);
      } finally {
        setTrendingLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  // Fetch all products for display
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const productsCollectionRef = collection(db, "products");
        const querySnapshot = await getDocs(productsCollectionRef);

        const fetchedProducts = [];
        querySnapshot.forEach((doc) => {
          const productData = doc.data();
          if (productData && productData.name) {
            let price = 0;
            let offerPrice = 0;
            
            if (
              productData.variants &&
              Array.isArray(productData.variants) &&
              productData.variants.length > 0
            ) {
              const firstVariant = productData.variants[0];
              price = Number(firstVariant.price) || 0;
              offerPrice = Number(firstVariant.offerPrice) || price;
            } else if (productData.price || productData.offerPrice) {
              price = Number(productData.price) || 0;
              offerPrice = Number(productData.offerPrice) || price;
            }

            let imageUrl = "";
            if (productData.mainImageUrl && productData.mainImageUrl.trim() !== "") {
              imageUrl = productData.mainImageUrl;
            } else if (
              productData.imageUrls &&
              Array.isArray(productData.imageUrls) &&
              productData.imageUrls.length > 0
            ) {
              const mainImage = productData.imageUrls.find(img => img.isMain === true);
              if (mainImage && mainImage.url) {
                imageUrl = mainImage.url;
              } else if (productData.imageUrls[0].url) {
                imageUrl = productData.imageUrls[0].url;
              }
            } else if (productData.image && productData.image.trim() !== "") {
              imageUrl = productData.image;
            }
fetchedProducts.push({
  ...productData,
  id: doc.id,
  price,
  offerPrice,
  originalPrice: price > offerPrice ? price : null,
  image: imageUrl,

  // ✅ ADD THIS (REAL FIREBASE DATA)
  rating: Number(productData.rating || 0),
  reviewCount: Number(productData.reviewCount || 0),

  variants: productData.variants || [],
  imageUrls: productData.imageUrls || [],
});

          }
        });

        console.log("Fetched all products from Firebase:", fetchedProducts.length);
        setAllProducts(fetchedProducts);
      } catch (err) {
        console.error("Error fetching all products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

 
const selectRandomProducts = (products) => {
  if (products.length === 0) return [];
  const shuffled = [...products].sort(() => Math.random() - 0.5);
  const maxProducts = Math.min(shuffled.length, 15);
  return shuffled.slice(0, maxProducts);
};


  // Update display products when allProducts change
  useEffect(() => {
    if (allProducts.length > 0) {
      const randomProducts = selectRandomProducts(allProducts);
      setDisplayProducts(randomProducts);
    }
  }, [allProducts]);

  // Fetch posters from Firebase
  useEffect(() => {
    const fetchPosters = async () => {
      try {
        setPostersLoading(true);
        const postersCollectionRef = collection(db, "posters");
        const q = query(postersCollectionRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const fetchedPosters = [];
        querySnapshot.forEach((doc) => {
          const posterData = doc.data();
          if (posterData && posterData.title && posterData.imageUrl) {
            fetchedPosters.push({
              ...posterData,
              id: doc.id,
              posterId: posterData.posterId || doc.id,
              title: posterData.title || "New Poster",
              subtitle:
                posterData.subContents ||
                posterData.subtitle ||
                "",
            });
          }
        });

        console.log("Fetched posters from Firebase:", fetchedPosters);
        setPosters(fetchedPosters);
      } catch (err) {
        console.error("Error fetching posters from Firebase:", err);
        setPosters([]);
      } finally {
        setPostersLoading(false);
      }
    };

    fetchPosters();
  }, []);

  // Auto change posters every 4 seconds
  useEffect(() => {
    if (posters.length === 0) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev === posters.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [posters.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <style jsx="true">{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scrollHorizontal {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }

        .animate-slide-up {
          animation: slideUp 0.8s ease-out;
        }

        .animate-scroll-horizontal {
          animation: scrollHorizontal 30s linear infinite;
        }

        .animate-scroll-horizontal:hover {
          animation-play-state: paused;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-800 { animation-delay: 0.8s; }
      `}</style>

      {/* Error State */}
      {error && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative w-full h-screen overflow-hidden">
        {postersLoading ? (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading posters...</p>
            </div>
          </div>
        ) : posters.length > 0 ? (
          posters.map((poster, index) => (
            <div
              key={poster.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === current ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={poster.imageUrl}
                alt={poster.title}
                className="w-full h-full object-fill"
              />
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <div className="text-center text-white p-6">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h1 className="text-3xl font-bold mb-2">No Posters Available</h1>
              <p className="text-lg opacity-90">Check back later for new posters</p>
            </div>
          </div>
        )}

        {/* Welcome Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40">
          <div className="text-center text-white px-4 mb-6 sm:mb-8 lg:mb-10">
            {posters.length > 0 && posters[current] ? (
              <>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 lg:mb-6 animate-fade-in leading-tight">
                  {posters[current].title}
                </h1>
                {posters[current].subtitle && (
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium animate-slide-up leading-relaxed">
                    {posters[current].subtitle}
                  </p>
                )}
              </>
            ) : (
              <>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 lg:mb-6 animate-fade-in leading-tight">
                  Welcome to L-Mart
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium animate-slide-up leading-relaxed">
                  A Small Attempt at Online Shopping with all
                </p>
              </>
            )}
          </div>

          {/* Product Boxes Overlay */}
          <div className="container-responsive">
                          {/* 🔥 UPDATED: Product image display in Hero section */}
              <div className="relative overflow-hidden mask-gradient">
                <div
                  className={`flex space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-5 ${
                    displayProducts.length > 6 ? "animate-scroll-horizontal" : ""
                  }`}
                  style={{ width: displayProducts.length > 6 ? "200%" : "100%" }}
                >
                  {displayProducts.length > 0 ? (
                    displayProducts.map((product, index) => (
                      <div
                        key={`first-${product.id}`}
                        className="bg-white bg-opacity-90 rounded-lg shadow-lg overflow-hidden border-2 border-yellow-400 hover:shadow-xl transition-all transform hover:scale-105 flex-shrink-0 w-28 sm:w-32 md:w-36 lg:w-40 xl:w-44 cursor-pointer"
                        onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                      >
                        {/* 🔥 UPDATED: Changed from object-fit to object-contain for full images */}
                        {product.image ? (
                      <div className="relative w-full h-14 sm:h-16 md:h-20 lg:h-24 xl:h-28 flex items-center justify-center bg-white p-2">
  {/* 🔥 TRENDING BADGE */}
    {/* <span className="absolute top-1 left-1 z-20 bg-orange-500 text-white text-[8px] sm:text-[9px] lg:text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
      LATEST
    </span> */}

  <img
    src={product.image}
    alt={product.name}
    className="object-contain w-full h-full max-h-full"
    onError={(e) => {
      e.target.onerror = null;  
      e.target.style.display = "none";
      e.target.parentElement.innerHTML =
        '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
    }}
  />
</div>

                        ) : (
                          <div className="w-full h-14 sm:h-16 md:h-20 lg:h-24 xl:h-28 bg-gray-200 flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                        <div className="p-1 sm:p-2 lg:p-3">
                          <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800 truncate">
                            {product.name}
                          </h3>
                          <div className="flex items-center mt-1">
                            {product.offerPrice < product.price ? (
                              <>
                                <span className="text-xs sm:text-sm font-bold text-red-600">
                                  ₹{product.offerPrice}
                                </span>
                                <span className="text-xs text-gray-500 line-through ml-1">
                                  ₹{product.price}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs sm:text-sm font-bold text-gray-800">
                                ₹{product.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center w-full py-8">
                      <p className="text-gray-500 text-center">No products available</p>
                    </div>
                  )}
                </div>
              </div>
          </div>
        </div>

        {/* Dots Indicator */}
        {posters.length > 0 && (
          <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {posters.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 rounded-full transition-colors ${
                  index === current ? "bg-white" : "bg-gray-400"
                }`}
                onClick={() => setCurrent(index)}
              ></button>
            ))}
          </div>
        )}
      </div>

      {/* MAIN NAVIGATION CATEGORIES SECTION */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center justify-center mb-3">
              <div className="w-16 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-slide-up">
              Explore More
            </h2>
            <p className="text-lg text-gray-600 animate-slide-up delay-100">
              Browse through our wide range of products and services
            </p>
          </div>

          {/* 5 Main Category Boxes */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-12">
            {/* E-Store Box */}
            <Link
              to="/e-store"
              className="group relative animate-float delay-0"
              style={{ animationDelay: "0s" }}
            >
              <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100 overflow-hidden">
                <div className="relative h-40 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
                  <div className="relative z-10 p-4 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform duration-500 shadow-lg">
                      <svg
                        className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 text-center group-hover:text-blue-600 transition-colors">
                      E-Store
                    </h3>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-b from-white to-gray-50">
                  <p className="text-sm text-gray-600 text-center mb-3">
                    Digital Products & Services
                  </p>
                  <div className="flex items-center justify-center">
                    <span className="inline-flex items-center text-xs text-blue-500 font-medium">
                      Explore Now
                      <svg
                        className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform"
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
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-500 group-hover:duration-200"></div>
            </Link>

            {/* Local Market Box */}
            <Link
              to="/local-market"
              className="group relative animate-float delay-100"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100 overflow-hidden">
                <div className="relative h-40 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
                  <div className="relative z-10 p-4 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform duration-500 shadow-lg">
                      <svg
                        className="w-8 h-8 text-orange-600 group-hover:scale-110 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 text-center group-hover:text-orange-600 transition-colors">
                      Local Market
                    </h3>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-b from-white to-gray-50">
                  <p className="text-sm text-gray-600 text-center mb-3">
                    Local Products & Stores
                  </p>
                  <div className="flex items-center justify-center">
                    <span className="inline-flex items-center text-xs text-orange-500 font-medium">
                      Explore Now
                      <svg
                        className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform"
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
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-500 group-hover:duration-200"></div>
            </Link>

            {/* Printing Box */}
            <Link
              to="/printing"
              className="group relative animate-float delay-200"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100 overflow-hidden">
                <div className="relative h-40 bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
                  <div className="relative z-10 p-4 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform duration-500 shadow-lg">
                      <svg
                        className="w-8 h-8 text-purple-600 group-hover:scale-110 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 text-center group-hover:text-purple-600 transition-colors">
                      Printing
                    </h3>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-b from-white to-gray-50">
                  <p className="text-sm text-gray-600 text-center mb-3">
                    Professional Print Services
                  </p>
                  <div className="flex items-center justify-center">
                    <span className="inline-flex items-center text-xs text-purple-500 font-medium">
                      Explore Now
                      <svg
                        className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform"
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
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-500 group-hover:duration-200"></div>
            </Link>

            {/* Market News Box */}
            <Link
              to="/market-news"
              className="group relative animate-float delay-300"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100 overflow-hidden">
                <div className="relative h-40 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
                  <div className="relative z-10 p-4 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform duration-500 shadow-lg">
                      <svg
                        className="w-8 h-8 text-red-600 group-hover:scale-110 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 text-center group-hover:text-red-600 transition-colors">
                      Market News
                    </h3>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-b from-white to-gray-50">
                  <p className="text-sm text-gray-600 text-center mb-3">
                    Latest Updates & Trends
                  </p>
                  <div className="flex items-center justify-center">
                    <span className="inline-flex items-center text-xs text-red-500 font-medium">
                      Explore Now
                      <svg
                        className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform"
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
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-400 to-orange-400 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-500 group-hover:duration-200"></div>
            </Link>

            {/* Oldee Box */}
            <Link
              to="./Oldee"
              className="group relative animate-float delay-400"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100 overflow-hidden">
                <div className="relative h-40 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
                  <div className="relative z-10 p-4 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform duration-500 shadow-lg">
                      <svg
                        className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 text-center group-hover:text-green-600 transition-colors">
                      Oldee
                    </h3>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-b from-white to-gray-50">
                  <p className="text-sm text-gray-600 text-center mb-3">
                    Vintage & Pre-Owned Items
                  </p>
                  <div className="flex items-center justify-center">
                    <span className="inline-flex items-center text-xs text-green-500 font-medium">
                      Explore Now
                      <svg
                        className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform"
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
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-teal-400 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-500 group-hover:duration-200"></div>
            </Link>
          </div>
        </div>
      </div>

      {/* TRENDING PRODUCTS SECTION */}
      <div className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="w-12 h-1 bg-orange-500 rounded-full mr-3"></div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 animate-fade-in">
                Trending Products
              </h2>
              <div className="w-12 h-1 bg-orange-500 rounded-full ml-3"></div>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-slide-up delay-100">
              Discover our most popular and trending products loved by customers
            </p>
          </div>

          {/* Trending Products Grid */}
          {trendingLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : trendingProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {trendingProducts.map((product) => (
               <ProductCardHome
  key={product.id}
  product={product}
  reviewData={reviewsMap[product.id]}
/>

              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm animate-fade-in">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Trending Products
              </h3>
              <p className="text-gray-500">
                Check back later for trending products
              </p>
            </div>
          )}
        </div>
      </div>

      {/* COMPLETE PRODUCTS LIST SECTION */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
              Complete Products List
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto animate-slide-up delay-100">
              Browse through our extensive collection of products from all
              categories
            </p>
             
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {displayProducts.map((product, index) => (
             <ProductCardHome
  key={product.id}
  product={product}
  reviewData={reviewsMap[product.id]}
/>

            ))}
          </div>
        </div>
      </div>

      {/* Company Info Section */}
      <div className="content-section p-4 bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-xl mt-4 border border-gray-200 mx-4 mb-8">
        <h2 className="text-3xl font-extrabold text-purple-700 mb-4 text-center">
          Welcome to <span className="text-orange-500">L-mart</span> – India's
          Trusted Online Shopping Partner
        </h2>

        <p className="text-gray-700 text-lg leading-relaxed mb-4 text-center">
          At <b>L-mart</b>, we deliver{" "}
          <span className="text-purple-600 font-semibold">
            reliable, affordable, and premium-quality online shopping
          </span>{" "}
          services for everyone across India.
        </p>
        <p className="text-gray-600 text-base mb-4 text-center">
          From <b>electronics</b> to <b>clothing</b>, <b>home goods</b>,{" "}
          <b>groceries</b>, and <b>custom services</b> – our user-friendly
          platform makes shopping fast, easy, and stress-free with{" "}
          <span className="text-orange-500 font-medium">free delivery</span> &{" "}
          <span className="text-purple-600 font-medium">
            exclusive discounts
          </span>
          .
        </p>

        {/* Services */}
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-orange-600 mb-3 flex items-center gap-2">
            📌 Our Most Popular Categories
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
            <li className="bg-white rounded-xl p-4 shadow hover:shadow-md transition">
              <b>Electronics</b> – Latest gadgets, smartphones, and accessories
            </li>
            <li className="bg-white rounded-xl p-4 shadow hover:shadow-md transition">
              <b>Fashion</b> – Trendy clothing, footwear, and accessories for
              all
            </li>
            <li className="bg-white rounded-xl p-4 shadow hover:shadow-md transition">
              <b>Home & Kitchen</b> – Everything for your home improvement needs
            </li>
            <li className="bg-white rounded-xl p-4 shadow hover:shadow-md transition">
              <b>Groceries</b> – Fresh produce and daily essentials delivered to
              your doorstep
            </li>
            <li className="bg-white rounded-xl p-4 shadow hover:shadow-md transition">
              <b>Beauty & Personal Care</b> – Premium beauty products and
              personal care items
            </li>
          </ul>
        </div>

        {/* Why Choose Us */}
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-green-700 mb-3">
            💡 Why Choose L-mart?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
            <p className="bg-gradient-to-r from-green-50 to-white rounded-lg p-3 shadow">
              ✅ Pan-India Delivery across all major cities
            </p>
            <p className="bg-gradient-to-r from-green-50 to-white rounded-lg p-3 shadow">
              ✅ Affordable Pricing with premium quality
            </p>
            <p className="bg-gradient-to-r from-green-50 to-white rounded-lg p-3 shadow">
              ✅ User-Friendly Website – easy browsing and ordering
            </p>
            <p className="bg-gradient-to-r from-green-50 to-white rounded-lg p-3 shadow">
              ✅ Fast Turnaround – On-time delivery guaranteed
            </p>
            <p className="bg-gradient-to-r from-green-50 to-white rounded-lg p-3 shadow">
              ✅ Exclusive Discounts – Best prices for loyal customers
            </p>
            <p className="bg-gradient-to-r from-green-50 to-white rounded-lg p-3 shadow">
              ✅ Quality Assurance – Verified products and sellers
            </p>
          </div>
        </div>

        {/* Who We Serve */}
        <div>
          <h3 className="text-2xl font-semibold text-purple-600 mb-3">
            👥 Who We Serve
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
            <li className="bg-blue-50 rounded-xl p-4 shadow">
              <b>Students & Youth</b> – Affordable products and student
              discounts
            </li>
            <li className="bg-blue-50 rounded-xl p-4 shadow">
              <b>Families & Homemakers</b> – Daily essentials and household
              items
            </li>
            <li className="bg-blue-50 rounded-xl p-4 shadow">
              <b>Professionals</b> – Office supplies and work-from-home
              essentials
            </li>
            <li className="bg-blue-50 rounded-xl p-4 shadow">
              <b>Businesses</b> – Bulk orders and corporate gifting solutions
            </li>
            <li className="bg-blue-50 rounded-xl p-4 shadow">
              <b>Everyone</b> – Quality products for every need and budget
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;