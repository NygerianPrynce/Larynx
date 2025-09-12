/**
 * API context for centralized API state and error handling
 */

import React, { createContext, useContext, useState } from 'react';
import ApiService from '../services/apiService';

const ApiContext = createContext();

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export const ApiProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeApiCall = async (apiCall, context = '') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await apiCall();
      return result;
    } catch (err) {
      const errorInfo = ApiService.handleError(err, context);
      setError(errorInfo);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    isLoading,
    error,
    executeApiCall,
    clearError
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};
