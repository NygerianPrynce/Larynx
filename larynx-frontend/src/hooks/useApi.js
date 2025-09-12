/**
 * Custom hook for API calls with loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/apiService';

export const useApi = (apiCall, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    immediate = true,
    onSuccess = null,
    onError = null
  } = options;

  const execute = useCallback(async (...args) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await apiCall(...args);
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorInfo = ApiService.handleError(err, 'useApi');
      setError(errorInfo);
      
      if (onError) {
        onError(errorInfo);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, onSuccess, onError]);

  useEffect(() => {
    if (immediate && apiCall) {
      execute();
    }
  }, [immediate, execute, ...dependencies]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  return {
    data,
    isLoading,
    error,
    execute,
    refetch
  };
};

export const useAnalytics = () => {
  return useApi(ApiService.getAnalytics, [], { immediate: true });
};

export const useInventory = () => {
  return useApi(ApiService.getInventory, [], { immediate: true });
};

export const useDrafts = (limit = 10) => {
  return useApi(() => ApiService.getDrafts(limit), [limit], { immediate: true });
};

export const useTokenStatus = () => {
  return useApi(ApiService.getTokenStatus, [], { immediate: true });
};
