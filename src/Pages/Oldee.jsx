import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import OldeeProductDetails from "./OldeeProductDetails";
import UserLogin from "../Pages/UserLogin";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";


const ADMIN_PHONE = "918762978777"; // 🔁 replace with real admin number

const MAX_FILES = 5;
const MAX_MB = 5;
const CUSTOMER_COLLECTION = "customers";
const USERS_COLLECTION_MIRROR = "users";
const COLLECTION = "oldee";
const ADMIN_COLLECTION = "adminUsers";
const CATEGORIES_COLLECTION = "oldee_categories";

const SellProductForm = ({
  user,
  onCancel,
  onSave,
  initialSummaryOpen = false,
  editDoc = null,
}) => {
  const isEdit = !!editDoc;
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: editDoc?.name || "",
    price: editDoc?.price?.toString?.() || "",
    offerPrice:
      editDoc?.offerPrice !== undefined && editDoc?.offerPrice !== null
        ? String(editDoc.offerPrice)
        : "",
    description: editDoc?.description || "",
    contactNumber: editDoc?.contactNumber || editDoc?.seller?.contactNumber || "",
    address: editDoc?.address || editDoc?.seller?.address || "",
    negotiation: editDoc?.negotiation || "flexible",
    category: editDoc?.category || "",
    featured: editDoc?.featured || false,
  });

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState(editDoc?.imageURLs || []);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSummaryPanelOpen, setIsSummaryPanelOpen] = useState(initialSummaryOpen);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [customerDoc, setCustomerDoc] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const sellerId = user?.uid || "TEMP_USER_ID";

  // Fetch categories from Firebase - Simple fetch without orderBy
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(db, CATEGORIES_COLLECTION);
        const categoriesSnapshot = await getDocs(categoriesCollection);
        
        const categoryNames = [];
        
        categoriesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.name && typeof data.name === 'string') {
            categoryNames.push(data.name);
          }
        });
        
        const uniqueSortedNames = [...new Set(categoryNames)].sort();
        setCategories(uniqueSortedNames);
        
        if (!formData.category && uniqueSortedNames.length > 0) {
          setFormData(prev => ({
            ...prev,
            category: uniqueSortedNames[0]
          }));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([
          "Electronics",
          "Furniture",
          "Vehicles",
          "Books",
          "Fashion",
          "Appliances",
          "Others"
        ]);
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    const prefill = async () => {
      if (!user?.uid) return;
      if (formData.contactNumber || formData.address) return;
      try {
        const custRef = doc(db, CUSTOMER_COLLECTION, user.uid);
        let snap = await getDoc(custRef);
        if (!snap.exists()) {
          const mirrorRef = doc(db, USERS_COLLECTION_MIRROR, user.uid);
          const mirrorSnap = await getDoc(mirrorRef);
          if (mirrorSnap.exists()) snap = mirrorSnap;
        }
        if (snap.exists()) {
          const d = snap.data();
          setCustomerDoc(d);
          setFormData((prev) => ({
            ...prev,
            contactNumber: d.contactNumber || prev.contactNumber,
            address: d.address || prev.address,
          }));
        }
      } catch (e) {
        console.error("Prefill error:", e);
      }
    };
    prefill();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === "price" || name === "offerPrice") && Number(value) < 0) return;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const total = existingImages.length + images.length + files.length;
    if (total > MAX_FILES) {
      alert(`Maximum ${MAX_FILES} images allowed`);
      return;
    }
    const tooBig = files.find((f) => f.size > MAX_MB * 1024 * 1024);
    if (tooBig) {
      alert(`Each image must be ≤ ${MAX_MB}MB`);
      return;
    }
    const newOnes = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...newOnes]);
  };

  const removeNewImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));
  const removeExistingImage = (url) =>
    setExistingImages((prev) => prev.filter((u) => u !== url));

  const setAsPrimary = (url, isExisting = true) => {
    if (isExisting) {
      const temp = [...existingImages];
      const index = temp.indexOf(url);
      if (index > -1) {
        const [moved] = temp.splice(index, 1);
        setExistingImages([moved, ...temp]);
      }
    } else {
      const temp = [...images];
      const index = temp.findIndex(img => img.preview === url);
      if (index > -1) {
        const [moved] = temp.splice(index, 1);
        setImages([moved, ...temp]);
      }
    }
  };

  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsFetchingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          setFormData(prev => ({
            ...prev,
            address: data?.display_name
              || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
        } catch (e) {
          setFormData(prev => ({
            ...prev,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
        } finally {
          setIsFetchingLocation(false);
        }
      },
      () => {
        setIsFetchingLocation(false);
        alert("Unable to fetch live location");
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  const saveCustomerDetails = async () => {
    if (!user?.uid) {
      alert("Please log in to save customer details.");
      return;
    }
    setSavingCustomer(true);
    try {
      const base = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || customerDoc?.displayName || "",
        contactNumber: formData.contactNumber || "",
        address: formData.address || "",
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, CUSTOMER_COLLECTION, user.uid), base, { merge: true });
      await setDoc(doc(db, USERS_COLLECTION_MIRROR, user.uid), base, { merge: true });
      setCustomerDoc(base);
      
    } catch (e) {
      console.error("saveCustomerDetails error:", e);
      alert("Failed to save customer details: " + e.message);
    } finally {
      setSavingCustomer(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step < 2) {
      if (!formData.name || !formData.price || !formData.description || !formData.category) {
        alert("Please fill Product Name, Price, Category and Description.");
        return;
      }
      const price = Number(formData.price);
      const offerPrice = formData.offerPrice !== "" ? Number(formData.offerPrice) : null;
      if (offerPrice !== null && offerPrice > price) {
        alert("Offer Price should be less than or equal to Price.");
        return;
      }
      
      setStep((s) => s + 1);
      return;
    }

    if (existingImages.length + images.length === 0) {
      alert("Please keep or upload at least one image.");
      return;
    }
    
    if (!formData.contactNumber || !formData.address) {
      alert("Please fill in Contact Number and Address.");
      return;
    }
    
    if (!user?.uid) {
      alert("Authentication error: Please log in to submit your listing.");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      await saveCustomerDetails();

      const price = Number(formData.price);
      const offerPrice = formData.offerPrice !== "" ? Number(formData.offerPrice) : null;

      const sellerSnapshot = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || customerDoc?.displayName || "",
        contactNumber: formData.contactNumber || customerDoc?.contactNumber || "",
        address: formData.address || customerDoc?.address || "",
        savedAt: serverTimestamp(),
      };

      const newUrls = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const ext = (img.file.name.split(".").pop() || "jpg").toLowerCase();
        const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
        const path = `${COLLECTION}/${user.uid || "anon"}/products/${isEdit ? editDoc.id : "new"}/${Date.now()}_${i}.${safeExt}`;
        const storageRef = ref(storage, path);
        const snap = await uploadBytes(storageRef, img.file);
        const url = await getDownloadURL(snap.ref);
        newUrls.push(url);
        setUploadProgress(Math.round(((i + 1) / images.length) * 100));
      }

      const finalURLs = [...existingImages, ...newUrls];

      if (isEdit) {
        const updatePayload = {
          name: formData.name,
          price: Number(formData.price),
          offerPrice: formData.offerPrice === "" ? null : Number(formData.offerPrice),
          description: formData.description,
          category: formData.category,
          featured: formData.featured,
          contactNumber: formData.contactNumber,
          address: formData.address,
          negotiation: formData.negotiation,
          imageURLs: finalURLs,
          sellerId: user.uid,
          seller: sellerSnapshot,
          approved: editDoc.approved ?? false,
          status: editDoc.status || (editDoc.approved ? "active" : "pending"),
          marketplace: "oldee",
          updatedAt: serverTimestamp(),
        };
        await updateDoc(doc(db, COLLECTION, editDoc.id), updatePayload);
        onSave({ id: editDoc.id, ...updatePayload });
      } else {
        const baseData = {
          ...formData,
          price: Number(formData.price),
          offerPrice: formData.offerPrice === "" ? null : Number(formData.offerPrice),
          category: formData.category,
          featured: formData.featured,
          imageURLs: [],
          isSold: false,
          createdAt: serverTimestamp(),
          sellerId: user.uid,
          seller: sellerSnapshot,
          approved: false,
          status: "pending",
          marketplace: "oldee",
        };
        const colRef = collection(db, COLLECTION);
        const docRef = await addDoc(colRef, baseData);

        await updateDoc(doc(db, COLLECTION, docRef.id), {
          imageURLs: finalURLs,
          publishedAt: serverTimestamp(),
        });

        onSave({ ...baseData, imageURLs: finalURLs, id: docRef.id });
      }
    } catch (error) {
      console.error("Submit listing error:", error);
      alert(`Listing failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  const steps = [
    { number: 1, title: isEdit ? "Edit: Basic" : "Product Info" },
    { number: 2, title: "Address & Images" },
  ];

  if (!user) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-300 w-full max-w-md text-center">
        <h3 className="text-xl font-bold text-red-600 mb-4">🔐 Login Required</h3>
        <p className="text-gray-600 mb-6">Please log in or sign up to access the Sell Product Form.</p>
        <button onClick={onCancel} className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold">
          Close
        </button>
      </div>
    );
  }

  const priceNum = Number(formData.price || 0);
  const offerPriceNum = formData.offerPrice !== "" ? Number(formData.offerPrice) : null;
  const hasDiscount = offerPriceNum !== null && offerPriceNum < priceNum;
  const discountPct = hasDiscount ? Math.round(((priceNum - offerPriceNum) / priceNum) * 100) : 0;

  const allImages = [
    ...existingImages.map(url => ({ url, isExisting: true, isPrimary: url === existingImages[0] })),
    ...images.map(img => ({ url: img.preview, isExisting: false, isPrimary: existingImages.length === 0 && img.preview === images[0]?.preview })),
  ];
  const totalImageCount = existingImages.length + images.length;
  const showPrimaryButton = totalImageCount > 1;

  return (
    <div className="flex relative w-full max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 w-full">
        <div className="mb-1 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isEdit ? "Edit Listing" : "List Your Vintage Item"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="relative w-10 h-10 rounded-full shadow-md transition-all duration-300 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center -mt-2"
            title="Close Upload"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {isEdit && (
          <p className="text-xs text-gray-500 -mt-2 mb-4">
            Editing listing: <span className="font-mono">{editDoc.id}</span>
          </p>
        )}

        <p className="text-sm text-gray-600 -mt-1 mb-6">
          {isEdit ? "Update your listing details" : "Fill in the details to list your item for sale"}
        </p>

        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 -z-10">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: "0%" }}
              animate={{ width: `${((step - 1) / 1) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          {steps.map((s) => (
            <div key={s.number} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s.number ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {s.number}
              </div>
              <span className="text-xs mt-2 text-gray-600">{s.title}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-left text-sm font-semibold text-gray-800 mb-1">Product Name *</label>
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Vintage 90s Band T-shirt"
                      required
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-left text-sm font-semibold text-gray-800 mb-1">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-left text-sm font-semibold text-gray-800 mb-1">Price (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="1999"
                        min="0"
                        step="1"
                        required
                        className="w-full pl-8 pr-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-left text-sm font-semibold text-gray-800 mb-1">
                      Offer Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        name="offerPrice"
                        type="number"
                        value={formData.offerPrice}
                        onChange={handleChange}
                        placeholder={formData.price ? String(formData.price) : "e.g. 1799"}
                        min="0"
                        step="1"
                        className="w-full pl-8 pr-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {hasDiscount && (
                      <p className="mt-1 text-xs text-danger">
                        Discount: ₹{priceNum - offerPriceNum} ({discountPct}%)
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-left text-sm font-semibold text-gray-800 mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Condition, history, size, material, etc."
                    rows="4"
                    required
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2 p-6 rounded-xl border flex flex-col justify-between">
                    <p className="text-sm font-semibold text-gray-800 mb-3">
                      Featured Product?
                    </p>
                    <div className="flex gap-2 mt-auto">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, featured: true })}
                        className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                          formData.featured
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white border border-gray-300 text-gray-600"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, featured: false })}
                        className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                          !formData.featured
                            ? "bg-gray-800 text-white shadow-md"
                            : "bg-white border border-gray-300 text-gray-600"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="w-1/2 p-6 rounded-xl border flex flex-col justify-between">
                    <label className="text-sm font-semibold text-gray-800 mb-3">
                      Contact Number *
                    </label>
                    <input
                      name="contactNumber"
                      type="tel"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      required
                      pattern="^[0-9+ -]*$"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-left text-sm font-semibold text-gray-800 mb-1">Price Negotiation</label>
                  <div className="flex space-x-2">
                    {["fixed", "flexible", "negotiable"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, negotiation: option }))}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          formData.negotiation === option ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="space-y-6">
                <div>
                  <label className="block text-left text-sm font-semibold text-gray-800 mb-1">
                    Images (Max {MAX_FILES})
                  </label>

                  {totalImageCount > 0 && (
                    <div className="mb-4 p-4 border border-dashed border-blue-300 rounded-xl">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Current Images ({totalImageCount}/{MAX_FILES})
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                        {allImages.map((img, idx) => (
                          <motion.div
                            key={img.url + idx}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative rounded-lg overflow-hidden border-2 bg-gray-50"
                            style={{ borderColor: img.isPrimary ? '#3b82f6' : '#e5e7eb' }}
                          >
                            <div className="w-full h-20 flex items-center justify-center bg-gray-50">
                              <img
                                src={img.url}
                                alt={`Product ${idx + 1}`}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>

                            {img.isPrimary ? (
                              <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-br-lg z-10">
                                Primary
                              </div>
                            ) : showPrimaryButton ? (
                              <button
                                type="button"
                                onClick={() => setAsPrimary(img.url, img.isExisting)}
                                className="absolute top-0 left-0 bg-black/50 text-white text-xs font-bold px-2 py-0.5 hover:bg-black/70 transition-colors z-10"
                                title="Set as cover image"
                              >
                                Set Primary
                              </button>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => img.isExisting ? removeExistingImage(img.url) : removeNewImage(
                                images.findIndex(i => i.preview === img.url)
                              )}
                              className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-md hover:bg-red-600 z-20"
                              title="Remove"
                            >
                              ×
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {totalImageCount < MAX_FILES && (
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors duration-200">
                      <input
                        type="file"
                        multiple
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={totalImageCount >= MAX_FILES}
                      />
                      <label htmlFor="image-upload" className="cursor-pointer block">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Click to upload {MAX_FILES - totalImageCount} more images
                        </p>
                        <p className="text-xs text-gray-400">PNG, JPG, WEBP up to {MAX_MB}MB each</p>
                      </label>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-left text-sm font-semibold text-gray-800">Address *</label>
                      <button
                        type="button"
                        onClick={handleGetLiveLocation}
                        disabled={isFetchingLocation}
                        className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800 disabled:opacity-50"
                      >
                        <svg 
                          className={`w-3.5 h-3.5 ${isFetchingLocation ? 'animate-spin' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {isFetchingLocation ? "Fetching..." : "Use Live Location"}
                      </button>
                    </div>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your full address for delivery or click 'Use Live Location'"
                      rows="3"
                      required
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {isSubmitting && uploadProgress !== null && (
                  <div className="mt-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-2 bg-blue-600 transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Uploading images… {uploadProgress}%</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-8 space-x-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-6 py-3 text-sm border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center"
                disabled={isSubmitting}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-sm border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all duration-300 shadow-md flex items-center justify-center min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEdit ? "Updating..." : "Listing..."}
                </>
              ) : step === 2 ? (isEdit ? "Update Listing" : "Submit Listing") : "Next Step"}
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-4">Step {step} of 2</p>
        </form>
      </div>
    </div>
  );
};

const ProductsViewer = ({ user, isAdmin, onClose, onEdit, isUserViewer = false }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(db, CATEGORIES_COLLECTION);
        const categoriesSnapshot = await getDocs(categoriesCollection);
        
        const categoryNames = [];
        
        categoriesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.name && typeof data.name === 'string') {
            categoryNames.push(data.name);
          }
        });
        
        const uniqueSortedNames = [...new Set(categoryNames)].sort();
        setCategories(uniqueSortedNames);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories(["Electronics", "Furniture", "Vehicles", "Books", "Fashion", "Appliances", "Others"]);
      }
    };
    
    fetchCategories();
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      let qRef;
      
      if (isUserViewer) {
        qRef = query(
          collection(db, COLLECTION),
          where("sellerId", "==", user.uid)
        );
      } else if (isAdmin) {
        qRef = query(collection(db, COLLECTION));
      } else {
        qRef = query(
          collection(db, COLLECTION),
          where("sellerId", "==", user.uid)
        );
      }
      
      const snap = await getDocs(qRef);
      let arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      
      arr.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setItems(arr);
    } catch (e) {
      console.error("Viewer load error:", e);
      setError(e.message);
      alert("Error loading products: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user, isAdmin, isUserViewer]);

  const approveItem = async (id, approved) => {
    try {
      await updateDoc(doc(db, COLLECTION, id), {
        approved,
        status: approved ? "active" : "pending",
        updatedAt: serverTimestamp(),
      });
      setItems((prev) => prev.map((it) => 
        (it.id === id ? { ...it, approved, status: approved ? "active" : "pending" } : it)
      ));
    } catch (e) {
      alert("Failed to update approval: " + e.message);
    }
  };

  const removeItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      setItems((prev) => prev.filter((x) => x.id !== id));
      alert("Listing deleted successfully!");
    } catch (e) {
      alert("Failed to delete: " + e.message);
    }
  };
const handleContactAdmin = () => {
  const message = encodeURIComponent(
    "Hello Admin, I want to edit product details. Please assist."
  );

  window.open(`https://wa.me/${ADMIN_PHONE}?text=${message}`, "_blank");
};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 p-4 md:p-8 overflow-auto"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold">
              {isUserViewer ? "My Products" : "All Products (Admin View)"}
            </h3>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={load} 
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button 
              onClick={onClose} 
              className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Products</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!user ? (
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-300 w-full max-w-md mx-auto text-center mt-20">
            <h3 className="text-xl font-bold text-red-600 mb-4">🔐 Login Required</h3>
            <p className="text-gray-600 mb-6">Please log in to view your product listings.</p>
            <button onClick={onClose} className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold">
              Close Viewer
            </button>
          </div>
        ) : loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              {isUserViewer ? "No Products Found" : "No Products Available"}
            </h4>
            <p className="text-gray-500 max-w-md mx-auto">
              {isUserViewer 
                ? "You haven't uploaded any products yet. Click the 'Upload' button to list your first item!"
                : "There are no products in the database yet."
              }
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((p) => (
                <div
                  key={p.id}
                  className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {Array.isArray(p.imageURLs) && p.imageURLs[0] && (
                    <div className="relative h-48 mb-4 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                      <img
                        src={p.imageURLs[0]}
                        alt={p.name}
                        className="max-w-full max-h-full object-contain"
                      />

                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {p.featured && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                      {p.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {p.category || "Uncategorized"}
                      </span>
                    </div>
                    <div className="text-sm mt-2">
                      {p.offerPrice != null ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-red-600">
                            ₹{p.offerPrice}
                          </span>
                          <span className="line-through text-gray-400 text-xs">
                            ₹{p.price}
                          </span>
                          <span className="text-xs bg-emerald-50 text-red-600 px-1.5 py-0.5 rounded">
                            {Math.round(
                              ((p.price - p.offerPrice) / p.price) * 100
                            )}
                            % OFF
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-gray-900">
                          ₹{p.price}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {p.description}
                    </p>
                    
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        p.negotiation === "fixed"
                          ? "bg-blue-100 text-blue-700"
                          : p.negotiation === "flexible"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {p.negotiation}
                    </span>
                    {!isUserViewer && p.seller && (
                      <span className="text-xs text-gray-500 truncate ml-2">
                        by{" "}
                        {p.seller.displayName ||
                          p.seller.email?.split("@")[0] ||
                          "User"}
                      </span>
                      
                    )}
                    {/* 📞 Edit – Contact Admin (WhatsApp) */}
{isUserViewer && (
  <div className="mt-0">
    <button
      onClick={() => handleContactAdmin(p)}
      className="w-full flex items-center justify-center gap-2 p-4 text-xs font-semibold
        rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
    >
    
      Edit – Contact Admin
    </button>
  </div>
)}

                  </div>

                
                  {isAdmin && !isUserViewer && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => approveItem(p.id, !p.approved)}
                        className={`w-full py-1.5 text-xs rounded-lg font-medium ${
                          p.approved
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {p.approved ? "Unapprove" : "Approve"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Oldee = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const navigate = useNavigate(); 
  const [showUpload, setShowUpload] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [approvedItems, setApprovedItems] = useState([]);
  const [loadingApproved, setLoadingApproved] = useState(true);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [isUserViewer, setIsUserViewer] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [searchQuery, setSearchQuery] = useState("");

  const location = useLocation();
  
useEffect(() => {
  if (location.state?.resetFilters) {
    setSelectedCategory("All Products");
    setSearchQuery("");
  }
}, [location.state]);
  const fetchAdminUsers = async () => {
    try {
      setLoadingAdmins(true);
      const q = query(collection(db, ADMIN_COLLECTION), where("isAdmin", "==", true));
      const snapshot = await getDocs(q);
      const admins = [];
      snapshot.forEach(doc => {
        admins.push({
          id: doc.id,
          uid: doc.data().uid,
          email: doc.data().email,
          ...doc.data()
        });
      });
      setAdminUsers(admins);
    } catch (error) {
      console.error("Error fetching admin users:", error);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesCollection = collection(db, CATEGORIES_COLLECTION);
      const categoriesSnapshot = await getDocs(categoriesCollection);
      
      const fetchedCategories = ["All Products"];
      const categoryNames = [];
      
      categoriesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.name && typeof data.name === 'string') {
          categoryNames.push(data.name);
        }
      });
      
      const uniqueSortedNames = [...new Set(categoryNames)].sort();
      setCategories(["All Products", ...uniqueSortedNames]);
      
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([
        "All Products",
        "Electronics",
        "Furniture",
        "Vehicles",
        "Books",
        "Fashion",
        "Appliances",
        "Others"
      ]);
    }
  };

  const isAdmin = useMemo(() => {
    if (!currentUser?.uid || loadingAdmins) return false;
    
    const isAdminByUid = adminUsers.some(admin => admin.uid === currentUser.uid);
    const isAdminByEmail = adminUsers.some(admin => admin.email === currentUser.email);
    
    return isAdminByUid || isAdminByEmail;
  }, [currentUser, adminUsers, loadingAdmins]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u || null);
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);
  
  useEffect(() => {
    fetchAdminUsers();
    fetchCategories();
  }, []);

  const loadApproved = async () => {
    setLoadingApproved(true);
    try {
      const qRef = query(
        collection(db, COLLECTION),
        where("status", "==", "active")
      );
      const snap = await getDocs(qRef);
      let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      
      items.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      items = items.slice(0, 30);
      
      setApprovedItems(items);
    } catch (e) {
      console.error("approved load error:", e);
      setApprovedItems([]);
    } finally {
      setLoadingApproved(false);
    }
  };

  useEffect(() => {
    loadApproved();
  }, [currentUser]);

  const filteredProducts = useMemo(() => {
    let filtered = approvedItems;
    
    if (selectedCategory !== "All Products") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [approvedItems, selectedCategory, searchQuery]);

const openCreate = () => {
  if (!currentUser) {
    navigate("/login"); // 🔥 FULL PAGE LOGIN
    return;
  }

  setEditingDoc(null);
  setSelectedProduct(null);
  setShowUpload(true);
};

  const openUserViewer = () => {
    if (!currentUser) {
      alert("Please login to view your listings");
      return;
    }
    setShowUpload(false);
    setEditingDoc(null);
    setSelectedProduct(null);
    setIsUserViewer(true);
    setShowViewer(true);
  };

  const openAdminViewer = () => {
    setIsUserViewer(false);
    setSelectedProduct(null);
    setShowViewer(true);
  };

  const handleSave = () => {
    setShowUpload(false);
    setEditingDoc(null);
    loadApproved();
  };

  const handleEditFromViewer = (docData) => {
    setEditingDoc(docData);
    setShowViewer(false);
    setShowUpload(true);
  };

  const viewProductDetails = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  const clearFilters = () => {
    setSelectedCategory("All Products");
    setSearchQuery("");
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating…</p>
        </div>
      </div>
    );
  }

  if (selectedProduct) {
    return (
      <OldeeProductDetails
        product={selectedProduct}
        onBack={closeProductDetails}
        onEdit={
          currentUser?.uid === selectedProduct.sellerId || isAdmin
            ? (p) => {
                closeProductDetails();
                setEditingDoc(p);
                setShowUpload(true);
              }
            : null
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
     <div className="bg-white border-b shadow-sm">
  <div className="w-full px-6 py-3">
    <div className="flex flex-wrap items-center gap-3">

     
      {/* 📂 Category Buttons */}
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setSelectedCategory(category)}
          className={`h-10 px-4 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === category
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  </div>
</div>


      <div className="w-full px-8 py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <h1 className=" "> </h1>
          <div className="flex flex-col gap-3 w-full lg:w-auto lg:flex-row lg:items-center">


            {currentUser ? (
              <>
                {isAdmin && (
                  <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Admin
                  </div>
                )}
                
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
{/* 🔍 Search Box */}
<div className="relative w-full sm:w-64">
  <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search products…"
    className="h-10 w-full px-4 pr-10 rounded-lg border border-gray-300 text-sm
               focus:ring-3 focus:ring-blue-500 focus:border-transparent"
  />

  {searchQuery ? (
    /* ❌ Clear button */
    <button
      type="button"
      onClick={() => setSearchQuery("")}
      className="absolute right-3 top-1/2 -translate-y-1/2
                 text-gray-400 hover:text-gray-700 text-lg font-bold"
      aria-label="Clear search"
    >
      ×
    </button>
  ) : (
    /* 🔍 Search icon */
    <svg
      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-4.35-4.35m1.85-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  )}
</div>


                  <button
                    onClick={openUserViewer}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium text-sm transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    My Listings
                  </button>
                  
                  <button
                    onClick={openCreate}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Upload
                  </button>
                  
                  {isAdmin && (
                    <button
                      onClick={openAdminViewer}
                      className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      All Products
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={openCreate}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload
                </button>
              </div>
            )}
          </div>
        </div>

        {loadingApproved ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading products…</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery.trim() !== "" 
                ? `No products found for "${searchQuery}"`
                : selectedCategory !== "All Products"
                ? `No products found in ${selectedCategory} category`
                : "Be the first to list a vintage item!"
              }
            </p>
            {(selectedCategory !== "All Products" || searchQuery.trim() !== "") && (
              <button
                onClick={clearFilters}
                className="px-6 py-2 rounded-lg bg-gray-800 hover:bg-black text-white font-medium"
              >
                Clear Filters
              </button>
            )}
            {currentUser && approvedItems.length === 0 && (
              <button
                onClick={openCreate}
                className="ml-4 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                List Your First Item
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => viewProductDetails(p)}
                >
                  <div className="relative h-56 overflow-hidden">
                    {Array.isArray(p.imageURLs) && p.imageURLs[0] && (
                      <img
                        src={p.imageURLs[0]}
                        alt={p.name}
                        className="w-full h-full object-contain mx-auto"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {p.featured && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-bold">
                          FEATURED
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{p.name}</h3>
                    <div className="mb-2">
                      {p.offerPrice != null ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-red-600">₹{p.offerPrice}</span>
                          <span className="line-through text-gray-400 text-sm">₹{p.price}</span>
                          <span className="text-xs bg-emerald-50 text-red-600 px-1.5 py-0.5 rounded">
                            {Math.round(((p.price - p.offerPrice) / p.price) * 100)}% OFF
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-lg text-gray-900">₹{p.price}</span>
                      )}
                    </div>
                   <p className="text-sm text-gray-600 line-clamp-2 mb-3 min-h-[40px]">
  {p.description}
</p>

                    <div className="flex items-center justify-between text-xs font-bold text-gray">
                      <span>
                        {p.createdAt?.toDate?.() 
                          ? new Date(p.createdAt.toDate()).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'Recently'}
                      </span>
                      <span>{p.seller?.displayName?.split(' ')[0] || 'Seller'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
  {showUpload && currentUser && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 overflow-auto p-4 md:p-8"
    >
      <SellProductForm
        user={currentUser}
        onCancel={() => {
          setShowUpload(false);
          setEditingDoc(null);
        }}
        onSave={handleSave}
        initialSummaryOpen={!!editingDoc}
        editDoc={editingDoc}
      />
    </motion.div>
  )}
</AnimatePresence>


      <AnimatePresence>
        {showViewer && (
          <ProductsViewer
            user={currentUser}
            isAdmin={isAdmin}
            onClose={() => setShowViewer(false)}
            onEdit={handleEditFromViewer}
            isUserViewer={isUserViewer}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Oldee;