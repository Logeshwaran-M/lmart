import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateProfile,
} from "firebase/auth";

import { useNavigate } from "react-router-dom";

const formatDate = (value) => {
  if (!value) return "-";

  // Firestore Timestamp
  if (value.toDate) {
    return value.toDate().toLocaleString();
  }

  // ISO string or number
  return new Date(value).toLocaleString();
};

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // New state for auth loading

  const [form, setForm] = useState({
    name: "",
    email: "",
    photoURL: "",
    role: "User",
    createdAt: null,
    lastUpdated: null,
    status: "Active",
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 🔹 Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 🔹 Listen to auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false); // Auth state is now determined
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Fetch user data only when auth is ready and user exists
  useEffect(() => {
    const fetchUser = async () => {
      // Wait for auth to finish loading
      if (authLoading) return;
      
      // If no user after auth check, redirect to login
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setForm({
            name: data.name || user.displayName || "",
            email: user.email || data.email || "",
            photoURL: data.photoURL || user.photoURL || "/avatar.png",
            role: data.role || "User",
            createdAt: data.createdAt || null,
            lastUpdated: data.lastUpdated || null,
            status: data.status || "Active",
          });
        } else {
          // Create basic user document if it doesn't exist
          await updateDoc(doc(db, "users", user.uid), {
            name: user.displayName || "",
            email: user.email || "",
            photoURL: user.photoURL || "/avatar.png",
            role: "User",
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp(),
            status: "Active",
          });
          
          // Set form with auth data
          setForm({
            name: user.displayName || "",
            email: user.email || "",
            photoURL: user.photoURL || "/avatar.png",
            role: "User",
            createdAt: null,
            lastUpdated: null,
            status: "Active",
          });
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user, authLoading, navigate]);

  // 🔹 Upload profile image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.match("image/(jpeg|jpg|png|gif)")) {
      alert("Only JPG, PNG, and GIF images are allowed");
      return;
    }

    setUploading(true);

    try {
      const imageRef = ref(storage, `profile/${user.uid}.jpg`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);

      // Update local state
      setForm((prev) => ({ ...prev, photoURL: url }));

      // Update Firestore
      await updateDoc(doc(db, "users", user.uid), {
        photoURL: url,
        lastUpdated: serverTimestamp(),
      });

      
    } catch (err) {
      alert("❌ Image upload failed");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // 🔹 Save profile changes
 const handleSave = async () => {
  if (!user) return;

  if (!form.name.trim()) {
   
    return;
  }

  try {
    // ✅ Update Firestore
    await updateDoc(doc(db, "users", user.uid), {
      name: form.name.trim(),
      photoURL: form.photoURL,
      lastUpdated: serverTimestamp(),
    });

    // ✅ Update Firebase Auth profile (CORRECT WAY)
    await updateProfile(auth.currentUser, {
      displayName: form.name.trim(),
      photoURL: form.photoURL,
    });

  } catch (err) {
    console.error("Profile update error:", err);
   
  }
};

  // 🔹 Delete account with reauthentication
  const handleDelete = async () => {
    if (!user || isDeleting) return;

    const confirm = window.confirm(
      "This action is irreversible. Do you really want to delete your account?"
    );
    if (!confirm) return;

    const password = prompt(
      "For security, please enter your password to delete your account:"
    );
    
    if (!password) {
      alert("Password is required to delete account");
      return;
    }

    setIsDeleting(true);

    try {
      // 🔐 Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        password
      );
      await reauthenticateWithCredential(user, credential);

      // 🗑️ Delete Firestore user document
      await deleteDoc(doc(db, "users", user.uid));

      // 🗑️ Delete Auth account
      await user.delete();

      // 🧹 Clear all local storage
      localStorage.clear();
      sessionStorage.clear();

      // 🚪 Navigate to login and reload
      navigate("/login", { 
        replace: true,
        state: { message: "Account deleted successfully" }
      });
      
      // Give navigation time to complete before reload
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (err) {
      console.error(err);
      
      if (err.code === "auth/wrong-password") {
        alert("Incorrect password. Please try again.");
      } else if (err.code === "auth/requires-recent-login") {
        alert("Session expired. Please log in again and try deleting your account.");
        navigate("/login");
      } else {
        alert("❌ Failed to delete account. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // 🔹 Reset form changes
  const handleReset = () => {
    if (user) {
      // Refetch original data
      getDoc(doc(db, "users", user.uid)).then((snap) => {
        if (snap.exists()) {
          setForm({ ...snap.data() });
        }
      });
    }
  };

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show profile loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-500">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT PROFILE CARD */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-center">
            <div className="relative inline-block">
              <img
                src={form.photoURL || "/avatar.png"}
                alt="Profile"
                className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-white shadow"
              />
              <label className="absolute bottom-2 right-2 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition">
                <input
                  type="file"
                  hidden
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/png,image/gif"
                />
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
            </div>

            <h2 className="text-xl font-semibold mt-4">
              {form.name || "User"}
            </h2>
            <p className="text-gray-500 text-sm truncate max-w-[200px] mx-auto">
              {form.email}
            </p>

            <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              {form.role}
            </span>

            <div className="mt-6 border-t pt-4 text-left text-sm text-gray-600 space-y-3">
              <div>
                <p className="font-medium text-gray-700">Member Since</p>
                <p className="text-gray-500">{formatDate(form.createdAt)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Last Updated</p>
                <p className="text-gray-500">{formatDate(form.lastUpdated)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Status</p>
                <span className="inline-flex items-center text-green-600 font-semibold">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {form.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT EDIT SECTION */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Profile Information
            </h2>
            <p className="text-gray-500 text-sm">
              Update your personal details and preferences
            </p>
          </div>

          {/* Profile Picture Upload Section */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-gray-900">Profile Picture</h3>
                <p className="text-sm text-gray-500">
                  Upload JPG, PNG, GIF up to 5MB
                </p>
              </div>
              <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition">
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload New Photo
                  </>
                )}
                <input
                  type="file"
                  hidden
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/png,image/gif"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Personal Info Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Email cannot be changed
              </p>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border border-red-200 rounded-lg bg-red-50/50 p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h3 className="text-red-600 font-semibold">Danger Zone</h3>
            </div>
            <p className="text-sm text-red-500 mb-4">
              These actions are irreversible. Please proceed with caution.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Reset Changes
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Account
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;