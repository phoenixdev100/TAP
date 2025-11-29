import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/api/axios';

export type UserRole = 'student' | 'teacher' | 'college_admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (username: string, email: string, password: string, role: UserRole) => Promise<void>;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  canAccess: (resource: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role-based permissions
const rolePermissions = {
  student: ['read:own', 'read:schedule', 'read:assignments', 'read:notes', 'read:attendance'],
  teacher: ['read:own', 'read:schedule', 'write:schedule', 'read:assignments', 'write:assignments', 'read:notes', 'write:notes', 'read:attendance', 'write:attendance'],
  college_admin: ['*'] // All permissions
};

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on app load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        
        // Store refresh token if available
        if (storedRefreshToken) {
          localStorage.setItem('refreshToken', storedRefreshToken);
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const responseData = response.data as {
        token: string;
        user: User;
        refreshToken?: string;
      };
      const { token: newToken, user: userData, refreshToken } = responseData;

      setToken(newToken);
      setUser(userData);
      
      // Store all auth data in localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Store refresh token if provided
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    } catch (error) {
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string, role: UserRole) => {
    try {
      const response = await api.post('/api/auth/signup', { username, email, password, role });
      const responseData = response.data as {
        token: string;
        user: User;
        refreshToken?: string;
      };
      const { token: newToken, user: userData, refreshToken } = responseData;

      setToken(newToken);
      setUser(userData);
      
      // Store all auth data in localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Store refresh token if provided
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    // Clear all localStorage items
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    
    // Clear all sessionStorage items
    sessionStorage.clear();
    
    // Clear any other potential auth-related items
    Object.keys(localStorage).forEach(key => {
      if (key.toLowerCase().includes('token') || key.toLowerCase().includes('auth') || key.toLowerCase().includes('user')) {
        localStorage.removeItem(key);
      }
    });
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    const userPermissions = rolePermissions[user.role];
    if (!userPermissions) return false;
    
    return userPermissions.includes('*') || userPermissions.includes(permission);
  };

  const canAccess = (resource: string): boolean => {
    if (!user) return false;
    
    // Resource-based access control
    const resourcePermissions = {
      'dashboard': ['*'],
      'schedule': ['read:schedule', 'write:schedule'],
      'assignments': ['read:assignments', 'write:assignments'],
      'notes': ['read:notes', 'write:notes'],
      'attendance': ['read:attendance', 'write:attendance'],
      'users': ['college_admin'], // Only college admin can manage users
      'settings': ['teacher', 'college_admin']
    };

    const requiredPermissions = resourcePermissions[resource as keyof typeof resourcePermissions];
    if (!requiredPermissions) return false;

    if (requiredPermissions.includes('*')) return true;
    if (requiredPermissions.includes(user.role)) return true;
    
    return requiredPermissions.some(perm => hasPermission(perm));
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    signup,
    isLoading,
    hasPermission,
    canAccess
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
