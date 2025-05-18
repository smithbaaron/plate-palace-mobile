
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
  const { isAuthenticated, loading, currentUser, checkAndResyncAuth } = useAuth();
  const { userType, isOnboarded, resyncUserTypeData } = useUserType();
  const [isChecking, setIsChecking] = useState(true);
  const [checkCount, setCheckCount] = useState(0);
  const location = useLocation();

  // Sync auth state on mount or when route changes, with safety check to prevent infinite loops
  useEffect(() => {
    let isMounted = true;
    
    const syncAuthState = async () => {
      if (!isMounted) return;
      
      if (checkCount > 5) {
        // Safety check to prevent infinite checking
        console.warn("Auth check count exceeded limit, stopping checks");
        setIsChecking(false);
        return;
      }
      
      setIsChecking(true);
      await checkAndResyncAuth();
      await resyncUserTypeData();
      
      if (isMounted) {
        setIsChecking(false);
        setCheckCount(prev => prev + 1);
      }
    };
    
    syncAuthState();
    
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  // Show loading state only if initial auth check is happening
  if (loading && checkCount === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // Don't show loading for subsequent checks to prevent freezing
  if (isChecking && checkCount > 0) {
    console.log("Checking auth state...");
  }

  // If not authenticated after checks complete, redirect to login
  if (!isAuthenticated && !loading && !isChecking) {
    console.log("Not authenticated, redirecting to auth");
    return <Navigate to={`/auth${requiredUserType ? `?type=${requiredUserType}` : ''}`} state={{ from: location }} replace />;
  }

  // If user type is required but doesn't match
  if (requiredUserType && userType !== requiredUserType && !loading && !isChecking) {
    console.log("User type mismatch", { required: requiredUserType, current: userType });
    
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
  if (requireOnboarded && !isOnboarded && userType && !loading && !isChecking) {
    console.log("Onboarding required but not completed", { userType, isOnboarded });
    return <Navigate to={`/${userType}/onboarding`} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
