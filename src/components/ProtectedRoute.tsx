
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUserType } from '@/context/UserTypeContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredUserType?: 'seller' | 'customer';
  requireOnboarded?: boolean;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredUserType, 
  requireOnboarded = true 
}) => {
  const { isAuthenticated, loading } = useAuth();
  const { userType, isOnboarded } = useUserType();
  const location = useLocation();

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={`/auth${requiredUserType ? `?type=${requiredUserType}` : ''}`} state={{ from: location }} replace />;
  }

  // If user type is required but doesn't match
  if (requiredUserType && userType !== requiredUserType) {
    // If they have a different user type, send them to their correct dashboard
    if (userType === 'seller') {
      return <Navigate to="/seller/dashboard" replace />;
    } else if (userType === 'customer') {
      return <Navigate to="/customer/dashboard" replace />;
    }
    
    // If they don't have a user type yet, send them to the auth page
    return <Navigate to="/auth" replace />;
  }

  // If onboarding is required but not completed
  if (requireOnboarded && !isOnboarded && userType) {
    return <Navigate to={`/${userType}/onboarding`} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
