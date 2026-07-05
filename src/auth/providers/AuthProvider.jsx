import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { AuthService } from '../../services/auth/authService';
import styles from './AuthProvider.module.scss';

export const AuthContext = createContext(null);

// Premium Loading Spinner Screen
const AuthLoadingScreen = () => (
  <div className={styles.loadingScreen}>
    <div className={styles.loaderContainer}>
      <div className={styles.logoBadge}>
        <img src="/logo.png" alt="MediaFlow Logo" className={styles.logoImg} />
      </div>
      <div className={styles.spinner} />
      <span className={styles.loadingText}>Initializing MediaFlow Workspace...</span>
    </div>
  </div>
);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load active sessions on boot
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setError(null);
        const currentData = await AuthService.getCurrentSession();
        if (currentData) {
          setSession(currentData.session);
          setUser(currentData.user);
          setRole(currentData.user.role);
        }
      } catch (err) {
        console.error('Failed to initialize auth session', err);
        setError(err.message);
      } finally {
        // Short timeout to guarantee smooth fade-ins and prevent flashes
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await AuthService.signIn(email, password);
      setSession(data.session);
      setUser(data.user);
      setRole(data.user.role);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await AuthService.signOut();
      setSession(null);
      setUser(null);
      setRole(null);
    } catch (err) {
      console.error('Failed to sign out', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const profileRefresh = useCallback(async () => {
    if (!user) return;
    try {
      const currentData = await AuthService.getCurrentSession();
      if (currentData) {
        setUser(currentData.user);
        setRole(currentData.user.role);
      }
    } catch (err) {
      console.error('Failed to refresh user profile', err);
    }
  }, [user]);

  // Memoize context value to prevent unneeded consumer renders
  const value = useMemo(() => ({
    session,
    user,
    role,
    loading,
    error,
    login,
    logout,
    profileRefresh
  }), [session, user, role, loading, error, login, logout, profileRefresh]);

  if (loading) {
    return <AuthLoadingScreen />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
