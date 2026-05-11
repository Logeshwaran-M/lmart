import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Set initial form data
      setFormData({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || parsedUser.contactNo || '',
        address: parsedUser.address || ''
      });

      // Set profile image if exists
      if (parsedUser.profileImage) {
        setProfileImageUrl(parsedUser.profileImage);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/login");
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload only JPG, PNG, or GIF images');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setProfileImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileImageUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setProfileImage(null);
    setProfileImageUrl('');
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real application, you would make an API call here
      // For now, we'll simulate saving to localStorage
      
      const updatedUser = {
        ...user,
        ...formData,
        profileImage: profileImageUrl || user.profileImage,
        updatedAt: new Date().toISOString()
      };

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Profile updated successfully!');
      
      // Optionally redirect to profile or home
      // navigate("/");
      
    } catch (error) {
      console.error("Error saving profile:", error);
      alert('Failed to save profile changes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={handleCancel}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account information and preferences</p>
        </div>

        {/* User ID Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
              <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                {user?.userId || 'FK27yxNN...'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-8">
            <form onSubmit={handleSaveChanges}>
              {/* Profile Picture Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      {profileImageUrl ? (
                        <img
                          src={profileImageUrl}
                          alt="Profile"
                          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-lg">
                          <span className="text-4xl font-bold text-gray-400">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      
                      {/* Upload Progress */}
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                          <div className="text-white text-sm">{uploadProgress}%</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload a new photo
                        </label>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                      
                      {profileImageUrl && (
                        <button
                          type="button"
                          onClick={handleClearImage}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Clear Photo
                        </button>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        Supports JPG, PNG, GIF up to 5MB. For best results, use a square image.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>
                
                <p className="mt-3 text-sm text-gray-500">
                  This information will be displayed on your profile and used for order delivery.
                </p>
              </div>

              {/* Email Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Settings</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Primary Email</p>
                      <p className="text-sm text-gray-600">{formData.email}</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Additional Settings Section */}
        <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive updates about your orders and promotions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Receive order updates via SMS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 border border-red-200 rounded-lg overflow-hidden">
          <div className="bg-red-50 px-6 py-4">
            <h3 className="text-lg font-semibold text-red-700">Danger Zone</h3>
          </div>
          <div className="px-6 py-6 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-gray-900">Delete Account</p>
                <p className="text-sm text-gray-600">Permanently delete your account and all associated data</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    // Handle account deletion
                    alert('Account deletion requested');
                  }
                }}
                className="mt-4 sm:mt-0 px-4 py-2 border border-red-600 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;