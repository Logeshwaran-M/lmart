import React, { useState, useEffect } from 'react';
import { doc, updateDoc, collection, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useNavigate, useParams } from 'react-router-dom';
import emailjs from "@emailjs/browser";
import { X, Package, Camera, Building2, CreditCard, Landmark, Upload, ArrowLeft } from 'lucide-react';

const ReturnOrderForm = ({ orderData: propOrderData, onClose, onReturnSuccess }) => {
  const { orderId: urlOrderId } = useParams();
  const [orderData, setOrderData] = useState(propOrderData || null);
  const [loading, setLoading] = useState(!propOrderData);
  const [reason, setReason] = useState('');
  const [returnItems, setReturnItems] = useState({});
  const [notes, setNotes] = useState('');
  const [returning, setReturning] = useState(false);
  const [returnType, setReturnType] = useState('replacement'); // 'replacement' or 'refund'
  const [damagePhoto, setDamagePhoto] = useState(null);
  const [damagePhotoPreview, setDamagePhotoPreview] = useState(null);
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accNo: '',
    ifscCode: ''
  });
  
  const navigate = useNavigate();

  // Fetch order data if not provided via props (for standalone page)
  useEffect(() => {
    const fetchOrder = async () => {
      if (!propOrderData && urlOrderId) {
        try {
          const userId = localStorage.getItem("token");
          if (!userId) {
            alert("Please login to continue");
            navigate("/login");
            return;
          }
          const orderRef = doc(db, "users", userId, "orders", urlOrderId);
          const orderSnap = await getDoc(orderRef);
          if (orderSnap.exists()) {
            setOrderData({ id: orderSnap.id, ...orderSnap.data() });
          } else {
            alert("Order not found");
            navigate("/my-orders");
          }
        } catch (error) {
          console.error("Error fetching order:", error);
          alert("Error loading order details");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchOrder();
  }, [propOrderData, urlOrderId, navigate]);

  const returnReasons = [
    "Product damaged/defective",
    "Wrong item received",
    "Changed my mind",
    "Item no longer needed",
    "Product size/fit issue",
    "Quality not as expected",
    "Other reason"
  ];

  // Initialize qty selectors
  useEffect(() => {
    if (orderData?.items) {
      const initial = {};
      orderData.items.forEach((item, i) => (initial[i] = item.quantity));
      setReturnItems(initial);
    }
  }, [orderData]);

  const handleQuantityChange = (index, max, value) => {
    const qty = Math.max(0, Math.min(max, parseInt(value) || 0));
    setReturnItems(prev => ({ ...prev, [index]: qty }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDamagePhoto(file);
      setDamagePhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({ ...prev, [name]: value }));
  };

  const sendReturnAutoEmail = async (itemsToReturn, photoUrl) => {
    let itemsFormatted = "";
    itemsToReturn.forEach(item => {
      itemsFormatted += `• ${item.name}\n  Qty: ${item.returnQuantity}\n  Price: ₹${item.price}\n\n`;
    });

    const customerEmail = orderData?.customerInfo?.email || orderData?.email || "customer@example.com";
    
    const emailParams = {
      to_name: "Admin",
      to_email: "your.shop.admin@example.com", // Send to admin
      customer_name: orderData?.customerInfo?.name || "Customer",
      customer_email: customerEmail,
      email: customerEmail,
      order_id: orderData?.orderId || orderData?.id,
      return_type: returnType.toUpperCase(),
      amount: orderData?.amount?.toFixed(2) || "0.00",
      reason: reason,
      description: notes || "No description provided",
      requested_at: new Date().toLocaleString(),
      items: itemsFormatted,
      photo_url: photoUrl || "No photo uploaded",
      bank_details: returnType === 'refund' ? `Bank: ${bankDetails.bankName}, Acc: ${bankDetails.accNo}, IFSC: ${bankDetails.ifscCode}` : 'N/A'
    };

    console.log("Email Params:", emailParams);

    try {
      await emailjs.send("service_nrnogjw", "template_nu122vv", emailParams, "N-iKTMZxu6PFUqOpU");
    } catch (error) {
      console.error("Email failed:", error);
    }
  };

  const handleReturnOrder = async () => {
    const itemsToReturn = Object.keys(returnItems)
      .filter(key => returnItems[key] > 0)
      .map(index => ({
        ...orderData.items[index],
        returnQuantity: returnItems[index],
        originalIndex: index
      }));

    if (itemsToReturn.length === 0 || !reason.trim()) {
      alert("Please select at least one item & a reason.");
      return;
    }

    if (returnType === 'replacement' && !damagePhoto) {
      alert("Please upload a photo of the damaged product.");
      return;
    }

    if (returnType === 'refund' && (!bankDetails.bankName || !bankDetails.accNo || !bankDetails.ifscCode)) {
      alert("Please provide all bank details.");
      return;
    }

    setReturning(true);

    try {
      const userId = localStorage.getItem("token");
      if (!userId) return;

      let photoUrl = "";
      if (damagePhoto) {
        const storageRef = ref(storage, `returns/${userId}/${Date.now()}_${damagePhoto.name}`);
        const snapshot = await uploadBytes(storageRef, damagePhoto);
        photoUrl = await getDownloadURL(snapshot.ref);
      }

      const returnDoc = {
        originalOrderId: orderData.id,
        orderIdDisplay: orderData.orderId,
        userId,
        customerInfo: orderData.customerInfo,
        items: itemsToReturn,
        reason,
        notes,
        returnType,
        status: "requested",
        requestedAt: serverTimestamp(),
        damagePhoto: photoUrl || null,
      };

      if (returnType === 'refund') {
        returnDoc.bankDetails = bankDetails;
        await addDoc(collection(db, "users", userId, "refund_requests"), { ...returnDoc, bankDetails });
      }

      await addDoc(collection(db, "returns"), returnDoc);

      // Update original order status to indicate a return is pending admin approval
      await updateDoc(doc(db, "users", userId, "orders", orderData.id), {
        status: "return_requested",
        returnRequestId: orderData.id,
        returnRequestedAt: serverTimestamp(),
        returnType: returnType
      });

      await sendReturnAutoEmail(itemsToReturn, photoUrl);
      
      if (onReturnSuccess) onReturnSuccess();
      alert(`Request submitted successfully.`);
      navigate("/my-orders");

    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setReturning(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div></div>;

  const isModal = !!onClose;

  return (
    <div className={`${isModal ? 'fixed inset-0 bg-black/70 z-50' : 'min-h-screen bg-gray-50'} flex items-center justify-center p-4 animate-fadeIn backdrop-blur-sm`}>
      <div className={`bg-white shadow-2xl w-full max-w-2xl animate-slideUp overflow-hidden flex flex-col ${isModal ? 'rounded-3xl max-h-[90vh]' : 'rounded-3xl my-8'}`}>
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-4">
            {!isModal && (
              <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200">
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
            <div className="bg-orange-100 p-3 rounded-2xl">
              <Package className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Return Order</h2>
              <p className="text-gray-500 text-sm font-medium">Order ID: <span className="text-gray-800">#{orderData?.orderId}</span></p>
            </div>
          </div>
          {isModal && (
            <button onClick={onClose} disabled={returning} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          )}
        </div>

        <div className={`overflow-y-auto flex-1 p-6 space-y-8 ${isModal ? '' : 'max-h-none'}`}>
          
          {/* Step 1: Select Type */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Choose Return Type
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setReturnType('replacement')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${returnType === 'replacement' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
              >
                <Package className="w-8 h-8" />
                <span className="font-bold">Replacement</span>
                <span className="text-xs text-center">Get the same product again</span>
              </button>
              <button 
                onClick={() => setReturnType('refund')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${returnType === 'refund' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
              >
                <Landmark className="w-8 h-8" />
                <span className="font-bold">Refund</span>
                <span className="text-xs text-center">Get money back to bank</span>
              </button>
            </div>
          </div>

          {/* Conditional Input based on type */}
          {returnType === 'replacement' ? (
            <div className="animate-fadeIn">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                Upload Damage Photo
              </h3>
              <div className="relative group">
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="damage-photo" />
                <label htmlFor="damage-photo" className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-3xl p-8 cursor-pointer hover:border-orange-600 hover:bg-orange-50 transition-all">
                  {damagePhotoPreview ? (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
                      <img src={damagePhotoPreview} alt="Damage" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <>
                      <div className="bg-orange-100 p-4 rounded-full mb-4"><Upload className="w-8 h-8 text-orange-600" /></div>
                      <p className="font-bold text-gray-700">Click to upload photo</p>
                    </>
                  )}
                </label>
              </div>
            </div>
          ) : (
            <div className="animate-fadeIn space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                Bank Details
              </h3>
              <div className="space-y-3">
                <input type="text" name="bankName" placeholder="Bank Name" value={bankDetails.bankName} onChange={handleBankChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                <input type="text" name="accNo" placeholder="Account Number" value={bankDetails.accNo} onChange={handleBankChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                <input type="text" name="ifscCode" placeholder="IFSC Code" value={bankDetails.ifscCode} onChange={handleBankChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
              </div>
            </div>
          )}

          {/* Reason Selection */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
              Reason for Return
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {returnReasons.map((r, idx) => (
                <button key={idx} onClick={() => setReason(r)} className={`px-4 py-3 rounded-2xl border text-sm font-medium transition-all text-left ${reason === r ? 'border-orange-600 bg-orange-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200'}`}>{r}</button>
              ))}
            </div>
          </div>

          {/* Items Selection */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
              Verify Items
            </h3>
            <div className="space-y-3">
              {orderData?.items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                      <p className="text-gray-500 text-xs">Qty: {item.quantity} | ₹{item.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-1 rounded-xl border">
                    <button disabled={returnItems[index] <= 0} onClick={() => handleQuantityChange(index, item.quantity, returnItems[index] - 1)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center disabled:opacity-30">−</button>
                    <span className="font-bold w-4 text-center">{returnItems[index]}</span>
                    <button disabled={returnItems[index] >= item.quantity} onClick={() => handleQuantityChange(index, item.quantity, returnItems[index] + 1)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center disabled:opacity-30">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="pb-4">
            <textarea placeholder="Any additional details..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600 transition-all min-h-[100px]" />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t flex gap-4">
          <button onClick={isModal ? onClose : () => navigate(-1)} disabled={returning} className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-200 transition-colors">Cancel</button>
          <button disabled={returning || !reason || Object.values(returnItems).every(q => q === 0)} onClick={handleReturnOrder} className="flex-[2] bg-orange-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2">
            {returning ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</> : `Submit ${returnType === 'replacement' ? 'Replacement' : 'Refund'} Request`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnOrderForm;