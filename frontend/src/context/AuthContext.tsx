import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: any) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserInContext: (updatedUser: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      if (authService.isAuthenticated()) {
        const u = await authService.getCurrentUser();
        setUser(u);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth context profile fetch error:", err);
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Bootstrap auth state from cached user if available, then fetch fresh copy
    const cached = authService.getCachedUser();
    if (cached) {
      setUser(cached);
    }
    fetchProfile();
  }, []);

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const u = await authService.getCurrentUser();
      setUser(u);
    } catch (err) {
      console.error("Refresh user error:", err);
    }
  };

  const updateUserInContext = (updatedUser: any) => {
    setUser(updatedUser);
    localStorage.setItem("ecosphere_user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    updateUserInContext
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
