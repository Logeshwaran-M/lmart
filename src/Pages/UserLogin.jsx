import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../../firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useWishlist } from "../context/WishlistContext";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

const UserLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleWishlist } = useWishlist();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      let userData;

      // ✅ If user document exists
      if (userDoc.exists()) {
        userData = userDoc.data();

        // 🔥 If old users have "role" instead of "roles"
        if (!userData.roles) {
          userData.roles = userData.role ? [userData.role] : ["user"];
          await setDoc(userRef, userData, { merge: true });
        }
      } else {
        // ✅ Create new user document
        userData = {
          name: user.displayName || formData.email.split("@")[0],
          email: user.email,
          uid: user.uid,
          roles: ["user"], // ✅ Default role
          createdAt: new Date(),
          wishlist: [],
        };
        await setDoc(userRef, userData);
      }

      // =====================================================
      // ✅ SELLER ROLE CHECK
      // =====================================================
      if (userData.roles && userData.roles.includes("seller")) {
        navigate("/seller-dashboard");
        return;
      }

      // =====================================================
      // ✅ NORMAL USER FLOW
      // =====================================================
      const { state } = location;

      if (state?.reviewRedirect) {
        navigate(state.from || `/product/${state.productId}`, {
          state: {
            showReviewModal: true,
            productId: state.productId,
            productName: state.productName,
          },
        });
      } else if (state?.wishlistRedirect) {
        if (state?.product) {
          setTimeout(() => {
            toggleWishlist(state.product);
            alert(`❤️ "${state.product.name}" added to your wishlist!`);
          }, 500);

          navigate(state.from || "/", {
            state: { productName: state.product.name },
          });
        } else {
          navigate("/wishlist");
        }
      } else {
        navigate(state?.from || "/");
      }
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Try again later.");
          break;
        default:
          setError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded-2xl shadow-2xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome Back
            </h2>
            <p className="text-gray-600 mt-2">
              Sign in to your customer account
            </p>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-3 text-gray-400 hover:text-blue-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold hover:opacity-95 disabled:opacity-60 transition-all duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 rounded-full border-b-2 border-white" />
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-purple-600 hover:text-purple-800"
              >
                Forgot password?
              </button>
            </div>

            <div className="text-center text-sm border-t pt-4">
              Don't have an account?
              <button
                type="button"
                className="text-purple-600 font-semibold ml-1 hover:text-purple-800"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  navigate("/register");
                }}
              >
                Sign up here
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;