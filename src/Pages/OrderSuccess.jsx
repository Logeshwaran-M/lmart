  import React, { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import "../../firebase";
  import { collection, addDoc, serverTimestamp } from "firebase/firestore";
  import { db } from "../../firebase";
  import Invoice from "./Invoice";
  import CancelOrderModal from "./CancelOrderModal";
  import { doc, runTransaction } from "firebase/firestore";


  const OrderSuccess = () => {
    const navigate = useNavigate();

    const [orderData, setOrderData] = useState(null);
    const [saving, setSaving] = useState(true);
    const [saved, setSaved] = useState(false);
    const [animateSuccess, setAnimateSuccess] = useState(false);
    const [showInvoice, setShowInvoice] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [orderCancelled, setOrderCancelled] = useState(false);

    // Load order data from sessionStorage
    useEffect(() => {
      const data = sessionStorage.getItem("orderSuccessData");

      if (!data) {
        navigate("/");
        return;
      }

      const parsed = JSON.parse(data);
      setOrderData(parsed);

      // Save to Firestore
      saveOrderToFirestore(parsed);

      // Remove session data
      sessionStorage.removeItem("orderSuccessData");

      // Animation
      setTimeout(() => setAnimateSuccess(true), 400);
      
      // Show invoice after a delay to ensure everything is loaded
      setTimeout(() => {
        setShowInvoice(true);
      }, 1000);
      
    }, [navigate]);

const decreaseStockAfterOrder = async (items) => {
  for (const item of items) {
    const productRef = doc(
      db,
      "products",
      item.productId || item.id
    );

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(productRef);
      if (!snap.exists()) return;

      const data = snap.data();
      const variants = [...(data.variants || [])];

      const index = variants.findIndex(
        (v) =>
          String(v.variantId || v.variant_id) === String(item.variantId) ||
          (v.color === item.selectedColor && v.size === item.selectedSize)
      );

      if (index === -1) return;

      const stock = Number(variants[index].stock || 0);
      if (stock < item.quantity) return;

      variants[index].stock = stock - item.quantity;

      transaction.update(productRef, { variants });
    });
  }
};


  const saveOrderToFirestore = async (data) => {
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        paymentId: data.paymentId,
        orderId: data.orderId || `ORD-${Date.now().toString().slice(-8)}`,
        amount: data.amount,
        items: data.items || [],
        customerInfo: data.customerInfo || {},
        createdAt: serverTimestamp(),
        status: "confirmed",
        paymentMethod: data.paymentMethod || "Razorpay",
        updatedAt: serverTimestamp(),
      });

      // 🔥 DECREASE STOCK HERE
      if (data.items && data.items.length > 0) {
        await decreaseStockAfterOrder(data.items);
      }

      setOrderData((prev) => ({
        ...prev,
        id: docRef.id,
        orderId:
          data.orderId || `ORD-${Date.now().toString().slice(-8)}`,
      }));

      setSaved(true);
    } catch (err) {
      console.error("Error saving order:", err);
      alert(err.message || "Order saved but stock update failed");
    } finally {
      setSaving(false);
    }
  };


    const handleCancelSuccess = () => {
      setOrderCancelled(true);
      setShowCancelModal(false);
      // Update local order data
      setOrderData(prev => ({ 
        ...prev, 
        status: "cancelled" 
      }));
    };

    if (!orderData) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      );
    }

    const { paymentId, orderId, amount, items, customerInfo } = orderData;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div
            className={`bg-white rounded-2xl shadow-2xl p-8 transition-all duration-700 ${
              animateSuccess ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                orderCancelled ? 'bg-red-100 animate-pulse' : 'bg-green-100'
              }`}>
                {orderCancelled ? (
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeWidth={2}/>
                  </svg>
                )}
              </div>
              <h1 className="text-3xl font-bold mt-4 text-gray-800">
                {orderCancelled ? 'Order Cancelled!' : 'Payment Successful!'}
              </h1>
              <p className="text-gray-600">
                {orderCancelled 
                  ? 'Your order has been cancelled successfully.' 
                  : 'Your order has been placed successfully.'}
              </p>
            </div>

            {/* Order Status Badge */}
            <div className="text-center mb-6">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                orderCancelled 
                  ? 'bg-red-100 text-red-800 animate-pulse' 
                  : 'bg-green-100 text-green-800'
              }`}>
                Status: {orderCancelled ? 'Cancelled' : 'Confirmed'}
              </span>
            </div>

            {/* Saving Status */}
            {saving && (
              <div className="text-center mb-4">
                <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                  Saving order to database...
                </div>
              </div>
            )}
            {saved && !orderCancelled && (
              <div className="text-center mb-4">
                <div className="inline-flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-full">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeWidth={2}/>
                  </svg>
                  Order saved successfully!
                </div>
              </div>
            )}

            {/* Order Details */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Details</h2>
              <div className="space-y-3">
                <p><strong className="text-gray-700">Order ID:</strong> <span className="text-gray-900 font-mono">{orderId}</span></p>
                <p><strong className="text-gray-700">Payment ID:</strong> <span className="text-gray-900 font-mono">{paymentId}</span></p>
                <p><strong className="text-gray-700">Total Amount:</strong> <span className="text-green-600 font-bold">₹{amount?.toFixed(2)}</span></p>
                <p><strong className="text-gray-700">Date:</strong> {new Date().toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>

            {/* Customer Info */}
            {customerInfo && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Customer Information</h2>
                <div className="space-y-3">
                  <p><strong className="text-gray-700">Name:</strong> {customerInfo.name}</p>
                  <p><strong className="text-gray-700">Email:</strong> {customerInfo.email}</p>
                  {customerInfo.phone && <p><strong className="text-gray-700">Phone:</strong> {customerInfo.phone}</p>}
                  {customerInfo.address && (
                    <p>
                      <strong className="text-gray-700">Address:</strong> {customerInfo.address},{" "}
                      {customerInfo.city} - {customerInfo.pincode}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Items */}
            {items && items.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Order Items ({items.length})
                </h2>
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <div className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow" key={i}>
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">Qty: {item.quantity || 1}</span>
                        <span className="text-green-600 font-bold">₹{item.price?.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="text-center mt-8 space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:gap-4">
              {!orderCancelled && (
                <>
                  <button
                    onClick={() => setShowInvoice(true)}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Invoice
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel Order
                  </button>
                </>
              )}
              <button
                onClick={() => navigate("/")}
                className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Modal */}
        {showInvoice && orderData && (
          <Invoice
            orderData={orderData}
            onClose={() => setShowInvoice(false)}
            onCancelOrder={() => {
              setShowInvoice(false);
              setShowCancelModal(true);
            }}
          />
        )}

        {/* Cancel Order Modal */}
        {showCancelModal && (
          <CancelOrderModal
            orderData={orderData}
            onClose={() => setShowCancelModal(false)}
            onCancelSuccess={handleCancelSuccess}
          />
        )}
      </div>
    );
  };

  export default OrderSuccess;