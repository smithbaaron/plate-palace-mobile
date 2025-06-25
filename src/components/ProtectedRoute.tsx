
import React, { useEffect, useState } from 'react';
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
  const { isAuthenticated, loading, currentUser, supabaseUser } = useAuth();
  const { userType, isOnboarded } = useUserType();
  const [isReady, setIsReady] = useState(false);
  const location = useLocation();

  // Simplified ready check with timeout
  useEffect(() => {
    const readyTimeout = setTimeout(() => {
      setIsReady(true);
    }, loading ? 3000 : 100); // 3 second timeout for loading, immediate if not loading

    if (!loading) {
      setIsReady(true);
    }

    return () => clearTimeout(readyTimeout);
  }, [loading]);

  // Show loading state only briefly
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to auth");
    return <Navigate to={`/auth${requiredUserType ? `?type=${requiredUserType}` : ''}`} replace />;
  }

  const isOnOnboardingPage = location.pathname.includes('/onboarding');
  const userRole = supabaseUser?.user_metadata?.role || supabaseUser?.app_metadata?.role;

  // If already onboarded and on onboarding page, redirect to dashboard
  if (isOnboarded && userType && isOnOnboardingPage) {
    const dashboardUrl = userType === "seller" ? "/seller/dashboard" : "/customer/dashboard";
    return <Navigate to={dashboardUrl} replace />;
  }

  // Handle role-based redirects
  if (userRole && !isOnOnboardingPage) {
    if (userRole === "customer" && (!requiredUserType || requiredUserType === "customer")) {
      return <Navigate to="/customer/dashboard" replace />;
    } else if (userRole === "seller" && (!requiredUserType || requiredUserType === "seller")) {
      return <Navigate to="/seller/dashboard" replace />;
    }
  }

  // If user type required but doesn't match
  if (requiredUserType && userType && userType !== requiredUserType) {
    const correctDashboard = userType === 'seller' ? "/seller/dashboard" : "/customer/dashboard";
    return <Navigate to={correctDashboard} replace />;
  }

  // If onboarding required but not completed
  if (requireOnboarded && !isOnboarded && userType && !isOnOnboardingPage) {
    return <Navigate to={`/${userType}/onboarding`} replace />;
  }
  
  // Default: allow access to content
  return <>{children}</>;
};

export default ProtectedRoute;
