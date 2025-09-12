/**
 * User context for centralized user state management
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/apiService';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const profile = await ApiService.getUserProfile();
      setUser(profile);
    } catch (err) {
      const errorInfo = ApiService.handleError(err, 'fetchUserProfile');
      setError(errorInfo);
      console.error('Failed to fetch user profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserName = async (newName) => {
    try {
      await ApiService.updateUserName(newName);
      setUser(prev => ({ ...prev, name: newName }));
    } catch (err) {
      const errorInfo = ApiService.handleError(err, 'updateUserName');
      setError(errorInfo);
      throw err;
    }
  };

  const updateProfileImage = async (profileImageUrl) => {
    try {
      await ApiService.updateProfileImage(profileImageUrl);
      setUser(prev => ({ ...prev, profileImage: profileImageUrl }));
    } catch (err) {
      const errorInfo = ApiService.handleError(err, 'updateProfileImage');
      setError(errorInfo);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await ApiService.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear user state even if logout API fails
      setUser(null);
      setError(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const value = {
    user,
    isLoading,
    error,
    fetchUserProfile,
    updateUserName,
    updateProfileImage,
    logout,
    clearError
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
