import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase"; // Adjust the path based on your structure
import { sendPasswordResetEmail } from "firebase/auth";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg({ type: "", text: "" });

    try {
      await sendPasswordResetEmail(auth, email);
      setMsg({
        type: "success",
        text: "Success! Check your email inbox for the reset link.",
      });
      // Return to login after user sees the message
      setTimeout(() => navigate("/login"), 5000);
    } catch (err) {
      console.error("Reset Error:", err);
      if (err.code === "auth/user-not-found") {
        setMsg({ type: "error", text: "No user found with this email address." });
      } else {
        setMsg({ type: "error", text: "Something went wrong. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we'll send you a secure link to update your password.
          </p>
        </div>

        {msg.text && (
          <div className={`p-3 rounded text-sm text-center ${msg.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {msg.text}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleResetRequest}>
          <input
            type="email"
            required
            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm font-medium text-purple-600 hover:text-purple-500"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;