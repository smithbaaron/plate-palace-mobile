
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
  const { userType, isOnboarded } = useUserType();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const location = useLocation();

  // Perform initial check only once when component mounts
  useEffect(() => {
    const performInitialCheck = async () => {
      if (!loading) {
        // If we're not sure about authentication state, double-check it
        if (!isAuthenticated && currentUser === null) {
          console.log("Resyncing auth state in ProtectedRoute");
          await checkAndResyncAuth();
        }
        setInitialCheckDone(true);
      }
    };
    
    performInitialCheck();
  }, [loading, isAuthenticated, currentUser]);

  // Show loading state only during initial auth check
  if (loading && !initialCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // Only proceed with checks after the initial auth check is complete
  if (!initialCheckDone) return null;

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to auth");
    return <Navigate to={`/auth${requiredUserType ? `?type=${requiredUserType}` : ''}`} state={{ from: location }} replace />;
  }

  // If user type is required but doesn't match
  if (requiredUserType && userType !== requiredUserType) {
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
  if (requireOnboarded && !isOnboarded && userType) {
    console.log("Onboarding required but not completed", { userType, isOnboarded });
    return <Navigate to={`/${userType}/onboarding`} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
