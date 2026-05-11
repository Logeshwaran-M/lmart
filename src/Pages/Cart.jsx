import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Truck, Shield } from "lucide-react";


const Cart = () => {
  const navigate = useNavigate();
  const handleBack = () => {
  navigate(-1);
};
  const [selectedTotal, setSelectedTotal] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const [variantStockMap, setVariantStockMap] = useState({});
  const [shippingChargeMap, setShippingChargeMap] = useState({}); // NEW: Store shipping charges per product

  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleSelect,
    selectAll,
    deselectAll,
    getSelectedItems,
    getCartItemsCount,
  } = useCart();

  useEffect(() => {
    const fetchVariantStock = async () => {
      const stockMap = {};
      const shippingMap = {}; // NEW: Temporary shipping map

      for (const item of items) {
        try {
          const productId = item.productId || item.id;
          if (!productId) continue;

          const productRef = doc(db, "products", productId);
          const snap = await getDoc(productRef);

          if (!snap.exists()) continue;

          const productData = snap.data();
          const { variants = [], shippingCharge = 0 } = productData; // NEW: Get shippingCharge from product

          // Store shipping charge for this product
          shippingMap[productId] = Number(shippingCharge ?? 0);

          const matchedVariant = variants.find(v =>
            (item.variantId && v.variantId === item.variantId) ||
            (
              !item.variantId &&
              v.color === item.selectedColor &&
              v.size === item.selectedSize
            )
          );

          if (!matchedVariant) continue;

          const key = item.lineItemKey || item.id;
          stockMap[key] = Number(matchedVariant.stock ?? 0);
        } catch (err) {
          console.error("❌ Stock fetch error:", err);
        }
      }

      setVariantStockMap(stockMap);
      setShippingChargeMap(shippingMap); // NEW: Set shipping charges
      
      Object.entries(stockMap).forEach(([key, stock]) => {
        updateQuantity(key, Math.min(
          items.find(i => (i.lineItemKey || i.id) === key)?.quantity || 1,
          stock
        ));
      });
    };

    if (items.length > 0) {
      fetchVariantStock();
    }
  }, [items]);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Calculate selected total whenever items or selection status changes
  useEffect(() => {
    const selectedItems = getSelectedItems();
    const selectedTotalAmount = selectedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    setSelectedTotal(selectedTotalAmount);
    setSelectedCount(selectedItems.length);
  }, [items, getSelectedItems]);

  // Checkout Selected Items
  const checkoutSelected = () => {
    const selected = getSelectedItems();

    if (selected.length === 0) {
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });

    sessionStorage.setItem("selectedCartItems", JSON.stringify(selected));
    navigate("/checkout");
  };

  // Handle quantity decrease
  const handleQuantityDecrease = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item.lineItemKey || item.id, item.quantity - 1);
    }
  };

  const handleQuantityIncrease = (item) => {
    const key = item.lineItemKey || item.id;
    const maxStock = variantStockMap[key];

    if (maxStock !== undefined && item.quantity >= maxStock) {
      return; // 🔒 stop at stock
    }

    updateQuantity(key, item.quantity + 1);
  };


  // REMOVE ITEM — WITHOUT ALERT / CONFIRM
  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  // CLEAR CART — WITHOUT ALERT
  const handleClearCart = () => {
    if (items.length === 0) return;
    clearCart();
    sessionStorage.removeItem("selectedCartItems");
  };

  const isAllSelected =
    items.length > 0 && items.every((item) => item.selected);
  const isSomeSelected = items.some((item) => item.selected);

  // Cart summary - UPDATED to use shippingCharge from Firebase
const getCartSummary = () => {
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const totalShipping = items.reduce((total, item) => {
    const productId = item.productId || item.id;
    const itemShippingCharge = shippingChargeMap[productId] || 0;
    return total + itemShippingCharge;
  }, 0);

  // ✅ Always show shipping
  const shipping = totalShipping;

  const total = subtotal + shipping;

  return { subtotal, shipping, total };
};


  const cartSummary = getCartSummary();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* BACK BUTTON */}
<div className="max-w-7xl mx-auto px-4 mb-4 flex justify-end">
  <button
    onClick={handleBack}
    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
  >
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
        d="M15 19l-7-7 7-7"
      />
    </svg>
    Back
  </button>
</div>
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-2">
              {items.length > 0
                ? `${getCartItemsCount()} item${getCartItemsCount() !== 1 ? "s" : ""
                } in your cart`
                : "Your cart is empty"}
            </p>
          </div>

        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CART ITEMS SECTION */}
          <div className="lg:col-span-2">
            {/* SELECTED INFO BANNER */}
            {selectedCount > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-green-800">
                        Selected:
                      </span>
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {selectedCount} item{selectedCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-green-800">
                        Total:
                      </span>
                      <span className="font-bold text-xl text-green-700">
                        ₹{selectedTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={checkoutSelected}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-md"
                  >
                    Checkout Now
                  </button>
                </div>
              </div>
            )}

            {/* EMPTY STATE */}
            {items.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    className="w-full h-full"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-600 mb-3">
                  Your cart feels lonely
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Looks like you haven't added any items to your cart yet. Start
                  shopping to discover amazing products!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      navigate("/e-store");
                    }}
                    className="w-full py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors"
                  >
                    Go to Home
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* DESKTOP VIEW */}
                <div className="hidden md:block">
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-100 rounded-lg font-semibold text-gray-700 text-sm">
                    <div className="col-span-1 text-center">Select</div>
                    <div className="col-span-5">Product</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-center">Actions</div>
                  </div>

                  {items.map((item) => (
                    <div
                      key={item.lineItemKey || item.id}
                      className={`grid grid-cols-12 gap-4 items-center p-6 border rounded-xl transition-all duration-200 ${item.selected
                        ? "bg-blue-50 border-blue-300 shadow-md"
                        : "bg-white border-gray-200 hover:shadow-lg hover:border-gray-300"
                        }`}
                    >
                      {/* SELECT CHECKBOX */}
                      <div className="col-span-1 flex justify-center">
                        <input
                          type="checkbox"
                          checked={item.selected || false}
                          onChange={() =>
                            toggleSelect(item.lineItemKey || item.id)
                          }
                          className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
                        />
                      </div>

                      {/* PRODUCT INFO */}
                      <div className="col-span-5 flex items-center gap-4">
                        <img
                          src={item.image || "https://via.placeholder.com/80"}
                          alt={item.name}
                          className="w-20 h-20 object-fit rounded-lg border shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {item.description || "No description available."}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            {item.selectedColor && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Color: {item.selectedColor}
                              </span>
                            )}
                            {item.selectedSize && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                Size: {item.selectedSize}
                              </span>
                            )}
                            {item.selectedMaterial && (
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                {item.selectedMaterial}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* PRICE */}
                      <div className="col-span-2 text-center">
                        <p className="text-purple-700 font-bold text-lg">
                          ₹{item.price.toLocaleString()}
                        </p>
                        <p className="text-gray-500 text-sm line-through">
                          {item.originalPrice > item.price &&
                            `₹${item.originalPrice.toLocaleString()}`}
                        </p>
                      </div>


                      {/* QUANTITY CONTROLS */}
                      <div className="col-span-2 flex justify-center">
                        <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-2 bg-white">
                          <button
                            onClick={() => handleQuantityDecrease(item)}
                            disabled={item.quantity <= 1}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all ${item.quantity <= 1
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              }`}
                          >
                            −
                          </button>

                          <span className="w-12 text-center font-semibold text-gray-900 text-lg">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => handleQuantityIncrease(item)}
                            disabled={
                              variantStockMap[item.lineItemKey || item.id] !== undefined &&
                              item.quantity >= variantStockMap[item.lineItemKey || item.id]
                            }
                            className={`w-6 h-6 rounded flex items-center justify-center ${item.quantity >= (variantStockMap[item.lineItemKey || item.id] ?? Infinity)
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-purple-600 hover:bg-purple-50"
                              }`}
                          >
                            +
                          </button>



                        </div>
                      </div>


                      {/* ACTIONS */}
                      <div className="col-span-2 text-center space-y-3">
                        <p className="font-bold text-gray-900 text-lg">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>

                        <button
                          onClick={() =>
                            handleRemoveItem(item.lineItemKey || item.id)
                          }
                          className="text-red-600 hover:text-red-800 text-sm font-semibold transition-colors flex items-center justify-center gap-1 mx-auto"
                        >
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}


                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl border p-4 flex flex-col items-center text-center">
                    <Truck className="text-green-600 mb-2" size={24} />
                    <span className="font-semibold text-sm">Free Shipping</span>
                    <span className="text-xs text-gray-500">On all orders</span>
                  </div>
                  <div className="bg-white rounded-xl border p-4 flex flex-col items-center text-center">
                    <Shield className="text-green-600 mb-2" size={24} />
                    <span className="font-semibold text-sm">Secure Payment</span>
                    <span className="text-xs text-gray-500">100% Protected</span>
                  </div>
                  <div className="bg-white rounded-xl border p-4 flex flex-col items-center text-center">
                    <svg className="w-6 h-6 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-semibold text-sm">Easy Returns</span>
                    <span className="text-xs text-gray-500">30 Day Policy</span>
                  </div>
                </div>
                {/* MOBILE VIEW */}
                <div className="md:hidden space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.lineItemKey || item.id}
                      className={`p-4 border rounded-xl transition-all duration-200 ${item.selected
                        ? "bg-blue-50 border-blue-300 shadow-md"
                        : "bg-white border-gray-200 hover:shadow-lg"
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* SELECT CHECKBOX */}
                        <input
                          type="checkbox"
                          checked={item.selected || false}
                          onChange={() =>
                            toggleSelect(item.lineItemKey || item.id)
                          }
                          className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer mt-2"
                        />

                        {/* PRODUCT IMAGE */}
                        <img
                          src={item.image || "https://via.placeholder.com/96"}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg border shadow-sm flex-shrink-0"
                        />

                        {/* PRODUCT INFO */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900 text-base">
                              {item.name}
                            </h3>

                            <button
                              onClick={() =>
                                handleRemoveItem(item.lineItemKey || item.id)
                              }
                              className="text-red-500 hover:text-red-700 transition-colors"
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>

                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {item.description || "No description available."}
                          </p>

                          {/* Product variants */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.selectedColor && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {item.selectedColor}
                              </span>
                            )}
                            {item.selectedSize && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                {item.selectedSize}
                              </span>
                            )}
                          </div>

                          {/* Pricing */}
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-purple-700 font-bold text-lg">
                              ₹{item.price.toLocaleString()}
                            </p>
                            <p className="font-bold text-gray-900 text-lg">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>

                          {/* QUANTITY CONTROLS */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-3 py-2 bg-white">
                              <button
                                onClick={() => handleQuantityDecrease(item)}
                                disabled={item.quantity <= 1}
                                className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${item.quantity <= 1
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-gray-600 hover:bg-gray-100"
                                  }`}
                              >
                                −
                              </button>

                              <span className="w-8 text-center font-semibold text-gray-900">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() => handleQuantityIncrease(item)}
                                disabled={
                                  variantStockMap[item.lineItemKey || item.id] !== undefined &&
                                  item.quantity >= variantStockMap[item.lineItemKey || item.id]
                                }
                                className={`w-6 h-6 rounded flex items-center justify-center ${item.quantity >= (variantStockMap[item.lineItemKey || item.id] ?? Infinity)
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-purple-600 hover:bg-purple-50"
                                  }`}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ORDER SUMMARY SIDEBAR */}
          {items.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-4">
                <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b">
                  Order Summary
                </h3>

                {/* Cart totals */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({getCartItemsCount()} items)</span>
                    <span className="font-semibold">
                      ₹{cartSummary.subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-semibold">
                      {cartSummary.shipping === 0
                        ? "FREE"
                        : `₹${cartSummary.shipping}`}
                    </span>
                  </div>

                  {/* Show shipping breakdown if there are multiple items with charges */}
                  {cartSummary.shipping > 0 && (
                    <div className="text-xs text-gray-500 pl-2 mt-1">
                      {items.map((item, index) => {
                        const productId = item.productId || item.id;
                        const itemShipping = shippingChargeMap[productId] || 0;
                        if (itemShipping > 0) {
                          return (
                            <div key={index} className="flex justify-between">
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t">
                    <span>Total</span>
                    <span>₹{cartSummary.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Selected Items Summary */}
                {selectedCount > 0 && (
                  <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">
                      Selected Items
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Items:</span>
                        <span className="font-semibold">{selectedCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-semibold text-green-700">
                          ₹{selectedTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={checkoutSelected}
                    disabled={selectedCount === 0}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${selectedCount === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                      }`}
                  >
                    {selectedCount === 0
                      ? "Select Items to Checkout"
                      : "Proceed to Checkout"}
                  </button>



                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      navigate("/e-store");
                    }}
                    className="w-full py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Continue Shopping
                  </button>

                </div>


              </div>
            </div>
          )}
        </div>
      </div>

    </div>

  );
}

export default Cart;