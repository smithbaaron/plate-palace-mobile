
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUserType } from '@/context/UserTypeContext';
import { UserType } from '@/lib/userTypeUtils';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredUserType?: UserType;
  requireOnboarded?: boolean;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredUserType, 
  requireOnboarded = true 
}) => {
  const { isAuthenticated, loading, supabaseUser } = useAuth();
  const { userType, isOnboarded } = useUserType();
  const location = useLocation();

  // Show loading only during initial auth check
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

  const isOnOnboardingPage = location.pathname.includes('/onboarding');
  const userRole = supabaseUser?.user_metadata?.role || supabaseUser?.app_metadata?.role;

  // If onboarded user is on onboarding page, redirect to dashboard
  if (isOnboarded && userType && isOnOnboardingPage) {
    const dashboardUrl = userType === "seller" ? "/seller/dashboard" : "/customer/dashboard";
    return <Navigate to={dashboardUrl} replace />;
  }

  // If user has role metadata but no userType, redirect to dashboard
  if (userRole && !userType && !isOnOnboardingPage) {
    const dashboardUrl = userRole === "seller" ? "/seller/dashboard" : "/customer/dashboard";
    return <Navigate to={dashboardUrl} replace />;
  }

  // Allow access to onboarding pages when setting up user type
  if (isOnOnboardingPage && !userType) {
    return <>{children}</>;
  }

  // Check user type requirements
  if (requiredUserType && userType !== requiredUserType) {
    if (userType && isOnboarded) {
      const dashboardUrl = userType === "seller" ? "/seller/dashboard" : "/customer/dashboard";
      return <Navigate to={dashboardUrl} replace />;
    }
    if (userRole && userRole !== requiredUserType) {
      const dashboardUrl = userRole === "seller" ? "/seller/dashboard" : "/customer/dashboard";
      return <Navigate to={dashboardUrl} replace />;
    }
    if (!userType && !userRole && !isOnOnboardingPage) {
      return <Navigate to={`/${requiredUserType}/onboarding`} replace />;
    }
  }

  // Check onboarding requirements
  if (requireOnboarded && !isOnboarded && userType && !isOnOnboardingPage) {
    return <Navigate to={`/${userType}/onboarding`} replace />;
  }
  
  // Default redirect for users without type or role
  if (!userType && !userRole && !isOnOnboardingPage) {
    return <Navigate to="/seller/onboarding" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
