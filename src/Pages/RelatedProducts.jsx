import React, { useEffect, useState, useCallback } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";

// 🔥 ADDED: Same placeholder image as EMarket.jsx
const PLACEHOLDER_IMAGE = "https://placehold.co/400x300?text=No+Image";

// 🔥 ADDED: StarRating Component from EMarket.jsx
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

const RelatedProducts = ({
  categoryId,
  currentProductId,
  source,
  storeLabel
}) => {
  const navigate = useNavigate();

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewsMap, setReviewsMap] = useState({});

  /* ================= FETCH REVIEWS ================= */
  const fetchProductReviews = useCallback(async (productId) => {
    try {
      const q = query(
        collection(db, "reviews"),
        where("productId", "==", productId)
      );

      const snap = await getDocs(q);

      let total = 0;
      let count = 0;
      let verifiedCount = 0;

      snap.forEach((doc) => {
        const data = doc.data();
        if (data.rating) {
          total += Number(data.rating);
          count++;
          if (data.verifiedPurchase === true) {
            verifiedCount++;
          }
        }
      });

      return {
        avgRating: count ? Number((total / count).toFixed(1)) : 0,
        reviewCount: count,
        verifiedCount,
        hasReviews: count > 0
      };
    } catch (err) {
      console.error("Review fetch error:", err);
      return {
        avgRating: 0,
        reviewCount: 0,
        verifiedCount: 0,
        hasReviews: false
      };
    }
  }, []);

  /* ================= FETCH RELATED PRODUCTS ================= */
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!categoryId || !source) return;

      setLoading(true);

      try {
        let collectionName = "products";
        if (source === "local-market") collectionName = "localmarket";
        if (source === "printing") collectionName = "printing";

        const snap = await getDocs(collection(db, collectionName));
        const list = [];

        snap.forEach((doc) => {
          const data = doc.data();

          const productCategory =
            typeof data.category === "object"
              ? data.category.id
              : data.category;

          const currentCategory =
            typeof categoryId === "object"
              ? categoryId.id
              : categoryId;

          if (
            productCategory === currentCategory &&
            doc.id !== currentProductId
          ) {
            list.push({
              id: doc.id,
              ...data,
              name: data.name || data.productName || "Unnamed Product",
              image:
                data.imageUrls?.[0]?.url ||
                data.mainImage ||
                data.image ||
                "",
              price:
                data.offerPrice ||
                data.price ||
                data.sellingPrice ||
                0,
              originalPrice: data.originalPrice || data.price || 0,
              stock: data.stock || data.quantity || 0
            });
          }
        });

        const shuffled = list.sort(() => 0.5 - Math.random()).slice(0, 4);

        const productsWithReviews = await Promise.all(
          shuffled.map(async (product) => {
            const reviewData = await fetchProductReviews(product.id);
            return { ...product, ...reviewData };
          })
        );

        const reviewMap = {};
        productsWithReviews.forEach((p) => {
          reviewMap[p.id] = {
            avgRating: p.avgRating,
            reviewCount: p.reviewCount,
            verifiedCount: p.verifiedCount,
            hasReviews: p.hasReviews
          };
        });

        setRelatedProducts(productsWithReviews);
        setReviewsMap(reviewMap);
      } catch (err) {
        console.error("Related products error:", err);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [categoryId, currentProductId, source, fetchProductReviews]);

  if (loading || relatedProducts.length === 0) return null;

  /* ================= UI ================= */
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Related Products  
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {relatedProducts.map((product) => {
          const reviews = reviewsMap[product.id] || {};
          const rating = reviews.avgRating || 0;
          const reviewCount = reviews.reviewCount || 0;

          const original = product.originalPrice || product.price;
          const finalPrice = product.offerPrice || product.price;
          const discount =
            original > finalPrice
              ? Math.round(((original - finalPrice) / original) * 100)
              : 0;

          const qty = product.stock || 0;

          return (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition border cursor-pointer flex flex-col h-full"
              onClick={() =>
                navigate(`/product/${product.id}`, {
                  state: { product, source },
                })
              }
            >
              {/* 🖼 IMAGE - SAME AS EMARKET.JSX */}
              <div className="relative flex items-center justify-center bg-white p-4 h-48 sm:h-56">
                <img
                  src={product.image || PLACEHOLDER_IMAGE}
                  alt={product.name}
                  className="object-contain w-full h-full max-h-full"
                  onError={(e) => (e.target.src = PLACEHOLDER_IMAGE)}
                />

                {/* 🔥 DISCOUNT */}
                {discount > 0 && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* 📦 INFO */}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-medium text-sm sm:text-base leading-tight line-clamp-2">
                  {product.name}
                </h3>

                {/* ⭐ RATING - SAME AS EMARKET.JSX */}
                <div className="flex items-center mt-1">
                  <span className="text-xs sm:text-sm font-medium text-yellow-500 mr-1">
                    {rating.toFixed(1)}
                  </span>
                  <StarRating rating={rating} size="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs text-gray-500 ml-1">
                    ({reviewCount})
                  </span>
                </div>

                {/* 💰 PRICE - SAME AS EMARKET.JSX */}
                <div className="flex items-center space-x-2 mt-1">
                  {original > finalPrice ? (
                    <>
                      <span className="text-red-600 font-semibold text-base sm:text-lg">
                        ₹ {finalPrice}
                      </span>
                      <span className="line-through text-gray-500 text-sm sm:text-base">
                        ₹ {original}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-900 font-bold text-base sm:text-lg">
                      ₹ {finalPrice}
                    </span>
                  )}
                </div>

                {/* 🛒 BUTTON */}
                {qty > 0 ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/cart");
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium transition mt-3 text-sm sm:text-base"
                  >
                    View Cart
                  </button>
                ) : (
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-gray-400 text-white py-2 rounded-md font-medium transition mt-3 cursor-not-allowed text-sm sm:text-base"
                    disabled
                  >
                    Out of Stock
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RelatedProducts;