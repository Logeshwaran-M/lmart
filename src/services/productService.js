const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get all products by category
export const getProductsByCategory = async (category) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Only add authorization header if token exists
    const token = localStorage.getItem('adminToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/products/category/${category}`, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get all products
export const getAllProducts = async () => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Only add authorization header if token exists
    const token = localStorage.getItem('adminToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw error;
  }
};

// Create new product
export const createProduct = async (productData) => {
  try {
    const formData = new FormData();
    
    // Append all product data to FormData
    Object.keys(productData).forEach(key => {
      if (key === 'images' && productData[key]) {
        // Handle multiple images
        Array.from(productData[key]).forEach(file => {
          formData.append('images', file);
        });
      } else if (key === 'image' && productData[key] instanceof File) {
        // Handle single image file
        formData.append('image', productData[key]);
      } else if (productData[key] !== null && productData[key] !== undefined) {
        // Stringify objects and arrays for backend processing
        if (typeof productData[key] === 'object' && !Array.isArray(productData[key])) {
          formData.append(key, JSON.stringify(productData[key]));
        } else if (Array.isArray(productData[key])) {
          formData.append(key, JSON.stringify(productData[key]));
        } else {
          formData.append(key, productData[key]);
        }
      }
    });

    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Update product
export const updateProduct = async (productId, productData) => {
  try {
    const formData = new FormData();
    
    // Append all product data to FormData
    Object.keys(productData).forEach(key => {
      if (key === 'images' && productData[key]) {
        // Handle multiple images
        Array.from(productData[key]).forEach(file => {
          formData.append('images', file);
        });
      } else if (key === 'image' && productData[key] instanceof File) {
        // Handle single image file
        formData.append('image', productData[key]);
      } else if (productData[key] !== null && productData[key] !== undefined) {
        // Stringify objects and arrays for backend processing
        if (typeof productData[key] === 'object' && !Array.isArray(productData[key])) {
          formData.append(key, JSON.stringify(productData[key]));
        } else if (Array.isArray(productData[key])) {
          formData.append(key, JSON.stringify(productData[key]));
        } else {
          formData.append(key, productData[key]);
        }
      }
    });

    const response = await fetch(`${API_BASE_URL}/products/update/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/delete/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Toggle product status
export const toggleProductStatus = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error toggling product status:', error);
    throw error;
  }
};