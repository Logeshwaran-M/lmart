import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import logo from "../assets/newadd.png";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  setDoc
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import { useAuth } from "../context/AuthProvaider";


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [selectedTotal, setSelectedTotal] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const { user, logout } = useAuth();
  const [uploadProgress, setUploadProgress] = useState({}); // Track upload progress
  const [isUploading, setIsUploading] = useState(false); // Track overall upload status

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const {
    getCartItemsCount,
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleSelect,
    getSelectedItems,
    notification, // ✅ MOVE HERE
  } = useCart();

  const cartItemsCount = getCartItemsCount();

  // Search Auto Complete States
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Firebase Storage instance
  const storage = getStorage();

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Fetch products for search
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ref = collection(db, "products");
        const snap = await getDocs(ref);

        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAllProducts(list);
      } catch (err) {
        console.log("Error fetching products:", err);
      }
    };

    fetchData();
  }, []);

  // Live suggestions
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const q = query.toLowerCase();

    const filtered = allProducts.filter((p) =>
      p.searchKeywords?.some((k) => k.toLowerCase().includes(q)) ||
      p.name?.toLowerCase().includes(q) ||
      p.productTag?.toLowerCase().includes(q)
    );

    setSuggestions(filtered.slice(0, 6)); // show max 6
    setShowSuggestions(filtered.length > 0);
  }, [query, allProducts]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if user is logged in


  // Calculate selected total whenever items change or cart opens
  const getSelectedItemsMemo = useCallback(getSelectedItems, [getSelectedItems]);

  useEffect(() => {
    if (isCartOpen) {
      const selectedItems = getSelectedItemsMemo();
      const selectedTotalAmount = selectedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      setSelectedTotal(selectedTotalAmount);
      setSelectedCount(selectedItems.length);
    }
  }, [items, isCartOpen, getSelectedItemsMemo]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
        localStorage.setItem("shouldOpenUserDropdown", "false");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  // Fixed cart icon click - only opens sidebar
  const handleCartIconClick = () => {
    setIsCartOpen(true);
    setIsUserDropdownOpen(false);
    setShowSuggestions(false);
    scrollToTop();
  };

  // User icon click handler
  const handleUserIconClick = () => {
    if (user) {
      const newState = !isUserDropdownOpen;
      setIsUserDropdownOpen(newState);
      localStorage.setItem("shouldOpenUserDropdown", newState.toString());
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();        // Firebase signOut
    setIsUserDropdownOpen(false);
    navigate("/", { replace: true });
  };


  // Handle mobile logout
  const handleMobileLogout = () => {
    handleLogout();
    setIsMenuOpen(false);
  };

  // Checkout from sidebar
  const handleSidebarCheckout = () => {
    const selected = getSelectedItemsMemo();

    if (selected.length === 0) {
      alert("Please select at least one item to checkout!");
      return;
    }

    sessionStorage.setItem("selectedCartItems", JSON.stringify(selected));
    setIsCartOpen(false);
    navigate("/cart");
  };

  // Handle quantity updates in sidebar
  const handleSidebarQuantityDecrease = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item.lineItemKey || item.id, item.quantity - 1);
    }
  };

  const handleSidebarQuantityIncrease = (item) => {
    if (item.quantity >= item.stock) {

      return;
    }
    updateQuantity(item.lineItemKey || item.id, item.quantity + 1);
  };

  // Handle item removal from sidebar
  const handleSidebarRemoveItem = (itemId, itemName) => {
    removeFromCart(itemId);
  };

  // --- SEARCH HANDLER ---
  const handleSearch = (searchQuery) => {
    if (searchQuery.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(searchQuery.trim())}`);
      setQuery("");
      setShowSuggestions(false);
      setIsMenuOpen(false);
      scrollToTop();
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleIconSearch = () => {
    if (query.trim()) {
      handleSearch(query);
    }
  };

  const handleSelectSuggestion = (product) => {
    navigate(`/product/${product.id}`, {
      state: { product }
    });
    setQuery("");
    setShowSuggestions(false);
    setIsMenuOpen(false);
    scrollToTop();
  };
  // --- END SEARCH HANDLER ---

  // --- WISHLIST HANDLER ---
  const handleWishlistClick = () => {
    if (user) {
      // User is logged in - go to wishlist page
      navigate("/wishlist");
      setIsMenuOpen(false);
      scrollToTop();
    } else {
      // User is not logged in - go to login page
      navigate("/login");
      setIsMenuOpen(false);
      scrollToTop();
    }
  };
  // --- END WISHLIST HANDLER ---

  // --- FILE UPLOAD HANDLER ---
  // --- FILE UPLOAD HANDLER ---
  // --- FILE UPLOAD HANDLER ---
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // FIRST: Check if user is logged in via Firebase Auth
    const auth = getAuth();
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      alert("Please log in to upload files.");
      return;
    }

    // SECOND: Get user details from Firebase Auth (NOT localStorage)
    const userId = firebaseUser.uid; // This is the Firebase UID
    const userName = firebaseUser.displayName || "Unknown User";
    const userEmail = firebaseUser.email || "unknown@example.com";
    const userPhone = firebaseUser.phoneNumber || "Not provided";
    const customerId = userId; // Use Firebase UID as customerId

    console.log("✅ Firebase Auth User Info:", {
      userId,
      userName,
      userEmail,
      userPhone,
      customerId
    });

    // THIRD: Also check localStorage as backup
    const localStorageUser = localStorage.getItem("user");
    if (localStorageUser) {
      try {
        const parsedUser = JSON.parse(localStorageUser);
        console.log("📝 LocalStorage User:", parsedUser);
      } catch (error) {
        console.log("❌ Error parsing localStorage user:", error);
      }
    }

    console.log("📤 Uploading files for:", userName, "Email:", userEmail, "ID:", customerId);

    // Start uploading
    setIsUploading(true);
    setUploadProgress({});

    try {
      // 1. Create a new document in uploadfile collection
      const uploadfileCollection = collection(db, "uploadfile");
      const newUploadRef = doc(uploadfileCollection);
      const uploadId = newUploadRef.id;

      console.log("📝 Created upload document with ID:", uploadId);

      // 2. Initialize upload data with Firebase Auth user info
      const uploadData = {
        // Customer Information
        customerId: customerId,
        customerName: userName,
        customerEmail: userEmail,
        customerPhone: userPhone,
        customerUserId: userId,

        // 🔥 ADD THIS LINE
        userUploadFile: true,   // 👈 this is the key you want

        // Upload Information
        uploadId: uploadId,
        uploadDate: new Date().toISOString(),
        uploadTimestamp: Date.now(),

        files: [],
        totalFiles: files.length,
        fileTypes: [...new Set(files.map(f => f.type))],
        totalSize: files.reduce((sum, file) => sum + file.size, 0),

        status: "uploading",
        createdAt: new Date().toISOString(),
        createdBy: userId,
      };


      console.log("📊 Upload data to save:", uploadData);

      // 3. Save initial document to Firestore
      await setDoc(newUploadRef, uploadData);
      console.log("✅ Initial upload document saved to Firestore");

      // 4. Upload each file to Firebase Storage
      const uploadedFilesData = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const timestamp = Date.now();
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueFileName = `${timestamp}_${Math.random().toString(36).substr(2, 9)}_${safeFileName}`;
        const storagePath = `uploadfile/${uploadId}/${uniqueFileName}`;

        console.log(`📄 Uploading file ${i + 1}/${files.length}:`, file.name);

        // Create storage reference
        const storageRef = ref(storage, storagePath);

        // Create file data object
        const fileData = {
          fileId: `file_${timestamp}_${i}`,
          originalName: file.name,
          fileName: uniqueFileName,
          fileType: file.type,
          fileSize: file.size,
          storagePath: storagePath,
          status: "uploading",
          uploadedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };

        // Upload file to Firebase Storage
        await new Promise((resolve, reject) => {
          const uploadTask = uploadBytesResumable(storageRef, file);

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(prev => ({
                ...prev,
                [file.name]: progress
              }));
              console.log(`📤 Uploading ${file.name}: ${progress.toFixed(2)}%`);
            },
            (error) => {
              console.error(`❌ Error uploading ${file.name}:`, error);
              fileData.status = "failed";
              fileData.error = error.message;
              reject(error);
            },
            async () => {
              try {
                // Get download URL
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                fileData.downloadURL = downloadURL;
                fileData.status = "uploaded";
                fileData.lastUpdated = new Date().toISOString();
                console.log(`✅ File uploaded: ${file.name}`);

                uploadedFilesData.push(fileData);
                resolve();
              } catch (urlError) {
                console.error(`❌ Error getting download URL:`, urlError);
                fileData.status = "failed";
                fileData.error = "Failed to get download URL";
                reject(urlError);
              }
            }
          );
        });
      }

      console.log("✅ All files uploaded to storage:", uploadedFilesData.length);

      // 5. Update Firestore document with uploaded files data
      await updateDoc(newUploadRef, {
        files: uploadedFilesData,
        status: "uploaded",
        updatedAt: new Date().toISOString(),
        serverUploaded: true,
        serverUploadedAt: new Date().toISOString()
      });

      console.log("✅ Firestore document updated with file data");

      // SUCCESS MESSAGE


      // Reset states
      setUploadProgress({});
      setIsUploading(false);

      // 6. Also update user's upload history
      try {
        const userUploadRef = doc(db, "users", userId, "orders", "uploadfiles");
        const userUploadDoc = await getDoc(userUploadRef);

        if (userUploadDoc.exists()) {
          const existingData = userUploadDoc.data();
          const existingFiles = existingData.files || [];
          const allFiles = [...existingFiles, ...uploadedFilesData];

          await updateDoc(userUploadRef, {
            files: allFiles,
            totalFiles: allFiles.length,
            lastUpdated: new Date().toISOString(),
            userEmail: userEmail,
            userName: userName
          });
        } else {
          await setDoc(userUploadRef, {
            files: uploadedFilesData,
            totalFiles: uploadedFilesData.length,
            createdAt: new Date().toISOString(),
            userId: userId,
            userName: userName,
            userEmail: userEmail,
            userPhone: userPhone
          });
        }
        console.log("✅ User's upload history updated");
      } catch (userUpdateError) {
        console.log("⚠️ User update skipped:", userUpdateError.message);
      }

    } catch (error) {
      console.error("❌ Error in file upload process:", error);
      alert(`❌ Error uploading files: ${error.message}`);
      setIsUploading(false);
      setUploadProgress({});
    }

    // Reset file input
    e.target.value = "";
  };
  // --- END FILE UPLOAD HANDLER ---
  // --- END FILE UPLOAD HANDLER ---
  // --- END FILE UPLOAD HANDLER ---

  // --- FILE VIEWING FUNCTIONS ---
  const handleViewUploads = () => {
    // Navigate to uploads page or open modal
    navigate("/my-uploads");
    scrollToTop();
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Progress bar component for uploads
  // Progress bar component for uploads
  const UploadProgress = () => {
    if (!isUploading) return null;

    const totalFiles = Object.keys(uploadProgress).length;
    const completedFiles = Object.values(uploadProgress).filter(p => p === 100).length;
    const overallProgress = totalFiles > 0
      ? (Object.values(uploadProgress).reduce((a, b) => a + b, 0) / totalFiles)
      : 0;

    return (
      <div className="fixed top-20 right-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-sm border border-gray-300">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-800">Uploading Files...</h3>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {completedFiles}/{totalFiles}
          </span>
        </div>


        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Overall Progress</span>
            <span className="font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        {totalFiles > 0 && (
          <div className="max-h-48 overflow-y-auto border-t pt-2 mt-2">
            <p className="text-xs text-gray-500 mb-2 font-medium">File Details:</p>
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="truncate max-w-[180px]" title={fileName}>
                    {fileName}
                  </span>
                  <span className={`font-medium ${progress === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
          {completedFiles === totalFiles && totalFiles > 0 ? (
            <span className="text-green-600 font-medium">✓ Upload completed!</span>
          ) : (
            `Uploading... ${completedFiles} of ${totalFiles} files completed`
          )}
        </div>
      </div>
    );
  };
  return (
    <div className="bg-white sticky top-0 z-40 shadow-md">
      {/* Upload Progress Overlay */}
      <UploadProgress />
      {/* Toast Notification */}
      {notification?.show && (
        <div className="fixed top-24 right-5 z-[9999] animate-fade-in">
          <div
            className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-white
        ${notification.type === "error" ? "bg-red-600" : "bg-green-600"}
      `}
          >
            {notification.message}
          </div>
        </div>
      )}


      {/* Top Header - HEIGHT REDUCED */}
      <div className=" bg-gradient-to-r from-blue-900 to-purple-600 text-white">
        <div className="flex justify-between items-center">

          {/* Logo and Brand */}
          <div className="relative h-14 flex items-center transform transition-transform duration-300 hover:scale-110">
            <img
              src={logo}
              alt="E-Mart Logo"
              className="
        w-32 sm:w-35
        mt-2
        ml-8
        h-auto
        object-contain
        transition-all duration-300 
        hover:brightness-110 hover:drop-shadow-lg 
        cursor-pointer
      "
              onClick={() => {
                navigate("/");
                scrollToTop();
              }}
            />
          </div>
          {/* Right icons */}
          <div className="flex items-center space-x-4 pr-4">
            {/* Contact and Icons - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Home Button - UPDATED */}
              <button
                onClick={(e) => {
                  // If already on home page, scroll to top
                  if (location.pathname === "/") {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    navigate("/");
                  }
                }}
                className="w-7 h-7 border border-purple-300 rounded-full flex items-center justify-center bg-white hover:bg-gray-50 transition duration-200"
              >
                <svg
                  className="w-3.5 h-3.5 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </button>

              {/* Wishlist Icon - Desktop - UPDATED */}
              <button
                onClick={handleWishlistClick}
                className="w-7 h-7 border border-purple-300 rounded-full flex items-center justify-center bg-white hover:bg-gray-50 transition duration-200"
              >
                <svg
                  className="w-3.5 h-3.5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>

              {/* Login Button - Shows when user is NOT logged in */}
              {!user && (
                <Link
                  to="/login"
                  onClick={scrollToTop}
                  className="w-7 h-7 border border-purple-300 rounded-full flex items-center justify-center bg-white hover:bg-gray-50 transition duration-200"
                >
                  <svg
                    className="w-3.5 h-3.5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </Link>
              )}

              {/* User Icon with Dropdown - Shows ONLY when user is logged in */}
              {user && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={handleUserIconClick}
                    className="w-7 h-7 border border-purple-300 rounded-full flex items-center justify-center bg-white hover:bg-gray-50 transition duration-200 focus:outline-none"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}

                  </button>

                  {/* User Dropdown Menu */}
                  {isUserDropdownOpen && user && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
                      {/* Header Section */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">Account</h3>
                        <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                        <p className="text-gray-600 text-xs">{user.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            navigate("/profile");
                          }}
                          className="w-full px-6 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center text-base font-medium border-b border-gray-100"
                        >
                          👤 Profile Settings
                        </button>

                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            localStorage.setItem("shouldOpenUserDropdown", "false");
                            setTimeout(() => {
                              navigate("/my-orders");
                              scrollToTop();
                            }, 100);
                          }}
                          className="w-full px-6 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center text-base font-medium border-b border-gray-100"
                        >
                          📦 My Orders
                        </button>

                        {/* My Uploads Button - Desktop */}
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            handleViewUploads();
                          }}
                          className="w-full px-6 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center text-base font-medium border-b border-gray-100"
                        >
                          📁 My Uploads
                        </button>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-200">
                        <button
                          onClick={handleLogout}
                          className="w-full px-6 py-3 text-left text-red-600 hover:bg-red-50 flex items-center text-base font-medium"
                        >
                          🚪 Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cart Icon */}
              <button
                onClick={handleCartIconClick}
                className="relative w-7 h-7 border border-purple-300 rounded-full flex items-center justify-center bg-white hover:bg-gray-50 transition duration-200"
              >
                <svg
                  className="w-3.5 h-3.5 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {cartItemsCount > 99 ? "99+" : cartItemsCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Contact - Visible only on mobile */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Mobile Home Icon - UPDATED */}
              <button
                onClick={(e) => {
                  // If already on home page, scroll to top
                  if (location.pathname === "/") {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    navigate("/");
                    scrollToTop();
                  }
                }}
                className="w-7 h-7 border border-purple-300 rounded-full flex items-center justify-center bg-white hover:bg-gray-50 transition duration-200"
              >
                <svg
                  className="w-3.5 h-3.5 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </button>

              {/* Mobile Wishlist Icon - UPDATED */}
              <button
                onClick={handleWishlistClick}
                className="w-7 h-7 border border-purple-300 rounded-full flex items-center justify-center bg-white hover:bg-gray-50 transition duration-200"
              >
                <svg
                  className="w-3.5 h-3.5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>

              {/* Mobile Login/User Icon */}
              {!user ? (
                <Link
                  to="/login"
                  onClick={scrollToTop}
                  className="w-7 h-7 border border-purple-300 rounded-full flex items-center justify-center bg-white hover:bg-gray-50 transition duration-200"
                >
                  <svg
                    className="w-3.5 h-3.5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </Link>
              ) : (
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="w-7 h-7 border border-purple-300 rounded-full flex items-center justify-center bg-white hover:bg-gray-50 transition duration-200"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}

                </button>
              )}

              {/* Mobile Cart Icon */}
              <button
                onClick={handleCartIconClick}
                className="relative w-7 h-7 border border-purple-300 rounded-full flex items-center justify-center bg-white hover:bg-gray-50 transition duration-200"
              >
                <svg
                  className="w-3.5 h-3.5 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {cartItemsCount > 99 ? "99+" : cartItemsCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="w-7 h-7 border border-purple-300 rounded-full flex items-center justify-center bg-white hover:bg-gray-50 transition duration-200"
              >
                <svg
                  className="w-3.5 h-3.5 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar - HEIGHT REDUCED */}
      <div className="border-t border-gray-200">
        <div className="container-responsive">
          <div className="flex items-center justify-between py-2">
            {/* Navigation Links - Hidden on mobile, visible on desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              {/* Home Link - UPDATED */}
              <Link
                to="/"
                onClick={scrollToTop}
                className={`text-blue-700 hover:text-purple-500 font-medium relative text-m ${location.pathname === "/" ? "active-nav-item" : ""
                  }`}
              >
                Home
                {location.pathname === "/" && (
                  <span className="absolute bottom-[-6px] left-0 w-full h-[2px] bg-purple-500 rounded-full"></span>
                )}
              </Link>
              <Link
                to="/E-Store"
                state={{ resetFilters: true }}   // ✅ ADD THIS
                onClick={scrollToTop}
                className={`text-blue-700 hover:text-purple-500 font-medium relative text-m ${location.pathname === "/e-store" ? "active-nav-item" : ""
                  }`}
              >
                E-Store
                {location.pathname === "/E-Store" && (
                  <span className="absolute bottom-[-6px] left-0 w-full h-[2px] bg-purple-500 rounded-full"></span>
                )}
              </Link>

              <Link
                to="/Local-Market"
                state={{ resetFilters: true }}
                onClick={scrollToTop}
                className={`text-blue-700 hover:text-purple-500 font-medium relative text-m ${location.pathname === "/local-market" ? "active-nav-item" : ""
                  }`}
              >
                Local Market
                {location.pathname === "/Local-Market" && (
                  <span className="absolute bottom-[-6px] left-0 w-full h-[2px] bg-purple-500 rounded-full"></span>
                )}
              </Link>
              <Link
                to="/Printing"
                state={{ resetFilters: true }}   // ✅ ADD
                onClick={scrollToTop}
                className={`text-blue-700 hover:text-purple-500 font-medium relative text-m ${location.pathname === "/printing" ? "active-nav-item" : ""
                  }`}
              >
                Printing

                {location.pathname === "/Printing" && (
                  <span className="absolute bottom-[-6px] left-0 w-full h-[2px] bg-purple-500 rounded-full"></span>
                )}
              </Link>
              <Link
                to="/Market-News"
                state={{ resetFilters: true }}   // ✅ ADD THIS
                onClick={scrollToTop}
                className={`text-blue-700 hover:text-purple-500 font-medium relative text-m ${location.pathname === "/market-news" ? "active-nav-item" : ""
                  }`}
              >
                Market News

                {location.pathname === "/Market-News" && (
                  <span className="absolute bottom-[-6px] left-0 w-full h-[2px] bg-purple-500 rounded-full"></span>
                )}
              </Link>
              {/* Oldee Link */}
              <Link
                to="/Oldee"
                state={{ resetFilters: true }}   // ✅ ADD THIS LINE
                onClick={scrollToTop}
                className={`text-blue-700 hover:text-purple-500 font-medium relative text-m ${location.pathname === "/oldee" ? "active-nav-item" : ""
                  }`}
              >
                Oldee
                {location.pathname === "/Oldee" && (
                  <span className="absolute bottom-[-6px] left-0 w-full h-[2px] bg-purple-500 rounded-full"></span>
                )}
              </Link>

            </nav>

            {/* Search and Actions - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Search Bar Component with Auto Suggestions - MODIFIED */}
              {/* Navbar Search – Oldee Style UI */}
              <div className="relative w-64 max-w-lg" ref={searchRef}>
                <form
                  onSubmit={handleSearchSubmit}
                  className="
    relative
    flex items-center
    h-10
    px-4
    bg-white
    border border-gray-300
    rounded-lg
    transition
    focus-within:ring-2
    focus-within:ring-blue-500
    focus-within:border-transparent
  "
                >




                  <input
                    type="text"
                    value={query}
                    placeholder="Search products..."
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.trim() && setShowSuggestions(true)}
                    className="
    flex-1
    bg-transparent
    outline-none
    focus:outline-none
    focus:ring-0
    text-sm
    placeholder-gray-400
  "
                  />


                  <button
                    type="button"
                    onClick={() => {
                      if (query) {
                        setQuery("");
                        setShowSuggestions(false);
                      } else {
                        handleIconSearch();
                      }
                    }}
                    className="
    text-gray-400
    
    transition
    outline-none
    focus:outline-none
    focus:ring-0
    active:outline-none
  "
                  >

                    {query ? (
                      // ❌ Clear icon
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    ) : (
                      // 🔍 Search icon
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
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    )}
                  </button>

                </form>

                {/* Suggestions (unchanged) */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-12 left-0 w-full bg-white shadow-lg rounded-lg border z-50 overflow-hidden">
                    {suggestions.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                        onClick={() => handleSelectSuggestion(item)}
                      >
                        <img
                          src={item.mainImageUrl}
                          alt={item.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                        <div>
                          <p className="text-xs font-semibold">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.productTag}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* END Search Bar Component */}

              {/* Upload and Download functionality */}
              <div className="flex items-center space-x-1">
                <label className="
  flex flex-nowrap items-center
  whitespace-nowrap
  text-gray-700 hover:text-purple-600
  text-xs cursor-pointer
  transition duration-200
">
                  <svg
                    className="w-3.5 h-3.5 mr-1 text-gray-600 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>

                  <span className="whitespace-nowrap">Upload files</span>

                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>

                <button
                  onClick={() => {
                    navigate("/file-downloads");
                    scrollToTop();
                  }}
                  className="flex items-center text-gray-700 hover:text-purple-600 text-xs cursor-pointer transition duration-200"
                >
                  <svg
                    className="w-3.5 h-3.5 mr-1 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download
                </button>
              </div>

              {/* Become a Seller Button */}
              <a
                href="https://lmart-seller.vercel.app/seller/register"
                target="_blank"
                rel="noopener noreferrer"
                onClick={scrollToTop}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium text-xs transition duration-200 whitespace-nowrap inline-block text-center"
              >
                Become a Seller
              </a>

              <Link
                to="/contact"
                onClick={scrollToTop}
                className="bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 font-medium text-xs transition duration-200 whitespace-nowrap inline-block text-center"
              >
                Join US
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-0 inset-x-0 p-2 transition transform origin-top-right">
          <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white divide-y divide-gray-100">
            {/* Header and Close Button */}
            <div className="px-5 pt-3 pb-2 flex items-center justify-between">
              <img
                src={logo}
                alt="E-Mart Logo"
                className="h-8 w-auto"
                onClick={() => {
                  navigate("/");
                  scrollToTop();
                  setIsMenuOpen(false);
                }}
              />
              <button
                onClick={() => setIsMenuOpen(false)}
                className="bg-white rounded-md p-1.5 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
              >
                <span className="sr-only">Close menu</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
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

            {/* Logged-in User Info for Mobile */}
            {user && (
              <div className="px-5 py-2 bg-blue-50 border-y border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm mb-1">Hello, {user.name}</h3>
                <p className="text-gray-600 text-xs">{user.email}</p>
              </div>
            )}

            {/* Mobile Navigation Links */}
            <div className="py-2 px-5">
              <nav className="grid gap-y-3">
                {user && (
                  <>
                    <Link
                      to="/my-orders"
                      onClick={() => {
                        setIsMenuOpen(false);
                        scrollToTop();
                      }}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center"
                    >
                      📦 My Orders
                    </Link>

                    {/* My Uploads Button - Mobile */}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleViewUploads();
                      }}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center"
                    >
                      📁 My Uploads
                    </button>

                    {/* WishList Button - Mobile - UPDATED */}
                    <button
                      onClick={() => {
                        handleWishlistClick();
                        setIsMenuOpen(false);
                      }}
                      className="text-sm font-medium text-pink-600 hover:text-pink-500 flex items-center"
                    >
                      💖 WishList
                    </button>
                  </>
                )}

                {/* Mobile Home Link - UPDATED */}
                <Link
                  to="/"
                  onClick={() => {
                    setIsMenuOpen(false);
                    scrollToTop();
                  }}
                  className="text-sm font-medium text-gray-900 hover:text-gray-700 flex items-center"
                >
                  🏠 Home
                </Link>
                <Link
                  to="/e-store"
                  state={{ resetFilters: true }}
                  onClick={() => {
                    setIsMenuOpen(false);
                    scrollToTop();
                  }}
                >
                  🛒 E-Store
                </Link>
                <Link
                  to="/local-market"
                  state={{ resetFilters: true }}   // ✅ ADD THIS
                  onClick={() => {
                    setIsMenuOpen(false);
                    scrollToTop();
                  }}
                  className="text-sm font-medium text-gray-900 hover:text-gray-700 flex items-center"
                >
                  🏪 Local Market
                </Link>

                <Link
                  to="/printing"
                  state={{ resetFilters: true }}   // ✅ ADD
                  onClick={() => {
                    setIsMenuOpen(false);
                    scrollToTop();
                  }}
                  className="text-sm font-medium text-gray-900 hover:text-gray-700 flex items-center"
                >
                  🖨️ Printing
                </Link>

                <Link
                  to="/market-news"
                  state={{ resetFilters: true }}   // ✅ ADD THIS
                  onClick={() => {
                    setIsMenuOpen(false);
                    scrollToTop();
                  }}
                  className="text-sm font-medium text-gray-900 hover:text-gray-700 flex items-center"
                >
                  📰 Market News
                </Link>

                <Link
                  to="/oldee"
                  state={{ resetFilters: true }}   // ✅ ADD THIS
                  onClick={() => {
                    setIsMenuOpen(false);
                    scrollToTop();
                  }}
                  className="text-sm font-medium text-gray-900 hover:text-gray-700 flex items-center"
                >
                  👴 Oldee
                </Link>

              </nav>
            </div>

            {/* Mobile Actions Section */}
            <div className="py-4 px-5 space-y-4">
              {/* Mobile Search with Auto Suggestions - MODIFIED */}
              <div className="relative" ref={searchRef}>
                <form
                  onSubmit={handleSearchSubmit}
                  className="
    flex items-center
    bg-gray-50
    border border-gray-200
    rounded-lg
    px-3 py-1.5 gap-2
    focus-within:border-blue-600
    focus-within:ring-2
    focus-within:ring-blue-500
  "
                >

                  <input
                    type="text"
                    value={query}
                    placeholder="Search products..."
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.trim() && setShowSuggestions(true)}
                    className="
      flex-1
      bg-transparent
      outline-none
      focus:outline-none
      focus:ring-0
      text-xs
      pl-3
    "
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (query) {
                        setQuery("");
                        setShowSuggestions(false);
                      } else {
                        handleIconSearch();
                      }
                    }}
                    className="
      text-blue-600
      hover:text-blue-800
      transition
      outline-none
      focus:outline-none
      focus:ring-0
      active:outline-none
    "
                  >
                    {query ? (
                      // ❌ Clear icon
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    ) : (
                      // 🔍 Search icon
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
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    )}
                  </button>
                </form>

                {/* Mobile Suggestions Box */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-10 left-0 w-full bg-white shadow-lg rounded-lg border z-50 overflow-hidden">
                    {suggestions.map((item) => (
                      <div
                        key={item.id}
                        className="p-1.5 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                        onClick={() => handleSelectSuggestion(item)}
                      >
                        <img
                          src={item.mainImageUrl}
                          alt={item.name}
                          className="w-6 h-6 rounded object-cover"
                        />
                        <div>
                          <p className="text-xs font-semibold">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.productTag}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* END Mobile Search */}

              {/* Mobile Action Buttons */}
              <div className="space-y-2">
                {/* Become a Seller Button */}
                <button
                  onClick={() => {
                    navigate("/become-a-seller");
                    setIsMenuOpen(false);
                    scrollToTop();
                  }}
                  className="w-full bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium text-xs text-center"
                >
                  💰 Become a Seller
                </button>

                <button
                  onClick={() => {
                    navigate("/contact");
                    setIsMenuOpen(false);
                    scrollToTop();
                  }}
                  className="w-full bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 font-medium text-xs text-center"
                >
                  🤝 Join US
                </button>

                <div className="flex space-x-3 pt-1">
                  {/* Mobile Upload Button */}
                  <label className={`flex-1 flex items-center justify-center text-gray-700 hover:text-purple-600 text-xs cursor-pointer border border-gray-300 rounded-lg px-2 py-1.5 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <svg
                      className="w-3.5 h-3.5 mr-1 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Upload
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </label>

                  <button
                    onClick={() => {
                      navigate("/file-downloads");
                      setIsMenuOpen(false);
                      scrollToTop();
                    }}
                    className="flex-1 flex items-center justify-center text-gray-700 hover:text-purple-600 text-xs cursor-pointer border border-gray-300 rounded-lg px-2 py-1.5"
                  >
                    <svg
                      className="w-3.5 h-3.5 mr-1 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download
                  </button>
                </div>
              </div>

              {/* Auth Buttons */}
              <div>
                {user ? (
                  <button
                    onClick={handleMobileLogout}
                    className="w-full flex items-center justify-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    🚪 Logout
                  </button>
                ) : (
                  <>
                    <Link
                      to="/register"
                      onClick={() => {
                        setIsMenuOpen(false);
                        scrollToTop();
                      }}
                      className="w-full flex items-center justify-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 mb-2"
                    >
                      Sign up
                    </Link>
                    <p className="text-center text-sm font-medium text-gray-500">
                      Existing customer?{' '}
                      <Link
                        to="/login"
                        className="text-indigo-600 hover:text-indigo-500"
                        onClick={() => {
                          setIsMenuOpen(false);
                          scrollToTop();
                        }}
                      >
                        Sign in
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsCartOpen(false)}></div>
          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md">
              <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <h2 className="text-lg font-bold text-gray-900">
                      Your Cart
                    </h2>
                    <div className="ml-3 h-7 flex items-center">
                      <button
                        type="button"
                        className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                        onClick={() => setIsCartOpen(false)}
                      >
                        <span className="sr-only">Close panel</span>
                        <svg
                          className="h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
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
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Total Items: {items.length}
                  </p>
                </div>

                {/* Cart Body */}
                <div className="flex-1 px-4 py-6 sm:px-6">
                  {items.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-lg font-medium text-gray-500">Your cart is empty.</p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <ul role="list" className="-my-6 divide-y divide-gray-200">
                      {items.map((item) => (
                        <li key={item.lineItemKey || item.id} className="flex py-6">
                          {/* Checkbox */}
                          <div className="flex items-start mr-3">
                            <input
                              type="checkbox"
                              checked={item.selected || false}
                              onChange={() => toggleSelect(item.lineItemKey || item.id)}
                              className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                            />
                          </div>

                          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-[100px] w-[290px] object-contain object-center"
                            />
                          </div>

                          <div className="ml-4 flex flex-1 flex-col">
                            <div>
                              <div className="flex justify-between text-base font-medium text-gray-900">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                  {item.name}
                                </h3>
                                <p className="ml-4 text-purple-600 font-bold">
                                  {'₹' + item.price.toLocaleString()}
                                </p>
                              </div>
                              <p className="text-xs text-gray-600 truncate">
                                {item.description}
                              </p>
                            </div>

                            {/* Quantity Control and Remove */}
                            <div className="flex flex-1 items-end justify-between text-sm mt-2">
                              {/* Quantity Control */}
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleSidebarQuantityDecrease(item)}
                                  className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <span className="font-medium text-gray-700">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleSidebarQuantityIncrease(item)}
                                  className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </button>
                              </div>

                              {/* Remove Button */}
                              <div className="flex">
                                <button
                                  type="button"
                                  className="font-medium text-red-600 hover:text-red-500"
                                  onClick={() => handleSidebarRemoveItem(item.lineItemKey || item.id, item.name)}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Footer and Checkout */}
                {items.length > 0 && (
                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6 space-y-3">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>Selected Subtotal</p>
                      <p className="text-xl font-bold text-green-600">
                        {'₹' + selectedTotal.toLocaleString()}
                      </p>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Shipping and taxes calculated at checkout.
                    </p>

                    <button
                      onClick={handleSidebarCheckout}
                      disabled={selectedCount === 0}
                      className={`w-full py-3 rounded-lg font-medium transition-colors ${selectedCount === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                        }`}
                    >
                      {selectedCount === 0 ? 'Select Items to Checkout' : `Checkout Selected (${selectedCount})`}
                    </button>

                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium transition-colors"
                    >
                      Continue Shopping
                    </button>

                    <button
                      onClick={() => {
                        clearCart();
                        setIsCartOpen(false);
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors text-sm"
                    >
                      Clear Cart
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;