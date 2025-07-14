
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

  console.log('🔍 ProtectedRoute Debug:', {
    userType,
    userRole,
    isOnboarded,
    isOnOnboardingPage,
    requiredUserType,
    currentPath: location.pathname,
    supabaseUserMetadata: supabaseUser?.user_metadata,
    supabaseAppMetadata: supabaseUser?.app_metadata
  });

  // If onboarded user is on onboarding page, redirect to dashboard
  if (isOnboarded && userType && isOnOnboardingPage) {
    const dashboardUrl = userType === "seller" ? "/seller/dashboard" : "/customer/dashboard";
    console.log('✅ Redirecting onboarded user to dashboard:', dashboardUrl);
    return <Navigate to={dashboardUrl} replace />;
  }

  // If user has role metadata but no userType, and they're onboarded, redirect to dashboard
  if (userRole && !userType && !isOnOnboardingPage && isOnboarded) {
    const dashboardUrl = userRole === "seller" ? "/seller/dashboard" : "/customer/dashboard";
    console.log('✅ Redirecting user with role metadata to dashboard:', dashboardUrl);
    return <Navigate to={dashboardUrl} replace />;
  }

  // Allow access to onboarding pages when setting up user type
  if (isOnOnboardingPage && !isOnboarded) {
    console.log('✅ Allowing access to onboarding page');
    return <>{children}</>;
  }

  // Check user type requirements
  if (requiredUserType && userType !== requiredUserType) {
    console.log('❌ User type mismatch. Required:', requiredUserType, 'Current:', userType);
    
    // If user has a different type and is onboarded, redirect to their dashboard
    if (userType && isOnboarded) {
      const dashboardUrl = userType === "seller" ? "/seller/dashboard" : "/customer/dashboard";
      console.log('✅ Redirecting to correct user type dashboard:', dashboardUrl);
      return <Navigate to={dashboardUrl} replace />;
    }
    
    // If user has role metadata that doesn't match, redirect to their dashboard
    if (userRole && userRole !== requiredUserType && isOnboarded) {
      const dashboardUrl = userRole === "seller" ? "/seller/dashboard" : "/customer/dashboard";
      console.log('✅ Redirecting based on role metadata:', dashboardUrl);
      return <Navigate to={dashboardUrl} replace />;
    }
    
    // If no user type and not on onboarding, redirect to required type onboarding only if we have requiredUserType
    if (!userType && !userRole && !isOnOnboardingPage && requiredUserType) {
      console.log('✅ Redirecting to required type onboarding:', requiredUserType);
      return <Navigate to={`/${requiredUserType}/onboarding`} replace />;
    }
    
    // If we still don't have a user type and no required type specified, show loading
    if (!userType && !userRole && !isOnOnboardingPage && !requiredUserType) {
      console.log('⏳ Waiting for user type data...');
      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="animate-pulse">Loading user data...</div>
        </div>
      );
    }
  }

  // Check onboarding requirements
  if (requireOnboarded && !isOnboarded && userType && !isOnOnboardingPage) {
    console.log('✅ Redirecting to complete onboarding for type:', userType);
    return <Navigate to={`/${userType}/onboarding`} replace />;
  }
  
  // Default redirect for users without type or role - only when requiredUserType is specified
  if (!userType && !userRole && !isOnOnboardingPage && !isOnboarded && requiredUserType) {
    console.log('✅ Default redirect to required type onboarding:', requiredUserType);
    return <Navigate to={`/${requiredUserType}/onboarding`} replace />;
  }
  
  console.log('✅ Allowing access to protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
