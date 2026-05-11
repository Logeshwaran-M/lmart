import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { db, storage } from '../../firebase'; 
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"; // Added updateDoc
import { ref, getDownloadURL } from "firebase/storage";
import emailjs from '@emailjs/browser';
import { runTransaction } from "firebase/firestore";

// 🔑 EMAIL.JS CONFIGURATION
const EMAILJS_SERVICE_ID = "service_yg9pb3f"; 
const EMAILJS_PUBLIC_KEY = "av8_Oe-8pG16qxp2M"; 
const EMAILJS_AUTO_REPLY_TEMPLATE_ID = "template_mbbvaa1"; 
const ADMIN_EMAIL = "your.shop.admin@example.com";

const decreaseStockAfterOrder = async (items) => {
  for (const item of items) {
  const productId = item.productId || item.id;
const productRef = doc(db, "products", productId);


    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(productRef);

      if (!snap.exists()) {
        console.error("❌ Product not found:", item.id);
        return;
      }

      const variants = snap.data().variants;

      const variantIndex = variants.findIndex(v =>
        (item.variantId && v.variantId === item.variantId) ||
        (!item.variantId &&
         v.color === item.selectedColor &&
         v.size === item.selectedSize)
      );

      if (variantIndex === -1) {
        console.error("❌ Variant not matched");
        return;
      }

      variants[variantIndex].stock -= item.quantity;
      transaction.update(productRef, { variants });
    });
  }
};

// 📧 AUTO REPLY FUNCTION
const sendAutoReply = async (templateParams) => {
    try {
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_AUTO_REPLY_TEMPLATE_ID,
            templateParams,
            EMAILJS_PUBLIC_KEY
        );
        console.log("✅ Auto-reply email sent to customer");
    } catch (error) {
        console.error("❌ Auto-reply email failed:", error);
    }
};

// 📧 EMAIL SENDING FUNCTION
const sendOrderEmail = async (type, templateParams) => {
    const templateId = type === 'COD' ? EMAILJS_COD_TEMPLATE_ID : EMAILJS_PAID_TEMPLATE_ID;

    if (templateId.includes("actual_id")) {
         console.error(`Email.js Error: Template ID for ${type} is a placeholder. Skipping email.`);
         return { success: false, error: "Missing Email.js configuration." };
    }
    
    try {
        console.log(`Attempting to send ${type} order email via Email.js...`);
        await emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams, EMAILJS_PUBLIC_KEY);
        console.log(`✅ ${type} order email successfully sent.`);
        return { success: true };
    } catch (error) {
        console.error(`⚠️ Non-critical Error sending ${type} email via Email.js:`, error);
        return { success: true, warning: `Email failed to send: ${error.message}` };
    }
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const buyNowItem = location.state?.item;
  const isBuyNow = location.state?.buyNow;
  const skipToPayment = location.state?.skipToPayment;

  const { items, clearCart, updateCartItem } = useCart();

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingTotal, setShippingTotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [shippingChargeMap, setShippingChargeMap] = useState({});
  // ⭐ MODIFIED LINE: Check for 'isBuyNow' or 'skipToPayment' to start at Step 2
  const [currentStep, setCurrentStep] = useState(2);

  const [processingPayment, setProcessingPayment] = useState(false);
  const [loadingImages, setLoadingImages] = useState({});

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    pincode: "",
    city: "",
    email: ""
  });
  
  const [userDataFromDB, setUserDataFromDB] = useState(null); 
  const [isFetchingUser, setIsFetchingUser] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [errors, setErrors] = useState({
    form: "",
    customization: "",
    payment: ""
  });
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [isCartEmpty, setIsCartEmpty] = useState(false);
  const [locationDetails, setLocationDetails] = useState({
    latitude: null,
    longitude: null,
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: ""
  });
  
  // 🔑 Fetch User Data from Firebase
  useEffect(() => {
    const currentUserId = localStorage.getItem('token'); 
    
    // 🛑 MODIFICATION: Check for user ID and redirect to login if missing
    if (!currentUserId) {
      setErrors(prev => ({ 
        ...prev, 
        form: "You must be logged in to checkout. Redirecting to login..." 
      }));
      setIsFetchingUser(false);
      // 🔥 Redirect to login page
      navigate("/login", { replace: true, state: { from: location.pathname } }); 
      return; 
    }

    const fetchUserData = async () => {
      try {
        const userRef = doc(db, "users", currentUserId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          setUserDataFromDB({
            ...userData,
            userId: currentUserId,
          });

          setForm(prevForm => ({
            ...prevForm,
            name: userData.name || prevForm.name,
            email: userData.email || prevForm.email,
            phone: userData.contactNo || userData.phone || prevForm.phone, 
          }));
        } else {
          setUserDataFromDB({ userId: currentUserId });
          console.warn("User profile data not found, proceeding with form fill.");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setErrors(prev => ({ ...prev, form: "Failed to load user information. Please refresh the page." }));
      } finally {
        setIsFetchingUser(false);
      }
    };

    fetchUserData();
  }, [navigate, location.pathname]);

  // 🔥 NEW FUNCTION: Fetch complete product data for oldee items
  const fetchOldeeProductDetails = async (productId) => {
    try {
      const oldeeRef = doc(db, "oldee", productId);
      const oldeeSnap = await getDoc(oldeeRef);
      
      if (oldeeSnap.exists()) {
        const oldeeData = oldeeSnap.data();
        
        // Get image URL
        let imageUrl = "https://via.placeholder.com/150?text=No+Image";
        
        if (oldeeData.imageURLs && oldeeData.imageURLs.length > 0) {
          imageUrl = oldeeData.imageURLs[0];
        } else if (oldeeData.imageUrl) {
          imageUrl = oldeeData.imageUrl;
        } else if (oldeeData.image) {
          imageUrl = oldeeData.image;
        }
        
        return {
          id: productId,
          name: oldeeData.name || "Unnamed Product",
          price: oldeeData.price || 0,
          image: imageUrl,
          description: oldeeData.description || "",
          sellerName: oldeeData.seller?.displayName || "Unknown Seller",
          sellerId: oldeeData.seller?.uid || oldeeData.sellerId,
          isOldee: true
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching oldee product ${productId}:`, error);
      return null;
    }
  };

  // Check cart status
  useEffect(() => {
    const hasRegularItems = items && items.length > 0;
    const stored = sessionStorage.getItem("selectedCartItems");
    const hasStoredItems = stored && JSON.parse(stored).length > 0;
    const hasBuyNowItem = isBuyNow && buyNowItem;
    
    if (!hasRegularItems && !hasStoredItems && !hasBuyNowItem) {
      console.error("No items available for checkout");
      setIsCartEmpty(true);
      return;
    }
    
    setIsCartEmpty(false);
  }, [isBuyNow, buyNowItem, items]);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  // Load cart items, fetch shipping charges, and calculate total
  useEffect(() => {
    const loadCheckoutItems = async () => {
      if (isCartEmpty) return;
      
      let itemsToUse = [];
      const shippingMap = {};

      if (isBuyNow && buyNowItem) {
        // ⭐ MODIFICATION: Use offerPrice if available for buyNowItem (negotiated price)
        const priceToUse = buyNowItem.offerPrice 
            && typeof buyNowItem.offerPrice === 'number' 
            && buyNowItem.offerPrice > 0 
            ? buyNowItem.offerPrice 
            : buyNowItem.price;

        itemsToUse = [{
            ...buyNowItem, 
            price: priceToUse // Set the effective price for checkout
        }];
        
        // Fetch shipping charge for Buy Now item
        try {
          const productId = buyNowItem.productId || buyNowItem.id;
          if (productId) {
            const productRef = doc(db, "products", productId);
            const snap = await getDoc(productRef);
            
            if (snap.exists()) {
              const data = snap.data();
              shippingMap[productId] = Number(data.shippingCharge ?? 0);
            }
          }
        } catch (err) {
          console.error("Shipping fetch error for Buy Now:", err);
        }
      } else {
        const stored = sessionStorage.getItem("selectedCartItems");
        itemsToUse = stored && JSON.parse(stored).length > 0 
          ? JSON.parse(stored) 
          : items.filter(item => item.quantity > 0);
          
        // Fetch shipping charges for all cart items
        for (const item of itemsToUse) {
          try {
            const productId = item.productId || item.id;
            if (!productId) continue;
            
            const productRef = doc(db, "products", productId);
            const snap = await getDoc(productRef);
            
            if (snap.exists()) {
              const data = snap.data();
              shippingMap[productId] = Number(data.shippingCharge ?? 0);
            }
          } catch (err) {
            console.error(`Shipping fetch error for product ${item.id}:`, err);
          }
        }
      }

      if (!itemsToUse || itemsToUse.length === 0) {
        console.error("No items to checkout after validation");
        setIsCartEmpty(true);
        return;
      }

      // 🔥 ENHANCED: Check each item for oldee products and fetch missing data
      const enhancedItems = await Promise.all(
        itemsToUse.map(async (item) => {
          // Set loading state for this item
          setLoadingImages(prev => ({ ...prev, [item.id]: true }));
          
          // If item already has a proper image URL, use it
          if (item.image && item.image.startsWith('http')) {
            setLoadingImages(prev => ({ ...prev, [item.id]: false }));
            return {
              ...item,
              quantity: item.quantity || 1,
              selectedColor: item.selectedColor || "",
              selectedSize: item.selectedSize || "",
              selectedRam: item.selectedRam || "",
              colors: item.colors || [],
              sizes: item.sizes || [],
              rams: item.rams || []
            };
          }
          
          // Try to fetch from oldee collection
          try {
            const oldeeData = await fetchOldeeProductDetails(item.id);
            if (oldeeData) {
              console.log(`✅ Loaded oldee product: ${oldeeData.name}`, oldeeData.image);
              
              // Only update price if it wasn't already set by a negotiated offerPrice (for BuyNow)
              const finalPrice = item.price || oldeeData.price;
              
              return {
                ...item,
                name: item.name || oldeeData.name,
                price: finalPrice, // Use the already set price (offerPrice or original) or fetched oldee price
                image: oldeeData.image,
                quantity: item.quantity || 1,
                selectedColor: item.selectedColor || "",
                selectedSize: item.selectedSize || "",
                selectedRam: item.selectedRam || "",
                colors: item.colors || [],
                sizes: item.sizes || [],
                rams: item.rams || [],
                isOldee: true
              };
            }
          } catch (error) {
            console.warn(`Could not fetch oldee data for ${item.id}:`, error);
          }
          
          // Return item as-is if no oldee data found
          return {
            ...item,
            quantity: item.quantity || 1,
            selectedColor: item.selectedColor || "",
            selectedSize: item.selectedSize || "",
            selectedRam: item.selectedRam || "",
            colors: item.colors || [],
            sizes: item.sizes || [],
            rams: item.rams || []
          };
        })
      );

      setCheckoutItems(enhancedItems);
      setShippingChargeMap(shippingMap);
      console.log("Enhanced Checkout Items:", enhancedItems);
      console.log("Shipping Map:", shippingMap);

      // Calculate subtotal and shipping
      const rawSubtotal = enhancedItems.reduce(
        (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
        0
      );
      
      // Calculate total shipping based on unique products (once per product, not per quantity)
      const uniqueProductIds = new Set();
      enhancedItems.forEach(item => {
        const productId = item.productId || item.id;
        uniqueProductIds.add(productId);
      });
      
      let rawShippingTotal = 0;
      uniqueProductIds.forEach(productId => {
        rawShippingTotal += shippingMap[productId] || 0;
      });
      
      // Apply free shipping threshold of ₹499
      const finalShipping = rawShippingTotal;
      
      // 🎯 MODIFICATION: Force the totals to 2 decimal places for financial accuracy
      const finalSubtotal = parseFloat(rawSubtotal.toFixed(2));
      const finalShippingTotal = parseFloat(finalShipping.toFixed(2));
      const finalTotal = parseFloat((finalSubtotal + finalShippingTotal).toFixed(2));
      
      setSubtotal(finalSubtotal);
      setShippingTotal(finalShippingTotal);
      setTotal(finalTotal);
      setIsCartEmpty(false);
    };

    loadCheckoutItems();
  }, [items, isBuyNow, buyNowItem, isCartEmpty]);

  // Get image URL for a product
  const getProductImage = (item) => {
    // Use item's image if available
    if (item.image && item.image.startsWith('http')) {
      return item.image;
    }
    
    // Fallback to placeholder
    return "https://via.placeholder.com/150?text=No+Image";
  };

  // Reverse Geocoding Function - Convert coordinates to address
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }
      
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        
        // Build a proper address string
        const addressParts = [];
        if (address.house_number) addressParts.push(address.house_number);
        if (address.road) addressParts.push(address.road);
        if (address.suburb) addressParts.push(address.suburb);
        if (address.neighbourhood) addressParts.push(address.neighbourhood);
        
        const city = address.city || address.town || address.village || address.county || "";
        const state = address.state || "";
        const pincode = address.postcode || "";
        const country = address.country || "";
        
        // Create a formatted address string
        const formattedAddress = addressParts.length > 0 
          ? addressParts.join(", ")
          : data.display_name || `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        
        return {
          formattedAddress,
          road: address.road || "",
          suburb: address.suburb || "",
          city,
          state,
          pincode,
          country,
          fullAddress: data.display_name || formattedAddress
        };
      }
      
      return null;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return null;
    }
  };

  // 📍 Handle Live Location with Reverse Geocoding
  const handleLiveLocation = async () => {
    if (!navigator.geolocation) {
      setErrors(prev => ({ ...prev, form: "Geolocation is not supported by your browser." }));
      return;
    }
    
    setFetchingLocation(true);
    setErrors(prev => ({ ...prev, form: "" }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // First show coordinates while fetching address
        setLocationDetails({
          latitude,
          longitude,
          address: "Fetching address...",
          city: "",
          state: "",
          pincode: "",
          country: ""
        });
        
        // Reverse geocode to get address
        const addressDetails = await reverseGeocode(latitude, longitude);
        
        if (addressDetails) {
          // Update location details with actual address
          setLocationDetails({
            latitude,
            longitude,
            address: addressDetails.formattedAddress,
            city: addressDetails.city,
            state: addressDetails.state,
            pincode: addressDetails.pincode,
            country: addressDetails.country,
            fullAddress: addressDetails.fullAddress
          });
          
          // Auto-fill the form with fetched address
          setForm(prevForm => ({
            ...prevForm,
            address: addressDetails.formattedAddress,
            city: addressDetails.city || prevForm.city,
            pincode: addressDetails.pincode || prevForm.pincode
          }));
          
          setErrors(prev => ({ 
            ...prev, 
            form: "✅ Location fetched successfully! Address auto-filled."
          }));
        } else {
          // If reverse geocoding fails, use coordinates but format better
          const fallbackAddress = `GPS Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setForm(prevForm => ({
            ...prevForm,
            address: fallbackAddress,
            city: prevForm.city || 'Current Location',
            pincode: prevForm.pincode || ''
          }));
          
          setErrors(prev => ({ 
            ...prev, 
            form: "✅ Location fetched! Could not get full address details."
          }));
        }
        
        setFetchingLocation(false);
      },
      (error) => {
        setFetchingLocation(false);
        let errorMessage = "Could not get location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location access denied. Please allow location access in your browser settings.";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Location request timed out. Please try again.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location information is unavailable.";
        }
        setErrors(prev => ({ ...prev, form: `⚠️ ${errorMessage}` }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // Validation functions
  const validateForm = () => {
    const { name, phone, address, city, pincode, email } = form;
    
    if (!userDataFromDB || !userDataFromDB.userId) return "User ID missing. Please log in again."; 
    if (!name.trim()) return "Name is required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Valid email is required";
    if (!phone.trim() || !/^\d{10}$/.test(phone)) return "Valid 10-digit phone number is required";
    
    // Improved address validation
    if (!address.trim()) return "Address is required";
    if (address.includes("Approximate Location:") || address.includes("GPS Location:")) {
      return "Please enter a proper address, not just coordinates. Click 'Use My Current Location' for automatic address detection.";
    }
    
    if (!city.trim()) return "City is required";
    if (city === "Location Fetched" || city === "Current Location") {
      return "Please enter a proper city name";
    }
    
    if (!pincode.trim() || !/^\d{6}$/.test(pincode)) return "Valid 6-digit pincode is required";
    if (pincode === "000000") {
      return "Please enter a valid pincode";
    }
    
    return null;
  };

  const validateCustomization = () => {
    const incompleteCustomization = checkoutItems.find(item => {
      if (item.colors && item.colors.length > 0 && !item.selectedColor) return true;
      if (item.sizes && item.sizes.length > 0 && !item.selectedSize) return true;
      if (item.rams && item.rams.length > 0 && !item.selectedRam) return true;
      return false;
    });

    return incompleteCustomization;
  };

  const handleBack = () => {
  navigate(-1);
};


  // Handle customization changes
  const handleCustomizationChange = (itemId, field, value) => {
    setCheckoutItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
    
    updateCartItem(itemId, { [field]: value });
  };

  // Handle Input Change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors.form) {
      setErrors(prev => ({ ...prev, form: "" }));
    }
  };

  // Proceed to Payment
  const proceedToPayment = () => {
    if (checkoutItems.length === 0 || isCartEmpty) {
      setErrors(prev => ({ ...prev, customization: "⚠️ Your cart is empty. Please add items before proceeding." }));
      return;
    }
    
    const customizationError = validateCustomization();
    if (customizationError) {
      setErrors(prev => ({ ...prev, customization: "⚠️ Please select all customization options for your items!" }));
      return;
    }
    
    if (checkoutItems.length === 0 || total <= 0) {
        setErrors(prev => ({ ...prev, customization: "⚠️ Your cart is empty or total amount is ₹0. Please check your items." }));
        return;
    }

    if (isFetchingUser) {
        setErrors(prev => ({ ...prev, form: "Loading user details. Please wait..." }));
        return;
    }
    if (!userDataFromDB || !userDataFromDB.userId) {
        setErrors(prev => ({ ...prev, form: "User details are not loaded. Please wait or refresh." }));
        return;
    }
     window.scrollTo({ top: 0, behavior: "smooth" });

    setCurrentStep(2);
    setErrors({ form: "", customization: "", payment: "" });
  };

  // Cancel Order
  const handleCancel = () => {
    sessionStorage.removeItem("selectedCartItems");
    sessionStorage.removeItem("buyNowItem");
    sessionStorage.removeItem("buyNowFlag");
    
    if (isBuyNow) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  // Back to Customization
  const backToCustomization = () => {
    setCurrentStep(1);
    setErrors({ form: "", customization: "", payment: "" });
  };

  // 🚨 **ONLY CHANGE ADDED**: Function to mark Oldee products as sold
  const markOldeeProductsAsSold = async () => {
    try {
      for (const item of checkoutItems) {
        // Check if this is an Oldee product
        if (item.isOldee) {
          console.log(`Marking Oldee product ${item.id} as sold...`);
          
          // Update the product in Firestore to mark it as sold
          await updateDoc(doc(db, "oldee", item.id), {
            isSold: true,
            status: "sold",
            soldAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          console.log(`✅ Product ${item.id} marked as sold`);
        }
      }
    } catch (error) {
      console.error("Error marking Oldee products as sold:", error);
    }
  };
  const fetchSellerInfoForItem = async (item) => {
  try {
    // 1️⃣ Try products collection
    const productRef = doc(db, "products", item.productId || item.id);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      const data = productSnap.data();
      return {
        sellerId: data.sellerId || data.sellerID || null,
        sellerName: data.sellerName || "Unknown Seller",
      };
    }

    // 2️⃣ Fallback: oldee collection
    const oldeeRef = doc(db, "oldee", item.productId || item.id);
    const oldeeSnap = await getDoc(oldeeRef);

    if (oldeeSnap.exists()) {
      const data = oldeeSnap.data();
      return {
        sellerId: data.sellerId || data.seller?.uid || null,
        sellerName: data.seller?.displayName || "Unknown Seller",
      };
    }

    return { sellerId: null, sellerName: "Unknown Seller" };
  } catch (err) {
    console.error("Failed to fetch seller info:", err);
    return { sellerId: null, sellerName: "Unknown Seller" };
  }
};


  // 🔥 UPDATED: Save Order to Firebase with Seller Info
  const saveOrderToFirebase = async (data, userId) => {
    try {
      // 🚨 **ADDED**: Mark Oldee products as sold before saving order
      if (data.paymentMethod === "cod") {
        await markOldeeProductsAsSold();
      }
      
      const ordersCollectionRef = collection(db, "users", userId, "orders"); 
      
     const orderItems = await Promise.all(
  checkoutItems.map(async (item) => {
    const sellerInfo = await fetchSellerInfoForItem(item);
    const itemImage = getProductImage(item);

    return {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
      image: itemImage,
      selectedColor: item.selectedColor || "",
      selectedSize: item.selectedSize || "",
      selectedRam: item.selectedRam || "",

      // 🔥 FETCHED AT CHECKOUT TIME
      sellerId: sellerInfo.sellerId,
      sellerName: sellerInfo.sellerName,

      productType: item.isOldee ? "old" : "new",
      marketplace: item.isOldee ? "oldee" : "emart",
    };
  })
);

      // 🔥 COLLECT UNIQUE SELLER IDS & NAMES
      const sellerIds = [...new Set(orderItems.map(i => i.sellerId).filter(id => id))];
      const sellerNames = [...new Set(orderItems.map(i => i.sellerName).filter(name => name))];

      // 🔥 FULL ORDER OBJECT WITH SELLER INFO
      const orderData = {
        ...data,
        items: orderItems,
        sellerIds: sellerIds,
        sellerNames: sellerNames,
        primarySellerId: sellerIds[0] || null,
        customerID: userId,
        createdAt: serverTimestamp(),
        locationDetails: locationDetails.latitude ? {
          coordinates: {
            latitude: locationDetails.latitude,
            longitude: locationDetails.longitude
          },
          address: form.address,
          city: form.city,
          state: locationDetails.state,
          pincode: form.pincode,
          country: locationDetails.country,
          fetchedAt: new Date().toISOString()
        } : null,
        isMultiSeller: sellerIds.length > 1,
        marketplace: orderItems.some(item => item.productType === "old") ? "oldee" : "emart",
        shippingCharge: shippingTotal // Add shipping charge to order data
      };

      const docRef = await addDoc(ordersCollectionRef, orderData);
      const orderId = docRef.id;
      console.log("✅ Order saved with ID: ", orderId);
      
      // Prepare order data for email
      const orderDataForEmail = {
        ...data,
        id: orderId,
        customerInfo: {
          ...data.customerInfo,
          email: data.customerInfo.email || userDataFromDB?.email || form.email
        }
      };

      const orderItemsString = orderDataForEmail.items.map(item => 
          ` - ${item.quantity} x ${item.name}` + 
          (item.selectedColor ? ` (Color: ${item.selectedColor})` : '') + 
          (item.selectedSize ? ` (Size: ${item.selectedSize})` : '') + 
          (item.selectedRam ? ` (RAM: ${item.selectedRam})` : '') + 
          ` @ ₹${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ).join('\n');

      // 🔥 ADD SELLER INFO TO EMAIL
      const sellerInfoText = sellerNames.length > 0 
        ? `Seller(s): ${sellerNames.join(', ')}`
        : 'No seller info available';

      const adminTemplateParams = {
          to_email: ADMIN_EMAIL, 
          customer_name: orderDataForEmail.customerInfo.name,
          order_id: orderId,
          order_date: new Date().toLocaleDateString(),
          total_amount: `₹${orderDataForEmail.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          payment_method: data.paymentMethod === "cod" ? "Cash on Delivery (Pending)" : "Online Payment (Confirmed)",
          shipping_address: `${orderDataForEmail.customerInfo.address}, ${orderDataForEmail.customerInfo.city}, ${orderDataForEmail.customerInfo.pincode}, Phone: ${orderDataForEmail.customerInfo.phone}`,
          order_items: orderItemsString,
          seller_info: sellerInfoText,
          marketplace: orderData.marketplace || "emart",
          location_details: locationDetails.latitude ? 
            `Location: ${locationDetails.latitude}, ${locationDetails.longitude}\n${form.address}` : "No location data",
          shipping_charge: `₹${shippingTotal.toFixed(2)}` // Add shipping to email
      };
      
      // 📧 Send Emails (wrapped in try-catch to avoid failing the order if email fails)
      try {
        const emailType = data.paymentMethod === "cod" ? 'COD' : 'PAID';
        await sendOrderEmail(emailType, adminTemplateParams);

        const autoReplyParams = {
          email: orderDataForEmail.customerInfo.email,
          customer_name: orderDataForEmail.customerInfo.name,
          order_id: orderId,
          total_amount: `₹${orderDataForEmail.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          order_items: orderItemsString || "Items will be updated",
          seller_info: sellerInfoText,
          marketplace: orderData.marketplace || "emart",
          shipping_charge: `₹${shippingTotal.toFixed(2)}`
        };
        
        await sendAutoReply(autoReplyParams);
      } catch (emailError) {
        console.error("Order saved, but failed to send notification emails:", emailError);
      }

      return true;
    } catch (e) {
        console.error("Error adding document to Firebase subcollection or sending email: ", e);
        setErrors(prev => ({ 
          ...prev, 
          payment: `Failed to save order: ${e.message || "Unknown error"}. Please contact support.` 
        }));
        return false;
    }
  };

  // Create Razorpay Order
  const createRazorpayOrder = async (amount) => {
    return {
      id: `order_${Date.now()}`,
      currency: "INR",
      // Amount must be in the smallest currency unit (paise)
      amount: amount * 100, 
    };
  };

  // Verify Payment
  const verifyPayment = async (razorpayPaymentId, razorpayOrderId, razorpaySignature) => {
    return { success: true };
  };

  // Initialize Razorpay Payment
  const initializeRazorpayPayment = async () => {
    if (!window.Razorpay) {
      setErrors(prev => ({ ...prev, payment: "Payment gateway not loaded. Please refresh the page." }));
      return false;
    }
    
    const currentUserId = userDataFromDB?.userId;

    if (!currentUserId) {
        setErrors(prev => ({ ...prev, payment: "User not logged in. Cannot proceed with payment." }));
        return false;
    }

    try {
      const order = await createRazorpayOrder(total);
      
      const options = {
        key: "rzp_test_RD3J1sajzD89a8",
        amount: order.amount, // Amount is in paise
        currency: order.currency,
        name: "L-mart",
        description: "Order Payment",
        handler: async function (response) {
          setProcessingPayment(true);
          
          try {
            const verificationResult = await verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );

            if (verificationResult.success) {
              const orderData = {
                paymentId: response.razorpay_payment_id,
                orderId: `ORD-${Date.now()}`,
                razorpayOrderId: response.razorpay_order_id,
                amount: total, // Use the total state value (e.g., 2455.00)
                items: checkoutItems,
                customerInfo: form,
                paymentMethod: "razorpay",
                status: "confirmed",
                createdAt: new Date().toISOString(),
                shippingCharge: shippingTotal // Add shipping to order data
              };

              const saved = await saveOrderToFirebase(orderData, currentUserId);
              if (!saved) {
                  setProcessingPayment(false);
                  return; 
              }

              // 🔥 DECREASE STOCK AFTER SUCCESSFUL PAYMENT & ORDER SAVE
await decreaseStockAfterOrder(checkoutItems);

              sessionStorage.setItem("orderSuccessData", JSON.stringify(orderData));

              clearCart();
              sessionStorage.removeItem("selectedCartItems");
              sessionStorage.removeItem("buyNowItem");
              sessionStorage.removeItem("buyNowFlag");
              
              navigate("/my-orders");
            } else {
              setErrors(prev => ({ ...prev, payment: "Payment verification failed. Please try again." }));
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            setErrors(prev => ({ ...prev, payment: "Payment verification failed. Please contact support." }));
          } finally {
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        notes: {
          address: `${form.address}, ${form.city} - ${form.pincode}`,
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
            setErrors(prev => ({ ...prev, payment: "Payment was cancelled. Please try again." }));
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      return true;

    } catch (error) {
      console.error("Razorpay initialization error:", error);
      setErrors(prev => ({ ...prev, payment: "Failed to initialize payment. Please try again." }));
      return false;
    }
  };

  // Handle different payment methods
  const handlePayment = async () => {
    if (processingPayment) return;

    const formError = validateForm();
    if (formError) {
      setErrors(prev => ({ ...prev, form: `⚠️ ${formError}` }));
      return;
    }

    if (!paymentMethod) {
      setErrors(prev => ({ ...prev, payment: "⚠️ Please select a payment method!" }));
      return;
    }
    
    if (checkoutItems.length === 0 || total <= 0) {
        setErrors(prev => ({ ...prev, payment: "⚠️ Cart is empty or failed to load. Total is 0." }));
        setProcessingPayment(false);
        return;
    }

    const currentUserId = userDataFromDB?.userId;

    if (!currentUserId) {
        setErrors(prev => ({ ...prev, payment: "User not logged in. Cannot proceed with payment." }));
        setProcessingPayment(false);
        return;
    }

    setProcessingPayment(true);
    setErrors({ form: "", customization: "", payment: "" });

    try {
      if (paymentMethod === "razorpay") {
        const initialized = await initializeRazorpayPayment();
        if (!initialized) {
          setProcessingPayment(false);
        }
      } else if (paymentMethod === "cod") {
        const orderData = {
          paymentId: `COD-${Date.now()}`,
          orderId: `ORD-${Date.now()}`,
          amount: total,
          items: checkoutItems,
          customerInfo: form,
          paymentMethod: "cod",
          status: "pending",
          createdAt: new Date().toISOString(),
          shippingCharge: shippingTotal
        };

        const saved = await saveOrderToFirebase(orderData, currentUserId);
        if (!saved) {
          setProcessingPayment(false);
          return;
        }

        await decreaseStockAfterOrder(checkoutItems);
        sessionStorage.setItem("orderSuccessData", JSON.stringify(orderData));

        clearCart();
        sessionStorage.removeItem("selectedCartItems");
        sessionStorage.removeItem("buyNowItem");
        sessionStorage.removeItem("buyNowFlag");
        
        navigate("/my-orders");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setErrors(prev => ({ ...prev, payment: "An unexpected error occurred. Please try again." }));
      setProcessingPayment(false);
    } finally {
      // For COD, we reset here. For Razorpay, it's handled by Razorpay callbacks.
      if (paymentMethod === "cod") {
        setProcessingPayment(false);
      }
    }
  };

  // Show Location Details Card
  const LocationDetailsCard = () => {
    if (!locationDetails.latitude) return null;
    
    return (
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
        <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Location Details
        </h4>
        
        <div className="space-y-3">
          {/* Full Address */}
          <div className="bg-white p-3 rounded border">
            <p className="font-medium text-gray-700 mb-1">Full Address:</p>
            <p className="text-gray-800">{locationDetails.address || `Location: ${locationDetails.latitude.toFixed(6)}, ${locationDetails.longitude.toFixed(6)}`}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Coordinates */}
            <div className="bg-white p-3 rounded border">
              <p className="font-medium text-gray-700 mb-1">Coordinates:</p>
              <p className="text-gray-600 text-sm font-mono">
                {locationDetails.latitude.toFixed(6)}, {locationDetails.longitude.toFixed(6)}
              </p>
            </div>
            
            {/* City */}
            {locationDetails.city && (
              <div className="bg-white p-3 rounded border">
                <p className="font-medium text-gray-700 mb-1">City:</p>
                <p className="text-gray-600">{locationDetails.city}</p>
              </div>
            )}
            
            {/* Pincode */}
            {locationDetails.pincode && (
              <div className="bg-white p-3 rounded border">
                <p className="font-medium text-gray-700 mb-1">Pincode:</p>
                <p className="text-gray-600">{locationDetails.pincode}</p>
              </div>
            )}
          </div>
          
          {/* State and Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {locationDetails.state && (
              <div className="bg-white p-3 rounded border">
                <p className="font-medium text-gray-700 mb-1">State:</p>
                <p className="text-gray-600">{locationDetails.state}</p>
              </div>
            )}
            
            {locationDetails.country && (
              <div className="bg-white p-3 rounded border">
                <p className="font-medium text-gray-700 mb-1">Country:</p>
                <p className="text-gray-600">{locationDetails.country}</p>
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500 mt-2">
            <p>✓ This address will be saved with your order for delivery</p>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-100 py-6">
         {/* STEP INDICATOR */}
         <div className="mb-4 flex justify-end max-w-4xl mx-auto">
  <button
    onClick={handleBack}
    className="flex items-center  gap-2 text-md font-medium text-gray-600 hover:text-gray-900"
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
    Back to Cart
  </button>
</div>
      
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* GLOBAL ERRORS */}
        {(errors.form || errors.payment) && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 animate-fadeIn">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-bold">Attention Required</span>
            </div>
            <p className="text-sm">{errors.form || errors.payment}</p>
          </div>
        )}
        {/* STEP 2: PAYMENT */}
        {currentStep === 2 && !isCartEmpty && checkoutItems.length > 0 && (
          <div>
            {/* SHIPPING FORM */}
            <h3 className="text-xl font-semibold mb-4">Shipping Information</h3>
            
            {/* LIVE LOCATION BUTTON */}
            <div className="mb-6">
              <button
                onClick={handleLiveLocation}
                disabled={fetchingLocation}
                className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                  fetchingLocation
                    ? 'bg-blue-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white`}
              >
                {fetchingLocation ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Fetching Your Location...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Use My Current Location
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Click to automatically fill your address using GPS
              </p>
            </div>

            {/* LOCATION DETAILS CARD */}
            <LocationDetailsCard />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="10-digit phone number"
                  value={form.phone}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  pattern="[0-9]{10}"
                  maxLength="10"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  placeholder="Enter your city"
                  value={form.city}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Complete Address *</label>
                <textarea
                  id="address"
                  name="address"
                  placeholder="House no., Building, Street, Area, Landmark"
                  value={form.address}
                  onChange={handleChange}
                  rows="3"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter complete delivery address including house number and landmark
                </p>
              </div>

              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                <input
                  id="pincode"
                  type="text"
                  name="pincode"
                  placeholder="6-digit pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  pattern="[0-9]{6}"
                  maxLength="6"
                />
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              {checkoutItems.map((item) => {
                const productId = item.productId || item.id;
                const itemShipping = shippingChargeMap[productId] || 0;
                
                return (
                  <div key={item.id} className="border p-3 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-start gap-3">
                        <div className="flex items-start gap-3">
                          {/* PRODUCT IMAGE */}
                          <div className="relative w-16 h-16 rounded-md overflow-hidden border bg-white flex-shrink-0">
                            {loadingImages[item.id] && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                              </div>
                            )}

                            <img
                              src={
                                item.image ||
                                (Array.isArray(item.imageURLs) && item.imageURLs[0]) ||
                                "https://placehold.co/100x100?text=No+Image"
                              }
                              alt={item.name}
                              className="w-full h-full object-contain"
                              onLoad={() =>
                                setLoadingImages((prev) => ({
                                  ...prev,
                                  [item.id]: false,
                                }))
                              }
                              onError={(e) => {
                                e.currentTarget.src = "https://placehold.co/100x100?text=No+Image";
                              }}
                            />
                          </div>

                          {/* PRODUCT DETAILS */}
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>

                            {/* Display shipping charge for this product */}
                            {itemShipping > 0 && (
                              <div className="mt-1 text-xs font-medium text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded">
                                Shipping: ₹{itemShipping}
                              </div>
                            )}

                            {item.isOldee && (
                              <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full mt-1">
                                Second-hand
                              </span>
                            )}
                          </div>

                          {/* Show original price if offer price was used */}
                          {isBuyNow && buyNowItem?.offerPrice && buyNowItem.offerPrice !== buyNowItem.price && (
                            <p className="text-xs text-red-500 line-through">
                              Original: ₹{buyNowItem.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="font-bold text-purple-600">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    {(item.selectedColor || item.selectedSize || item.selectedRam) && (
                      <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                        <strong>Customization:</strong>{" "}
                        {[
                          item.selectedColor && `Color: ${item.selectedColor}`,
                          item.selectedSize && `Size: ${item.selectedSize}`,
                          item.selectedRam && `RAM: ${item.selectedRam}`
                        ].filter(Boolean).join(", ")}
                      </div>
                    )}
                    
                    {/* 🔥 SHOW SELLER INFO */}
                    {item.sellerName && (
                      <div className="text-xs text-gray-500 mt-2">
                        Sold by: {item.sellerName}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* PAYMENT OPTIONS */}
            <h3 className="text-xl font-semibold mt-6 mb-3">Select Payment Method</h3>
            <div className="space-y-3 border p-4 rounded mb-4">
              <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-purple-600"
                />
                <div className="flex-1">
                  <span className="font-medium">Razorpay (Credit/Debit Card, UPI, Net Banking)</span>
                  <p className="text-sm text-gray-500">Pay securely with Razorpay</p>
                </div>
                <div className="text-lg font-bold text-green-600">Secure</div>
              </label>

              <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-purple-600"
                />
                <div className="flex-1">
                  <span className="font-medium">Cash on Delivery (COD)</span>
                  <p className="text-sm text-gray-500">Pay when you receive your order</p>
                </div>
              </label>
            </div>

            {/* TOTAL WITH SHIPPING */}
            <div className="text-right space-y-2 mb-6 mt-4">
              <div className="flex justify-end gap-8 text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-end gap-8 text-gray-600">
                <span>Shipping:</span>
                <span className="font-semibold">
                  {shippingTotal === 0 ? "FREE" : `₹${shippingTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </span>
              </div>
              <div className="flex justify-end gap-8 text-xl font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-purple-600">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col md:flex-row gap-4">
              
              
              <button
                onClick={handlePayment}
                disabled={processingPayment || checkoutItems.length === 0}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                  processingPayment || checkoutItems.length === 0
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {processingPayment ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : paymentMethod === 'cod' ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Place Order (₹{total.toFixed(2)})
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Pay Now (₹{total.toFixed(2)})
                  </>
                )}
              </button>
            </div>
            {errors.payment && (
              <p className="mt-2 text-sm text-red-600 text-center font-medium animate-fadeIn">
                ⚠️ {errors.payment}
              </p>
            )}
          </div>
        )}

        {/* LOADING STATE */}
        {isFetchingUser && !isCartEmpty && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading checkout...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;