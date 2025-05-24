
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
  const { isAuthenticated, loading, currentUser } = useAuth();
  const { userType, isOnboarded } = useUserType();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const location = useLocation();

  // Complete initial check after a short delay to allow auth state to stabilize
  useEffect(() => {
    if (!loading) {
      const timeoutId = setTimeout(() => {
        setInitialCheckDone(true);
      }, 500);
      
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

  // If user type is required but doesn't match
  if (requiredUserType && userType !== requiredUserType) {
    console.log("User type mismatch", { required: requiredUserType, current: userType });
    
    // If they have a different user type, send them to their correct dashboard
    if (userType === 'seller' && isOnboarded) {
      return <Navigate to="/seller/dashboard" replace />;
    } else if (userType === 'customer' && isOnboarded) {
      return <Navigate to="/customer/dashboard" replace />;
    } else if (userType && !isOnboarded) {
      return <Navigate to={`/${userType}/onboarding`} replace />;
    }
    
    // If they don't have a user type yet, send them to onboarding with the required type
    return <Navigate to={`/${requiredUserType}/onboarding`} replace />;
  }

  // If onboarding is required but not completed
  if (requireOnboarded && !isOnboarded && userType) {
    console.log("Onboarding required but not completed", { userType, isOnboarded });
    return <Navigate to={`/${userType}/onboarding`} replace />;
  }
  
  // If no user type but authenticated, redirect to onboarding
  if (!userType && currentUser) {
    console.log("No user type found, redirecting to onboarding");
    return <Navigate to="/seller/onboarding" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
