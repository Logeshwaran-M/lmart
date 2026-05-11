import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  const handleLogin = () => {
    handleClose();
    navigate('/login');
  };

  const handleRegister = () => {
    handleClose();
    navigate('/register');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      ></div>
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
            isVisible 
              ? 'scale-100 opacity-100 translate-y-0' 
              : 'scale-95 opacity-0 translate-y-4'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal Content */}
          <div className="p-8">
            {/* Welcome Header */}
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to L-mart!</h2>
              <p className="text-gray-600">Join us for the best printing and e-commerce experience</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Login to Your Account
              </button>
              
              <button
                onClick={handleRegister}
                className="w-full bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Create New Account
              </button>
            </div>

            {/* Skip Option */}
            <div className="text-center mt-6">
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
              >
                Continue as Guest
              </button>
            </div>

            {/* Features */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">Fast Printing</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">E-Store</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;