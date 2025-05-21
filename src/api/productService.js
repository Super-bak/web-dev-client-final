import axios from 'axios';
import API_BASE_URL, { getHeaders } from './config';

export const productService = {
  // Get all products with optional filters
  getProducts: async (filters = {}) => {
    const { category, search, sort } = filters;
    const params = new URLSearchParams();
    
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);

    const response = await axios.get(`${API_BASE_URL}/products?${params}`, {
      headers: getHeaders()
    });
    return response.data;
  },

  // Get single product by ID
  getProductById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/products/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  },

  // Add product review
  addReview: async (productId, reviewData) => {
    const response = await axios.post(
      `${API_BASE_URL}/products/${productId}/reviews`,
      reviewData,
      { headers: getHeaders() }
    );
    return response.data;
  }
};

export default productService; 