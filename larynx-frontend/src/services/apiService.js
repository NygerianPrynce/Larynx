/**
 * Centralized API service for frontend
 * Eliminates duplicate fetch logic and error handling
 */

class ApiService {
  static baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  /**
   * Enhanced API call with error handling
   */
  static async fetchWithErrorHandling(url, options = {}) {
    try {
      const response = await fetch(url, {
        credentials: 'include',
        ...options
      });
      
      if (!response.ok) {
        throw {
          status: response.status,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }
      
      return await response.json();
    } catch (error) {
      throw {
        ...error,
        status: error.status || 500,
        name: error.name || 'FetchError'
      };
    }
  }

  /**
   * Centralized error handling
   */
  static handleError(error, context = '', navigate = null) {
    console.error(`Error in ${context}:`, error);
    
    // Check if it's a network error or API is down
    if (!navigator.onLine || error.name === 'NetworkError') {
      return { type: 'network', message: 'Network connection error' };
    }
    
    // Check specific error types
    if (error.status === 500 || error.message?.includes('500')) {
      if (navigate) navigate('/error/500');
      return { type: 'server', message: 'Internal server error' };
    } else if (error.status === 403 || error.message?.includes('403')) {
      if (navigate) navigate('/error/403');
      return { type: 'forbidden', message: 'Access forbidden' };
    } else if (error.status === 401 || error.message?.includes('401')) {
      if (navigate) navigate('/login');
      return { type: 'unauthorized', message: 'Please log in again' };
    } else {
      return { type: 'unknown', message: error.message || 'An error occurred' };
    }
  }

  /**
   * GET request helper
   */
  static async get(endpoint, options = {}) {
    return this.fetchWithErrorHandling(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      ...options
    });
  }

  /**
   * POST request helper
   */
  static async post(endpoint, data = null, options = {}) {
    return this.fetchWithErrorHandling(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options
    });
  }

  /**
   * PUT request helper
   */
  static async put(endpoint, data = null, options = {}) {
    return this.fetchWithErrorHandling(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options
    });
  }

  /**
   * DELETE request helper
   */
  static async delete(endpoint, options = {}) {
    return this.fetchWithErrorHandling(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      ...options
    });
  }

  // Specific API endpoints
  static async getUserName() {
    return this.get('/user/name');
  }

  static async getUserProfile() {
    return this.get('/user/profile');
  }

  static async getAnalytics() {
    return this.get('/analytics');
  }

  static async getInventory() {
    return this.get('/inventory');
  }

  static async getDrafts(limit = 10) {
    return this.get(`/drafts?limit=${limit}`);
  }

  static async getTokenStatus() {
    return this.get('/token-status');
  }

  static async updateUserName(newName) {
    return this.put('/user/update-name', { new_name: newName });
  }

  static async updateProfileImage(profileImageUrl) {
    return this.put('/user/update-profile-image', { profile_image_url: profileImageUrl });
  }

  static async addInventoryItem(item) {
    return this.post('/inventory', item);
  }

  static async updateInventoryItem(id, item) {
    return this.put(`/inventory/${id}`, item);
  }

  static async deleteInventoryItem(id) {
    return this.delete(`/inventory/${id}`);
  }

  static async uploadInventoryFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.fetchWithErrorHandling(`${this.baseURL}/inventory/upload`, {
      method: 'POST',
      body: formData
    });
  }

  static async scrapeWebsite(url) {
    return this.get(`/website-scrape?url=${encodeURIComponent(url)}`);
  }

  static async finishOnboarding() {
    return this.post('/finish-onboarding');
  }

  static async logout() {
    return this.post('/logout');
  }
}

export default ApiService;
