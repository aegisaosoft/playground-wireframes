import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '@/services/auth.service';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/?auth=required' 
}) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Store the attempted location so we can redirect back after login
    const currentPath = location.pathname + location.search;
    localStorage.setItem('redirectAfterLogin', currentPath);
    
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
