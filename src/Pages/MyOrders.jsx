import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, orderBy, doc, updateDoc, Timestamp, addDoc } from 'firebase/firestore'; 
import { db } from '../../firebase';
import emailjs from "@emailjs/browser";  
import ReturnOrderForm from './ReturnOrderForm';

// ----------------------------------------------------
//  CANCEL ORDER FORM
// ----------------------------------------------------


// ----------------------------------------------------
//  CANCEL ORDER FORM
// ----------------------------------------------------
const CancelOrderForm = ({ order, userId, onClose, onSuccess, displayId }) => {
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cancelReasons = [
    "Found better price elsewhere",
    "Ordered by mistake",
    "Delivery time too long",
    "Changed my mind",
    "Payment issues",
    "Other",
  ];

  // 📧 SEND CANCEL EMAIL
  const sendCancelEmail = async () => {
    const formattedItems = order.items
      .map((item) => `• ${item.name} Qty: ${item.quantity} Price: ₹${item.price}`)
      .join("\n\n");
    
    const cancelledAt = new Date();

    const params = {
      to_name: order.customerInfo?.name || "Customer",
      email: order.customerInfo?.email || "noemail@domain.com",
      order_id: displayId,
      reason: reason === "Other" ? otherReason : reason,
      amount: order.amount?.toFixed(2),
      cancelled_at: cancelledAt.toLocaleString(),
      items: formattedItems,
    };

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        params,
        EMAILJS_PUBLIC_KEY
      );
      console.log("✅ Cancel Email Sent");
    } catch (err) {
      console.error("❌ Cancel Email Error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason) {
      setError("Please select a cancellation reason.");
      return;
    }

    const finalReason = reason === "Other" ? otherReason : reason;
    setLoading(true);
    setError("");

    try {
      // 1️⃣ Send cancellation email
      await sendCancelEmail();

      // 2️⃣ Save cancellation in Firestore
      const cancellationCollectionRef = collection(
        db,
        "users",
        userId,
        "cancellationRequests"
      );

      const cancellationData = {
        orderId: displayId,
        firestoreOrderId: order.id,
        reason: finalReason,
        requestedAt: Timestamp.now(),
        status: "completed",
        amount: order.amount,
        items: order.items.map((item) => ({
          ...item,
          sellerId: item.sellerId || "Unknown",
        })),
        paymentMethod: order.paymentMethod,
      };

      const newCancellationRef = await addDoc(
        cancellationCollectionRef,
        cancellationData
      );

      // 3️⃣ Update main order status
      const orderRef = doc(db, "users", userId, "orders", order.id);
      await updateDoc(orderRef, {
        status: "cancelled",
        cancellationId: newCancellationRef.id,
        cancellation: {
          reason: finalReason,
          cancelledAt: Timestamp.now(),
        },
        updatedAt: Timestamp.now(),
      });

      // 4️⃣ UI update
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error cancelling order:", err);
      setError("Failed to cancel order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-6">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Cancel Order</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
            >
              &times;
            </button>
          </div>

          {/* ORDER SUMMARY */}
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="font-semibold text-purple-700">Order ID: {displayId}</p>
            <p className="text-sm text-gray-600 mt-1">
              Total Amount: ₹{order.amount?.toFixed(2)}
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* REASONS */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Why do you want to cancel? *
                </label>
                <div className="space-y-2">
                  {cancelReasons.map((cancelReason) => (
                    <label key={cancelReason} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="radio"
                        name="reason"
                        value={cancelReason}
                        checked={reason === cancelReason}
                        onChange={(e) => setReason(e.target.value)}
                        className="h-4 w-4 text-red-600"
                      />
                      <span className="ml-2">{cancelReason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* OTHER REASON */}
              {reason === "Other" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Please specify:
                  </label>
                  <input
                    type="text"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                    required
                    placeholder="Enter your reason..."
                  />
                </div>
              )}

              {/* ERROR */}
              {error && (
                <div className="bg-red-100 text-red-700 p-2 rounded">
                  {error}
                </div>
              )}

              {/* BUTTONS */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
//  MAIN MYORDERS COMPONENT
// ----------------------------------------------------
const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  
  const currentUserId = localStorage.getItem('token');

  // Helper function to generate sequential LMART IDs
  const getDisplayId = (index) => {
    // Since orders are displayed newest first, we reverse the sequence
    // Newest order gets highest number
    const orderNumber = orders.length - index;
    return `LMART${String(orderNumber).padStart(3, '0')}`;
  };

  const fetchOrders = async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    
    try {
      const ordersSubCollectionRef = collection(db, "users", currentUserId, "orders");
      const q = query(ordersSubCollectionRef, orderBy("createdAt", "desc"));
      
      const querySnapshot = await getDocs(q);
      const fetchedOrders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt || Timestamp.now()
      }));
      
      setOrders(fetchedOrders);
      
      // Check for success message from checkout
      const orderSuccessData = sessionStorage.getItem("orderSuccessData");
      if (orderSuccessData) {
        setSuccessMessage(`🎉 Order placed successfully!`);
        sessionStorage.removeItem("orderSuccessData");
        
        // Auto-remove success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUserId]);

  const isOrderReturnable = (order) => {
    const status = order.status?.toLowerCase();
    const nonReturnableStatuses = ['cancelled', 'returned', 'return_requested', 'return_rejected'];
    
    // Check if order was delivered within last 7 days
    const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return !nonReturnableStatuses.includes(status) && 
           status === 'delivered' && 
           orderDate > sevenDaysAgo;
  };

  const isOrderCancellable = (order) => {
    const status = order.status?.toLowerCase();
    const cancellableStatuses = ['confirmed', 'processing', 'pending'];
    return cancellableStatuses.includes(status);
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-indigo-100 text-indigo-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'return_requested':
      case 'returned':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }
  
  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your orders.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6">My Orders</h1>
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4 text-gray-300">📦</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-3">No Orders Yet</h2>
            <p className="text-gray-500 mb-8">You haven't placed any orders yet. Start shopping to see your orders here!</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto p-4">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg border border-green-200">
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              {successMessage}
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-gray-600 mb-8">View and manage all your orders in one place</p>
        
        {/* Order Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow border">
            <p className="text-gray-500 text-sm">Total Orders</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <p className="text-gray-500 text-sm">Delivered</p>
            <p className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status?.toLowerCase() === 'delivered').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <p className="text-gray-500 text-sm">Processing</p>
            <p className="text-2xl font-bold text-blue-600">
              {orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status?.toLowerCase())).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <p className="text-gray-500 text-sm">Cancelled/Returned</p>
            <p className="text-2xl font-bold text-red-600">
              {orders.filter(o => ['cancelled', 'returned'].includes(o.status?.toLowerCase())).length}
            </p>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order, index) => {
            const displayId = getDisplayId(index);
            const status = order.status?.toLowerCase() || 'confirmed';
            const canReturn = isOrderReturnable(order);
            const canCancel = isOrderCancellable(order);
            const hasReturnRequest = status === 'return_requested';

            return (
              <div 
                key={order.id} 
                className="bg-white p-6 shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow"
              >
                {/* ORDER HEADER */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-purple-700">Order ID: {displayId}</p>
                    <div className="flex flex-wrap gap-4">
                      <p className="text-gray-500">
                        Date: {order.createdAt?.toDate 
                          ? order.createdAt.toDate().toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      {order.paymentMethod && (
                        <p className="text-gray-500">
                          Payment: {order.paymentMethod.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(status)}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </span>
                    
                    {hasReturnRequest && order.returnRequest?.reason && (
                      <p className="text-sm text-gray-600">
                        Return Reason: {order.returnRequest.reason}
                      </p>
                    )}
                  </div>
                </div>

                {/* ORDER ITEMS */}
                <div className="space-y-4 mb-6">
                  {order.items?.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-4 border-b pb-4 last:border-0"
                    >
                      <img 
                        src={item.image || item.imageUrl || '/placeholder-image.jpg'} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg border"
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                      
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{item.name}</p>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                          <p>Qty: {item.quantity}</p>
                          <p>Price: ₹{item.price?.toFixed(2)}</p>
                          {item.sellerId && (
                            <p className="bg-gray-100 px-2 py-0.5 rounded border text-xs">
                              Seller ID: {item.sellerId}
                            </p>
                          )}
                          {item.selectedColor && (
                            <p>Color: {item.selectedColor}</p>
                          )}
                          {item.selectedSize && (
                            <p>Size: {item.selectedSize}</p>
                          )}
                          {item.selectedRam && (
                            <p>RAM: {item.selectedRam}</p>
                          )}
                        </div>
                        <p className="text-green-700 font-medium">
                          Item Total: ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* SHIPPING INFORMATION */}
                {order.customerInfo && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Shipping Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <p><span className="text-gray-500">Name:</span> {order.customerInfo.name}</p>
                      <p><span className="text-gray-500">Phone:</span> {order.customerInfo.phone}</p>
                      <p className="md:col-span-2"><span className="text-gray-500">Address:</span> {order.customerInfo.address}</p>
                      <p><span className="text-gray-500">City:</span> {order.customerInfo.city}</p>
                      <p><span className="text-gray-500">Pincode:</span> {order.customerInfo.pincode}</p>
                    </div>
                  </div>
                )}

                {/* ORDER SUMMARY */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 pt-6 border-t">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      Total: ₹{order.amount?.toFixed(2)}
                    </p>
                    {order.razorpayOrderId && (
                      <p className="text-gray-500 text-sm">
                        Payment ID: {order.razorpayOrderId.substring(0, 10)}...
                      </p>
                    )}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-wrap gap-3">
                    {order.invoiceUrl ? (
                      <a 
                        href={order.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Invoice
                      </a>
                    ) : (
                      <button 
                        onClick={() => navigate(`/invoice?orderId=${order.id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Invoice
                      </button>
                    )}
                    
                    {canCancel && (
                      <button 
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowCancelForm(true);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                    
                    {canReturn && (
                      <button 
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowReturnForm(true);
                        }}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Return Order
                      </button>
                    )}

                     
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* MODALS */}
        {showReturnForm && selectedOrder && (
          <ReturnOrderForm
            orderData={selectedOrder}
            onClose={() => {
              setShowReturnForm(false);
              setSelectedOrder(null);
            }}
            onReturnSuccess={() => {
              fetchOrders();
              setShowReturnForm(false);
              setSelectedOrder(null);
            }}
          />
        )}

        {showCancelForm && selectedOrder && (
          <CancelOrderForm
            order={selectedOrder}
            userId={currentUserId}
            displayId={getDisplayId(orders.indexOf(selectedOrder))}
            onClose={() => {
              setShowCancelForm(false);
              setSelectedOrder(null);
            }}
            onSuccess={fetchOrders}
          />
        )}

        {/* RETURN & CANCELLATION POLICY */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <h3 className="text-xl font-bold mb-4">📦 Return & Cancellation Policy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-lg mb-3 flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Return Policy
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>7-day return window from delivery date</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Items must be unused and in original packaging</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Refunds processed within 5-7 business days</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Free pickup for eligible returns</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3 flex items-center">
                <span className="text-red-600 mr-2">✗</span>
                Cancellation Policy
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Cancel within 24 hours for instant refund</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Orders in 'processing' can be cancelled</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Shipped orders require customer support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Refund method same as payment method</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;