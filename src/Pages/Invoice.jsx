import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import newlogo from "../assets/newlogo.png";
import ReturnOrderModal from './ReturnOrderForm'; // Add this import

const Invoice = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('token');
  
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false); // Add this state
  
  const invoiceRef = useRef();

  // Generate sequential LMART ID
  const generateLMARTId = (orderIndex, totalOrders) => {
    const orderNumber = totalOrders - orderIndex;
    return `LMART${String(orderNumber).padStart(3, '0')}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      let dateObj;
      
      // Handle Firebase Timestamp
      if (date && typeof date === 'object' && 'seconds' in date) {
        dateObj = new Date(date.seconds * 1000);
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        dateObj = new Date(date);
      }
      
      if (isNaN(dateObj.getTime())) return 'Invalid Date';
      
      const day = dateObj.getDate();
      const month = dateObj.toLocaleString('en-US', { month: 'long' });
      const year = dateObj.getFullYear();
      
      let hours = dateObj.getHours();
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      
      hours = hours % 12;
      hours = hours ? hours : 12;
      
      return `${day} ${month} ${year} at ${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };
  
  // Print functionality
  const triggerPrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `Invoice-${orderData?.invoiceNumber || 'Order'}`,
    pageStyle: `
      @page { 
        size: A4; 
        margin: 10mm; 
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact; 
          print-color-adjust: exact; 
          font-family: Arial, sans-serif;
        }
        .no-print { 
          display: none !important; 
        }
      }
    `,
  });
  
  // PDF download function - FIXED
  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) {
      alert("Invoice content not available. Please try again.");
      return;
    }

    setGeneratingPDF(true);
    
    try {
      const input = invoiceRef.current;
      
      // Create canvas from invoice content
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // FIX: Use 'image/png' instead of newlogo variable
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 190;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `Invoice-${orderData?.invoiceNumber || 'Order'}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try the print option instead.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Number to words conversion
 const numberToWords = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "Zero Rupees Only";
  }

  const ones = [
    "", "One", "Two", "Three", "Four", "Five",
    "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen",
    "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty",
    "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  const convertTwoDigits = (num) => {
    if (num < 20) return ones[num];
    return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
  };

  const convertNumber = (num) => {
    let result = "";

    if (num >= 10000000) {
      result += convertNumber(Math.floor(num / 10000000)) + " Crore ";
      num %= 10000000;
    }

    if (num >= 100000) {
      result += convertNumber(Math.floor(num / 100000)) + " Lakh ";
      num %= 100000;
    }

    if (num >= 1000) {
      result += convertNumber(Math.floor(num / 1000)) + " Thousand ";
      num %= 1000;
    }

    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }

    if (num > 0) {
      result += convertTwoDigits(num);
    }

    return result.trim();
  };

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let words = convertNumber(rupees) + " Rupees";

  if (paise > 0) {
    words += " and " + convertTwoDigits(paise) + " Paise";
  }

  return words + " Only";
};

  // Return order handler
  const handleReturnOrder = () => {
    // Prevent return if status is final or action is in progress
    if (!orderData || ['cancelled', 'return_requested', 'returned', 'return_rejected'].includes(orderData.status)) {
      return;
    }
    
    // Show the return modal
    setShowReturnModal(true);
  };

  // Success handler for return modal
  const handleReturnSuccess = (updatedData) => {
    // Update local state to reflect return request
    setOrderData(prev => ({ 
      ...prev, 
      ...updatedData
    }));
    
    // Close the modal
    setShowReturnModal(false);
  };

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !currentUserId) {
        setError("Please log in to view invoice.");
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching order with ID:', orderId, 'User ID:', currentUserId);
        
        // Fetch the specific order
        const orderDocRef = doc(db, "users", currentUserId, "orders", orderId);
        const orderDoc = await getDoc(orderDocRef);

        if (!orderDoc.exists()) {
          setError("Order not found.");
          setLoading(false);
          return;
        }

        // Fetch all orders to calculate sequential ID
        const ordersCollectionRef = collection(db, "users", currentUserId, "orders");
        const ordersSnapshot = await getDocs(ordersCollectionRef);
        const allOrders = [];
        
        ordersSnapshot.forEach((doc) => {
          allOrders.push({ 
            id: doc.id, 
            ...doc.data(),
            createdAt: doc.data().createdAt || { seconds: 0 }
          });
        });

        // Sort by creation date (newest first)
        allOrders.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        // Find current order index
        const orderIndex = allOrders.findIndex(order => order.id === orderId);
        
        const data = orderDoc.data();
        console.log('Order data:', data);
        
        // Calculate amounts
        const items = data.items || [];
        const subTotal = items.reduce((sum, item) => 
          sum + ((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)), 0
        );
        
        const invoiceData = {
          id: orderDoc.id,
          ...data,
          items: items,
          customerInfo: data.customerInfo || {},
          invoiceNumber: data.orderId || generateLMARTId(orderIndex, allOrders.length),
          displayDate: formatDate(data.createdAt || new Date()),
          subTotal: subTotal,
          deliveryCharges: parseFloat(data.deliveryCharges) || 0,
          grandTotal: subTotal + (parseFloat(data.deliveryCharges) || 0),
          paymentMethod: data.paymentMethod || 'cod'
        };
        
        console.log('Processed invoice data:', invoiceData);
        setOrderData(invoiceData);
        setError(null);
        
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load invoice. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, currentUserId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <div className="text-6xl mb-4 text-red-500">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Invoice</h2>
          <p className="text-gray-700 mb-6">{error || "Invoice data not available"}</p>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/my-orders')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Orders
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Login Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper function for status display
  const getStatusDisplay = (status) => {
    const statusMap = {
      'confirmed': { label: 'Confirmed', color: 'text-green-700' },
      'shipped': { label: 'Shipped', color: 'text-blue-700' },
      'delivered': { label: 'Delivered', color: 'text-green-700' },
      'cancelled': { label: 'Cancelled', color: 'text-red-700' },
      'return_requested': { label: 'Return Requested', color: 'text-orange-700' },
      'return_approved': { label: 'Return Approved', color: 'text-teal-700' },
      'return_rejected': { label: 'Return Rejected', color: 'text-red-700' },
      'returned': { label: 'Returned', color: 'text-purple-700' },
      'refunded': { label: 'Refunded', color: 'text-indigo-700' }
    };
    
    return statusMap[status] || { label: status, color: 'text-gray-700' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Return Order Modal */}
      {showReturnModal && (
        <ReturnOrderModal
          orderData={orderData}
          onClose={() => setShowReturnModal(false)}
          onReturnSuccess={handleReturnSuccess}
        />
      )}
      
      {/* Header with actions */}
      <div className="max-w-4xl mx-auto mb-8 no-print">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Invoice Details</h1>
              <p className="text-gray-600 mt-2">
                Order #{orderData.invoiceNumber} • {orderData.displayDate?.split(' at ')[0]}
              </p>
              <div className="mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  orderData.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  orderData.status === 'return_requested' ? 'bg-orange-100 text-orange-800' :
                  orderData.status === 'returned' ? 'bg-purple-100 text-purple-800' :
                  orderData.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {getStatusDisplay(orderData.status).label}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handleDownloadPDF}
                disabled={generatingPDF}
                className={`px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all ${
                  generatingPDF 
                    ? 'bg-green-500 text-white opacity-50 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                }`}
              >
                {generatingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </>
                )}
              </button>
              <button
                onClick={() => navigate('/my-orders')}
                className="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 hover:shadow-lg transition-all"
              >
                Back to Orders
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div ref={invoiceRef} className="max-w-4xl mx-auto bg-white p-6 md:p-8 shadow-xl border border-gray-200">
        {/* Invoice Header with Logo */}
        <div className="text-center mb-10">
          {/* Logo Section - Add your logo here */}
          <div className="flex justify-between  mb-4 mt-4">
            <img 
              src={newlogo} 
              alt="L Mart Logo" 
              className="h-20 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          
          <h1 className="text-4xl font-bold mb-3 -mt-10 text-gray-900 ml-[120px]">INVOICE</h1>
          <div className="space-y-2 bg-gray-50 p-4 rounded-lg inline-block">
            <p className="text-lg">
              <strong>Invoice No:</strong> {orderData.invoiceNumber}
            </p>
            <p className="text-lg">
              <strong>Date:</strong> {orderData.displayDate}
            </p>
          </div>
          </div>
        </div>

        <div className="border-t-2 border-gray-300 my-6"></div>

        {/* Company and Customer Info - Updated to match your image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Company Info */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">L Mart</h2>
            <div className="space-y-1 text-gray-700">
              <p>57 Industrial Estate,</p>
              <p>Sindagi-586 128</p>
              <p>Phone: +91-87629 78777</p>
              <p>Email: info@lmart.com</p>
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">SHIP TO:</h2>
            <div className="space-y-1 text-gray-700">
              <p className="font-semibold">{orderData.customerInfo?.name || "Customer Name"}</p>
              <p>{orderData.customerInfo?.address || "Address not provided"}</p>
              <p>{orderData.customerInfo?.city || "City"} {orderData.customerInfo?.pincode || ""}</p>
              <p>Email: {orderData.customerInfo?.email || "No email provided"}</p>
              <p>Phone: {orderData.customerInfo?.phone || "No phone provided"}</p>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-gray-300 my-6"></div>

        {/* Items Table - Updated to match your image */}
        <div className="mb-8 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-y-2 border-gray-800">
                <th className="py-3 px-4 text-left font-bold text-sm">SNO Item</th>
                <th className="py-3 px-4 text-center font-bold text-sm">Qty</th>
                <th className="py-3 px-4 text-right font-bold text-sm">Unit Price</th>
                <th className="py-3 px-4 text-right font-bold text-sm">Amount</th>
              </tr>
            </thead>
            <tbody>
              {orderData.items && orderData.items.length > 0 ? (
                orderData.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                   <td className="py-3 px-4">
  <div className="flex items-start gap-2">
    <span className="font-semibold">{index + 1}.</span>

    <div>
      <div className="font-medium text-gray-900">
        {item.name}
      </div>

      {/* Variants */}
      <div className="text-sm text-gray-600 mt-1 space-y-0.5">
        {item.selectedColor && (
          <div>Color: <span className="font-medium">{item.selectedColor}</span></div>
        )}

        {item.selectedSize && (
          <div>Variant: <span className="font-medium">{item.selectedSize}</span></div>
        )}

        {item.selectedVariant && (
          <div>Variant: <span className="font-medium">{item.selectedVariant}</span></div>
        )}
      </div>
    </div>
  </div>
</td>

                    <td className="py-3 px-4 text-center align-top">
                      <span className="text-sm font-medium">{item.quantity || 1}</span>
                    </td>
                    <td className="py-3 px-4 text-right align-top font-medium text-gray-700">
                      ₹{parseFloat(item.price || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right align-top font-bold text-blue-700">
                      ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    No items in this order
                  </td>
                </tr>
              )}
              
              {/* Total Rows */}
              <tr>
                <td colSpan="3" className="py-4 px-4 text-right font-semibold border-t border-gray-300">
                  Sub Total
                </td>
                <td className="py-4 px-4 text-right font-bold border-t border-gray-300">
                  ₹{orderData.subTotal?.toFixed(2) || '0.00'}
                </td>
              </tr>
              <tr>
                <td colSpan="3" className="py-2 px-4 text-right font-semibold">
                  Delivery Charges
                </td>
                <td className="py-2 px-4 text-right font-bold">
                  ₹{orderData.deliveryCharges?.toFixed(2) || '0.00'}
                </td>
              </tr>
              <tr>
                <td colSpan="3" className="py-4 px-4 text-right font-bold text-lg border-t-2 border-gray-800">
                  Grand Total
                </td>
                <td className="py-4 px-4 text-right font-bold text-lg border-t-2 border-gray-800 text-green-700">
                  ₹{orderData.grandTotal?.toFixed(2) || '0.00'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border-t-2 border-gray-300 my-8"></div>

        {/* Grand Total in Words */}
        <div className="mb-8">
          <p className="font-bold text-gray-800 mb-2">Grand Total (In Words):</p>
          <p className="text-lg font-medium text-gray-900">
            {numberToWords(orderData.grandTotal || 0)}
          </p>
        </div>

        {/* Additional Information */}
        <div className="space-y-3 mt-10 pt-6 border-t border-gray-200">
          <p>
            <strong>Payment Method:</strong> {orderData.paymentMethod?.toUpperCase() || 'COD'}
          </p>
          
          {/* Return Information Display */}
          {orderData.returnDetails && (
            <div className="mt-4 p-4 border-l-4 border-orange-500 bg-orange-50 rounded-lg">
              <h3 className="font-bold text-lg text-orange-800 mb-2">Return Information</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Reason:</strong> {orderData.returnDetails.reason}</p>
                {orderData.returnDetails.details && (
                  <p><strong>Details:</strong> {orderData.returnDetails.details}</p>
                )}
                <p><strong>Requested Date:</strong> {formatDate(orderData.returnDetails.requestedDate)}</p>
                {orderData.returnDetails.status && (
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      orderData.returnDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      orderData.returnDetails.status === 'approved' ? 'bg-green-100 text-green-800' :
                      orderData.returnDetails.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {orderData.returnDetails.status.charAt(0).toUpperCase() + orderData.returnDetails.status.slice(1)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-600">
            All amounts are inclusive of applicable taxes.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-300 text-center text-gray-500 text-sm">
          <p className="mb-2">This is a computer-generated invoice. No signature required.</p>
          <p>For any queries, contact: info@lmart.com | +91-87629 78777</p>
          <p className="mt-3 text-xs">Generated on: {new Date().toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
      </div>

      {/* Action Buttons Bottom */}
      <div className="max-w-4xl mx-auto mt-8 no-print">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                navigate('/e-store');
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Continue Shopping
            </button>
            
            {/* Return Order Button */}
            <button
              onClick={handleReturnOrder}
              disabled={['cancelled', 'return_requested', 'returned', 'return_rejected'].includes(orderData.status)}
              className={`px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                ['cancelled', 'return_requested', 'returned', 'return_rejected'].includes(orderData.status)
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700 hover:shadow-lg'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
              </svg>
              {orderData.status === 'return_requested' ? 'Return Requested' : 'Return Order'}
            </button>
            
            <button
              onClick={() => navigate('/my-orders')}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View All Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;