import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  subscribeToAuthChanges 
} from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function signup(email, password) {
    return registerUser(email, password);
  }

  function login(email, password) {
    return loginUser(email, password);
  }

  function logout() {
    return logoutUser();
  }

  useEffect(() => {
    return subscribeToAuthChanges(user => {
      setCurrentUser(user);
      setLoading(false);
    });
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
