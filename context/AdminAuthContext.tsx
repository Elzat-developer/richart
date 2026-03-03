import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminApiService } from '../services/adminApi';
import { SignInRequest, JwtAuthenticationResponse, AdminUser, AuthContextType } from '../types';

const AdminAuthContext = createContext<AuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Проверяем наличие токена при загрузке
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const email = localStorage.getItem('adminUser');
    
    if (token && email) {
      setAdmin({ email, token });
    }
  }, []);

  const login = useCallback(async (credentials: SignInRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response: JwtAuthenticationResponse = await AdminApiService.login(credentials);
      
      const adminUser: AdminUser = {
        email: credentials.email,
        token: response.token
      };
      
      // Сохраняем в localStorage
      localStorage.setItem('adminToken', response.token);
      localStorage.setItem('adminUser', credentials.email);
      
      setAdmin(adminUser);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ошибка входа';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    // Удаляем из localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Очищаем состояние
    setAdmin(null);
    setError(null);
    
    // Перенаправляем на страницу логина
    window.location.href = '/admin/login';
  }, []);

  const value: AuthContextType = {
    admin,
    login,
    logout,
    loading,
    error
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AuthContextType => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
