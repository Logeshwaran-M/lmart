import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const getReadableError = (err) => {
  const code = err?.code;
  if (code === "permission-denied" || code === "firestore/permission-denied") {
    return "Account created, but profile save was blocked (Firestore rules). Please contact admin.";
  }
  if (code === "unavailable" || code === "firestore/unavailable") {
    return "Network/server issue. Please try again.";
  }
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Try logging in.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/user-not-found":
      return "User not found.";
    case "auth/invalid-email":
      return "Invalid email format. Please check your email address.";
    case "auth/invalid-credential":
      return "Invalid email or password format. Please check your inputs and try again.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/network-request-failed":
      return "Network error. Check your internet and try again.";
    case "auth/operation-not-allowed":
      return "Email/password sign-up is disabled. Please contact support.";
    default:
      return err?.message || "Something went wrong.";
  }
};

// Store user locally
const storeUserData = (userData, uid) => {
  localStorage.setItem("userData", JSON.stringify(userData));
  localStorage.setItem("user", JSON.stringify(userData));
  localStorage.setItem("token", uid);
  localStorage.setItem("isLoggedIn", "true");
};

const UserRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNo: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const generateReferralCode = (name) => {
    const cleanName = name.replace(/\s+/g, "");
    const namePart = cleanName.substring(0, 5).toUpperCase();
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return namePart + randomPart;
  };

  const validateForm = () => {
    // Trim all inputs
    const trimmedEmail = formData.email.trim();
    const trimmedPassword = formData.password.trim();
    const trimmedName = formData.name.trim();
    const trimmedContact = formData.contactNo.trim();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (trimmedPassword !== formData.confirmPassword.trim()) {
      setError("Passwords do not match.");
      return false;
    }

    if (trimmedPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }

    if (trimmedName.length < 2) {
      setError("Enter valid name.");
      return false;
    }

    if (trimmedContact.length < 10) {
      setError("Enter valid contact number.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      let user;
      const buildUserData = (firebaseUser) => {
        const referralCode = generateReferralCode(formData.name);
        return {
          customerId: firebaseUser.uid,
          name: formData.name,
          email: formData.email,
          contactNo: formData.contactNo,
          gender: null,
          profileImage: null,
          referralCode,
          referredBy: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          emailVerified: firebaseUser.emailVerified,
          roles: ["customer"],
          status: "active"
        };
      };

      // Trim email and password before sending
      const trimmedEmail = formData.email.trim().toLowerCase();
      const trimmedPassword = formData.password.trim();

      if (!trimmedEmail || !trimmedPassword) {
        throw new Error("Email and password cannot be empty.");
      }

      console.log("Attempting registration with:", { email: trimmedEmail, passwordLength: trimmedPassword.length });

      try {
        // 🔹 Try Register
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          trimmedEmail,
          trimmedPassword
        );

        user = userCredential.user;
        console.log("Registration successful, user UID:", user.uid);

        await updateProfile(user, {
          displayName: formData.name
        });

        const userData = buildUserData(user);
        await setDoc(doc(db, "users", user.uid), userData);
        storeUserData(userData, user.uid);

        setSuccess("Registration successful!");

      } catch (registerError) {
        console.error("Registration error details:", {
          code: registerError.code,
          message: registerError.message,
          email: trimmedEmail
        });

        // 🔥 If already exists → Try Login
        if (registerError.code === "auth/email-already-in-use" || registerError.code === "auth/invalid-credential") {
          try {
            console.log("Email might already exist, attempting login...");
            const loginCredential = await signInWithEmailAndPassword(
              auth,
              trimmedEmail,
              trimmedPassword
            );

            user = loginCredential.user;
            console.log("Login successful, user UID:", user.uid);

            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
              storeUserData(userDoc.data(), user.uid);
            } else {
              // If Auth exists but Firestore profile missing, create it now.
              const userData = buildUserData(user);
              await setDoc(userRef, userData);
              storeUserData(userData, user.uid);
            }

            setSuccess("Welcome back! Logged in successfully.");
          } catch (loginError) {
            console.error("Login also failed:", loginError);
            // If login also fails, throw the original registration error
            throw registerError;
          }
        } else {
          throw registerError;
        }
      }

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      // Show the real failure cause (Auth vs Firestore vs network).
      console.error("Registration error:", err);
      const code = err?.code ? ` (${err.code})` : "";
      setError(`${getReadableError(err)}${code}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Create Account</h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 mb-3 rounded text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-600 p-2 mb-3 rounded text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            required
          />

          <input
            type="tel"
            name="contactNo"
            placeholder="Contact Number"
            value={formData.contactNo}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border p-3 rounded pr-10"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 cursor-pointer"
            >
              {showPassword ? "👁️" : "🔒"}
            </span>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border p-3 rounded pr-10"
              required
            />
            <span
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-3 top-3 cursor-pointer"
            >
              {showConfirmPassword ? "👁️" : "🔒"}
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700 transition"
          >
            {isLoading ? "Processing..." : "Create Account"}
          </button>

          <div className="text-center text-sm mt-3">
            Already have an account?{" "}
            <span
              className="text-purple-600 cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </div>

        </form>
      </div>
    </div>
  );
};

export default UserRegister;
