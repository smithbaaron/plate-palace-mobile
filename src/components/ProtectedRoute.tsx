
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
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const location = useLocation();

  // Complete initial check after auth state stabilizes
  useEffect(() => {
    if (!loading) {
      const timeoutId = setTimeout(() => {
        setInitialCheckDone(true);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading]);

  // Show loading state during initial auth check
  if (loading || !initialCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to auth");
    return <Navigate to={`/auth${requiredUserType ? `?type=${requiredUserType}` : ''}`} state={{ from: location }} replace />;
  }

  // Check if we're on an onboarding page
  const isOnOnboardingPage = location.pathname.includes('/onboarding');

  // If user is onboarded and has a user type, redirect them to their dashboard if they're on onboarding
  if (isOnboarded && userType && isOnOnboardingPage) {
    console.log("User is already onboarded, redirecting to dashboard");
    const dashboardUrl = userType === "seller" ? "/seller/dashboard" : "/customer/dashboard";
    return <Navigate to={dashboardUrl} replace />;
  }

  // Check user role from metadata if userType is not set
  const userRole = supabaseUser?.user_metadata?.role || supabaseUser?.app_metadata?.role;
  
  // If user has role in metadata but no userType, redirect to appropriate dashboard
  if (userRole && !userType && !isOnOnboardingPage) {
    console.log("User has role in metadata:", userRole);
    if (userRole === "customer") {
      return <Navigate to="/customer/dashboard" replace />;
    } else if (userRole === "seller") {
      return <Navigate to="/seller/dashboard" replace />;
    }
  }

  // If on onboarding page and no user type yet, allow access (they're setting up their type)
  if (isOnOnboardingPage && !userType && currentUser) {
    console.log("On onboarding page without user type - allowing access");
    return <>{children}</>;
  }

  // If user type is required but doesn't match
  if (requiredUserType && userType !== requiredUserType) {
    console.log("User type mismatch", { required: requiredUserType, current: userType });
    
    // If they have a different user type, send them to their correct dashboard
    if (userType === 'seller' && isOnboarded) {
      return <Navigate to="/seller/dashboard" replace />;
    } else if (userType === 'customer' && isOnboarded) {
      return <Navigate to="/customer/dashboard" replace />;
    } else if (userType && !isOnboarded && !isOnOnboardingPage) {
      return <Navigate to={`/${userType}/onboarding`} replace />;
    }
    
    // Check role metadata as fallback
    if (userRole === 'customer' && requiredUserType === 'seller') {
      return <Navigate to="/customer/dashboard" replace />;
    } else if (userRole === 'seller' && requiredUserType === 'customer') {
      return <Navigate to="/seller/dashboard" replace />;
    }
    
    // If they don't have a user type yet and not on onboarding, send them to onboarding
    if (!userType && !userRole && !isOnOnboardingPage) {
      return <Navigate to={`/${requiredUserType}/onboarding`} replace />;
    }
  }

  // If onboarding is required but not completed
  if (requireOnboarded && !isOnboarded && userType && !isOnOnboardingPage) {
    console.log("Onboarding required but not completed", { userType, isOnboarded });
    return <Navigate to={`/${userType}/onboarding`} replace />;
  }
  
  // If no user type but authenticated and not on onboarding page
  if (!userType && !userRole && currentUser && !isOnOnboardingPage) {
    console.log("No user type found, redirecting to seller onboarding");
    return <Navigate to="/seller/onboarding" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
