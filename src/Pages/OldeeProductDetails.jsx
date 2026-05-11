import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const OldeeProductDetails = ({ product, onBack, onEdit }) => {
  const navigate = useNavigate();

  // 🚩 ADD THIS CHECK: Show sold product message
  if (product?.status === "sold" || product?.isSold === true) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center">
        <div className="max-w-md p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-red-100 rounded-full">
            <span className="text-4xl">🔒</span>
          </div>
          <h3 className="text-2xl font-bold text-red-600 mb-3">Product Sold</h3>
          <p className="text-gray-600 mb-6">
            This product is no longer available for purchase.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-900 transition"
          >
            ← Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="p-8 text-center">
          <h3 className="text-xl font-bold text-red-600">Product Not Found</h3>
          <button onClick={onBack} className="mt-4 px-4 py-2 bg-gray-200 rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const {
    name,
    price,
    offerPrice,
    description,
    imageURLs = [],
    address,
    negotiation,
    status,
    seller,
    createdAt,
  } = product;

  // ✅ Always send message to this fixed WhatsApp number
  const FIXED_WHATSAPP_NUMBER = "918762978777";

  const openWhatsApp = () => {
    const msg = `Hi ${seller?.displayName || "Seller"}, I'm interested in "${name}" (Listing ID: ${
      product.id || "-"
    }). Is it still available?`;
    const url = `https://wa.me/${FIXED_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ✅ Image handling
  const [mainImage, setMainImage] = useState(imageURLs?.[0] || null);

  const priceNum = Number(price || 0);
  const offerPriceNum =
    offerPrice !== undefined && offerPrice !== null ? Number(offerPrice) : null;
  const hasDiscount = offerPriceNum !== null && offerPriceNum < priceNum;
  const finalPrice = hasDiscount ? offerPriceNum : priceNum;

  const handleBuyNow = () => {
    navigate("/checkout", {
      state: {
        item: product,
        buyNow: true,
        skipToPayment: true,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white flex flex-col"
    >
      {/* Top Bar (sticky) */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 truncate">
            {name}
          </h1>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition"
          >
            ← Back to Marketplace
          </button>
        </div>
      </div>

      {/* Main scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Images Gallery */}
            <div className="lg:col-span-2">
              {/* Main Image */}
              <div className="mb-6">
                {mainImage ? (
                  <img
  src={mainImage}
  alt={name}
  className="w-full h-[70vh] object-contain rounded-xl shadow-lg bg-white"
/>

                ) : (
                  <div className="w-full h-[60vh] flex items-center justify-center bg-gray-200 text-gray-500 rounded-xl">
                    No Image
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {imageURLs.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {imageURLs.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setMainImage(url)}
                      className={`min-w-20 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none ${
                        url === mainImage
                          ? "border-blue-500 ring-2 ring-blue-300"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      title={`View image ${index + 1}`}
                    >
                     <img
  src={url}
  alt={`${name} - ${index + 1}`}
  className="w-full h-full object-contain bg-white"
/>


                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details & Pricing */}
            <div className="lg:col-span-1 space-y-6">
              {/* 🚩 ADD SOLD BADGE IF STATUS IS SOLD (for edge cases) */}
              {(status === "sold" || product.isSold === true) && (
                <div className="px-4 py-3 bg-red-100 border border-red-300 rounded-xl">
                  <div className="flex items-center">
                    <span className="text-red-600 text-xl mr-2">🔒</span>
                    <div>
                      <p className="font-bold text-red-700">SOLD</p>
                      <p className="text-sm text-red-600">This item is no longer available</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
              
                <span className="ml-3 px-6 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-700">
                  {negotiation
                    ? negotiation.charAt(0).toUpperCase() + negotiation.slice(1)
                    : "N/A"}
                </span>
              </div>

              <div className="flex items-end space-x-3">
                <span className="text-5xl font-bold text-gray-900">₹{finalPrice}</span>
                {hasDiscount && (
                  <span className="text-2xl line-through text-red-500">₹{priceNum}</span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-lg font-medium text-emerald-700">
                  Save ₹{priceNum - offerPriceNum}!
                </p>
              )}

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-xl font-bold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{description}</p>
              </div>
            </div>
          </div>

          {/* Seller & Listing Info */}
          <div className="mt-10 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Seller Information</h3>
              <p className="text-gray-700">
                <span className="font-semibold">Name:</span>{" "}
                {seller?.displayName || "N/A"}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Contact:</span>{" "}
                <button
                  onClick={openWhatsApp}
                  className="text-green-700 font-medium underline underline-offset-2"
                >
                  WhatsApp Chat
                </button>
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Location:</span> {address || "N/A"}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Listing Information</h3>
              <p className="text-sm text-gray-500">
                Listing ID: <span className="font-mono">{product.id}</span>
              </p>
              {createdAt?.toDate && (
                <p className="text-sm text-gray-500">
                  Posted: {new Date(createdAt.toDate()).toLocaleDateString()}
                </p>
              )}
              {product.updatedAt?.toDate && (
                <p className="text-sm text-gray-500">
                  Last Updated:{" "}
                  {new Date(product.updatedAt.toDate()).toLocaleDateString()}
                </p>
              )}
              {/* 🚩 SHOW SOLD DATE IF APPLICABLE */}
              {product.soldAt?.toDate && (
                <p className="text-sm text-red-500 font-medium">
                  Sold on: {new Date(product.soldAt.toDate()).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {/* 🚩 DISABLE BUY NOW BUTTON IF SOLD */}
              <button
                onClick={handleBuyNow}
                disabled={status === "sold" || product.isSold === true}
                className={`px-8 py-3 rounded-xl shadow-lg font-bold transition ${
                  status === "sold" || product.isSold === true
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {status === "sold" || product.isSold === true ? "Sold Out" : "Buy Now"}
              </button>

              <button
                onClick={openWhatsApp}
                className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition"
                title="Chat with Seller on WhatsApp"
              >
                Chat with Seller
              </button>
            </div>
            
            {/* 🚩 SHOW EDIT BUTTON FOR SELLER/ADMIN (EVEN IF SOLD) */}
            {/* FIX: Removed references to auth and isAdmin as they are outside scope. Rely on the 'onEdit' prop being passed. */}
            {/* {onEdit && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => onEdit(product)}
                  className="px-6 py-2 text-sm border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Edit Listing
                </button>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OldeeProductDetails;