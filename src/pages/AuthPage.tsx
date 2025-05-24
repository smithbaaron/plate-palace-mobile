
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserType } from "@/hooks/useUserTypeContext";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { UserType } from "@/lib/userTypeUtils";
import AuthContainer from "@/components/auth/AuthContainer";

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get("type") || "seller";
  
  const { login, signup, isAuthenticated, currentUser, loading } = useAuth();
  const { userType, setUserType, isOnboarded } = useUserType();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Handle navigation after authentication
  useEffect(() => {
    // Don't navigate if still loading or already navigating
    if (loading || isNavigating) return;
    
    // Only proceed if authenticated
    if (!isAuthenticated || !currentUser) {
      setIsNavigating(false);
      return;
    }
    
    console.log("Auth state in AuthPage:", { isAuthenticated, userType, isOnboarded, currentUser });
    
    // Set navigation flag to prevent multiple attempts
    setIsNavigating(true);
    
    // Add a small delay to ensure state is stable
    const navigateTimeout = setTimeout(() => {
      // If user has a complete profile, redirect to dashboard
      if (userType && isOnboarded) {
        const dashboardUrl = userType === "seller" ? "/seller/dashboard" : "/customer/dashboard";
        console.log(`Redirecting authenticated user to ${dashboardUrl}`);
        navigate(dashboardUrl, { replace: true });
        return;
      }
      
      // If user has type but not onboarded, go to onboarding
      if (userType && !isOnboarded) {
        console.log(`Redirecting to /${userType}/onboarding`);
        navigate(`/${userType}/onboarding`, { replace: true });
        return;
      }
      
      // If authenticated but no user type, redirect to onboarding with default type
      if (!userType) {
        console.log(`No user type found, redirecting to onboarding as ${defaultType}`);
        navigate(`/${defaultType}/onboarding`, { replace: true });
        return;
      }
    }, 100);
    
    return () => {
      clearTimeout(navigateTimeout);
    };
  }, [isAuthenticated, userType, isOnboarded, loading, currentUser, defaultType, navigate, isNavigating]);
  
  const handleLogin = async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", email);
      setIsNavigating(false); // Reset navigation flag before login
      await login(email, password);
      
      toast({
        title: "Login successful!",
        description: `Welcome back to NextPlate!`,
      });
      
      // Navigation will be handled by useEffect after auth state updates
    } catch (error: any) {
      console.error("Login error:", error);
      setIsNavigating(false);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const handleSignup = async (email: string, password: string, username: string) => {
    try {
      console.log("Attempting signup with:", email, username);
      setIsNavigating(false); // Reset navigation flag before signup
      const signupResult = await signup(email, password, username);
      
      if (!signupResult || !signupResult.user) {
        throw new Error("Account creation failed. Please try again.");
      }
      
      console.log("Signup successful");
      
      toast({
        title: "Account created!",
        description: `Welcome to NextPlate!`,
      });
      
      // Navigation will be handled by useEffect after auth state updates
    } catch (error: any) {
      console.error("Signup error:", error);
      setIsNavigating(false);
      toast({
        title: "Signup failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Show loading state while checking auth or navigating
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  
  // Show redirecting state if authenticated and about to navigate
  if (isAuthenticated && isNavigating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse">Redirecting to dashboard...</div>
      </div>
    );
  }
  
  // Don't show auth form if user is authenticated and should be redirected
  if (isAuthenticated && (userType || currentUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse">Redirecting...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="pt-24 pb-20 px-4">
        <AuthContainer
          defaultType={defaultType}
          onLogin={handleLogin}
          onSignup={handleSignup}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default AuthPage;
