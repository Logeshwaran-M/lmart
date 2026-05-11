import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ShoppingBag, Truck, Shield, RefreshCw } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

const BuyNow = () => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1);
  };
  
  const [item, setItem] = useState(null);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [maxStock, setMaxStock] = useState(Infinity);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("buyNowItem");
    if (!stored) {
      navigate("/");
      return;
    }

    const parsedItem = JSON.parse(stored);
    setItem(parsedItem);
    fetchProductDetails(parsedItem);
  }, [navigate]);

  const fetchProductDetails = async (itemData) => {
    setLoading(true);
    try {
      const productId = itemData.productId || itemData.id;
      if (!productId) return;

      const productRef = doc(db, "products", productId);
      const snap = await getDoc(productRef);

      if (snap.exists()) {
        const data = snap.data();
        
        // Set shipping charge
        setShippingCharge(Number(data.shippingCharge ?? 0));

        // Find variant stock
        const { variants = [] } = data;
        
        if (variants.length > 0) {
          const matchedVariant = variants.find(v =>
            (itemData.variantId && v.variantId === itemData.variantId) ||
            (
              !itemData.variantId &&
              v.color === itemData.selectedColor &&
              v.size === itemData.selectedSize
            )
          );

          if (matchedVariant) {
            const stock = Number(matchedVariant.stock ?? 0);
            setMaxStock(stock);
            
            // Adjust quantity if current quantity exceeds stock
            if (itemData.quantity > stock) {
              const updatedItem = {
                ...itemData,
                quantity: Math.max(1, stock) // At least 1 if stock > 0, otherwise 0
              };
              setItem(updatedItem);
              sessionStorage.setItem("buyNowItem", JSON.stringify(updatedItem));
            }
          }
        }
      }
    } catch (err) {
      console.error("❌ Stock fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (type) => {
    if (!item) return;

    let newQuantity = item.quantity;

    if (type === "increment") {
      // Check if we've reached max stock
      if (maxStock !== Infinity && newQuantity >= maxStock) {
        return; // Stop at max stock
      }
      newQuantity += 1;
    } else if (type === "decrement" && item.quantity > 1) {
      newQuantity -= 1;
    }

    const updatedItem = {
      ...item,
      quantity: newQuantity,
    };

    setItem(updatedItem);
    sessionStorage.setItem("buyNowItem", JSON.stringify(updatedItem));
  };

  const removeItem = () => {
    sessionStorage.removeItem("buyNowItem");
    navigate("/");
  };

  const refreshItem = () => {
    const stored = sessionStorage.getItem("buyNowItem");
    if (stored) {
      const parsedItem = JSON.parse(stored);
      setItem(parsedItem);
      fetchProductDetails(parsedItem);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) return null;

  const subtotal = item.price * item.quantity;
  const shipping = shippingCharge;
  const total = subtotal + shipping;

  // Check if item is out of stock
  const isOutOfStock = maxStock === 0;
  const isQuantityExceedsStock = maxStock !== Infinity && item.quantity > maxStock;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* BACK BUTTON */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft size={18} />
            Back
          </button>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-1">
            <span className="font-semibold">1 item</span> in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">

            {/* Selected Summary */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Selected: 1 item</h2>
                <span className="text-xl font-bold text-gray-900">
                  Total: ₹{total}
                </span>
              </div>

              <button
                onClick={() =>
                  navigate("/checkout", {
                    state: { buyNow: true, item }
                  })
                }
                disabled={isOutOfStock || isQuantityExceedsStock}
                className={`w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                  isOutOfStock || isQuantityExceedsStock
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white hover:shadow-lg"
                }`}
              >
                <ShoppingBag size={20} />
                {isOutOfStock 
                  ? "Out of Stock" 
                  : isQuantityExceedsStock 
                    ? "Quantity Exceeds Stock" 
                    : "Checkout Now"}
              </button>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-700">Select</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Product</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Price</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Quantity</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          checked 
                          readOnly 
                          className="w-5 h-5 text-green-600 rounded" 
                        />
                      </td>

                      <td className="p-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={item.image || "https://via.placeholder.com/80"}
                            alt={item.name}
                            className="w-20 h-20 object-contain bg-white rounded-lg border p-2"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {item.description || "No description available."}
                            </p>
                            {/* Variant information */}
                            {(item.selectedColor || item.selectedSize) && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {item.selectedColor && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                    Color: {item.selectedColor}
                                  </span>
                                )}
                                {item.selectedSize && (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                    Size: {item.selectedSize}
                                  </span>
                                )}
                              </div>
                            )}
                            {/* Stock status */}
                            {maxStock !== Infinity && (
                              <p className={`text-xs mt-2 ${maxStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {maxStock > 0 
                                  ? `In Stock: ${maxStock} available` 
                                  : 'Out of Stock'}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{item.price.toLocaleString()}
                        </span>
                        {item.originalPrice > item.price && (
                          <p className="text-gray-500 text-sm line-through">
                            ₹{item.originalPrice.toLocaleString()}
                          </p>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity("decrement")}
                            disabled={item.quantity <= 1}
                            className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                              item.quantity <= 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            -
                          </button>

                          <span className="font-semibold">{item.quantity}</span>

                          <button
                            onClick={() => updateQuantity("increment")}
                            disabled={maxStock !== Infinity && item.quantity >= maxStock}
                            className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                              maxStock !== Infinity && item.quantity >= maxStock
                                ? "text-gray-300 cursor-not-allowed"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            +
                          </button>
                        </div>
                        {/* Max stock warning */}
                        {maxStock !== Infinity && item.quantity >= maxStock && (
                          <p className="text-xs text-red-500 mt-2 text-center">
                            Max stock reached
                          </p>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={refreshItem}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                            title="Refresh stock"
                          >
                            <RefreshCw size={18} />
                          </button>

                          <button
                            onClick={removeItem}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Remove item"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trust Badges */}
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

          </div>

          {/* RIGHT SIDE – Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-6 pb-3 border-b">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal (1 items)</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>

                <hr />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-2xl">
                    ₹{total.toFixed(2)}
                  </span>
                </div>

                {/* Stock warning in summary */}
                {isOutOfStock && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    This item is currently out of stock.
                  </div>
                )}
                
                {isQuantityExceedsStock && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    Quantity exceeds available stock ({maxStock} available).
                  </div>
                )}
              </div>

              <button
                onClick={() =>
                  navigate("/checkout", {
                    state: { buyNow: true, item }
                  })
                }
                disabled={isOutOfStock || isQuantityExceedsStock}
                className={`w-full mt-8 py-4 rounded-xl text-lg font-bold transition-all duration-200 ${
                  isOutOfStock || isQuantityExceedsStock
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white hover:shadow-lg"
                }`}
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate(-1)}
                className="w-full mt-4 bg-gray-900 hover:bg-black text-white py-3 rounded-lg font-semibold transition-all duration-200"
              >
                Continue Shopping
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BuyNow;