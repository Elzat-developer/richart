import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { admin } = useAdminAuth();

  if (!admin) {
    // Перенаправляем на страницу логина, если админ не авторизован
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
