import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const CancelOrderModal = ({ orderData, onClose, onCancelSuccess }) => {
  const [reason, setReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const navigate = useNavigate();

  const cancelReasons = [
    "Changed my mind",
    "Found better price elsewhere",
    "Order created by mistake",
    "Delivery time too long",
    "Product not required anymore",
    "Payment issue",
    "Other reason"
  ];

  const handleCancelOrder = async () => {
    if (!reason.trim()) {
      alert('Please select a cancellation reason');
      return;
    }

    setCancelling(true);
    try {
      // Get current user ID from localStorage
      const currentUserId = localStorage.getItem('token');
      
      if (!currentUserId) {
        alert('User not authenticated');
        return;
      }

      // Update order in Firestore with correct path
      const orderDocRef = doc(db, "users", currentUserId, "orders", orderData.id);
      await updateDoc(orderDocRef, {
        status: "cancelled",
        cancellationReason: reason,
        additionalNotes: additionalNotes,
        cancelledAt: new Date()
      });

      // Call success handler
      onCancelSuccess();
      
      // Show success message
      alert(`✅ Order ${orderData.orderId || orderData.id} has been successfully cancelled!`);
      
      // Redirect to orders page after 2 seconds
      setTimeout(() => {
        navigate('/my-orders');
      }, 2000);

    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  // Format date function
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const dateObj = date instanceof Date ? date : (date?.toDate ? date.toDate() : new Date(date));
      if (isNaN(dateObj.getTime())) return 'Invalid Date';
      return dateObj.toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      {/* Mobile: Full screen on small devices, centered on larger */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Cancel Order</h2>
            <p className="text-gray-600 text-sm md:text-base mt-1">
              Order ID: <span className="font-semibold">{orderData.orderId || orderData.id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={cancelling}
            aria-label="Close"
          >
            <svg 
              className="w-6 h-6 text-gray-500 hover:text-gray-700" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
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

        <div className="p-4 md:p-6">
          {/* Order Summary - Responsive Grid */}
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-medium text-base md:text-lg">{formatDate(orderData.createdAt || new Date())}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-medium text-lg md:text-xl">₹{orderData.amount?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="md:col-span-2 mt-2">
                <p className="text-sm text-gray-600">Current Status</p>
                <span className={`inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full text-sm md:text-base font-semibold mt-1 ${
                  orderData.status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' : 
                  orderData.status?.toLowerCase() === 'returned' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                }`}>
                  {orderData.status?.toUpperCase() || "CONFIRMED"}
                </span>
              </div>
            </div>
          </div>

          {/* Confirmation Message */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <svg 
                className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
              <div>
                <p className="text-red-800 font-semibold text-base md:text-lg">
                  Are you sure you want to cancel this order?
                </p>
                <p className="text-red-700 text-sm md:text-base mt-1">
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Cancellation Reasons */}
          <div className="mb-6">
            <label className="block text-base md:text-lg font-semibold text-gray-800 mb-4">
              Reason for cancellation <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {cancelReasons.map((cancelReason, index) => (
                <label 
                  key={index} 
                  className={`flex items-start space-x-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    reason === cancelReason 
                      ? 'border-red-500 bg-red-50 shadow-sm' 
                      : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancellationReason"
                    value={cancelReason}
                    checked={reason === cancelReason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-1 text-red-600 focus:ring-red-500 h-5 w-5"
                  />
                  <span className="text-gray-700 text-sm md:text-base flex-1">{cancelReason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="mb-8">
            <label className="block text-base md:text-lg font-semibold text-gray-800 mb-3">
              Additional Notes <span className="text-gray-500 font-normal text-sm md:text-base">(Optional)</span>
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Please provide any additional details that might help us improve..."
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm md:text-base"
              rows="4"
            />
          </div>

          {/* Action Buttons - Stack on mobile, side by side on desktop */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              disabled={cancelling}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all font-medium text-base md:text-lg flex-1"
            >
              Go Back
            </button>
            <button
              onClick={handleCancelOrder}
              disabled={cancelling || !reason.trim()}
              className={`px-6 py-3 text-white rounded-xl font-medium transition-all text-base md:text-lg flex-1 ${
                cancelling || !reason.trim()
                  ? 'bg-red-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {cancelling ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cancelling...
                </span>
              ) : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;