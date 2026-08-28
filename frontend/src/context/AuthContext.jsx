import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser } from '../services/authService';
import { setAuthToken } from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'expense_tracker_user';
const TOKEN_KEY = 'expense_tracker_token';



export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    if (!stored || !token) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      setLoading(false);
      return;
    }

    try {
      setAuthToken(token);
      getCurrentUser()
        .then((currentUser) => {
          setUser(currentUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
        })
        .catch(() => {
          localStorage.removeItem(STORAGE_KEY);
          setAuthToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      setLoading(false);
    }
  }, []);

  const login = (userData, accessToken) => {
    setUser(userData);
    setAuthToken(accessToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
