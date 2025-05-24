
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
  const [hasNavigated, setHasNavigated] = useState(false);
  
  // Handle navigation after authentication
  useEffect(() => {
    if (loading || hasNavigated) return;
    
    if (!isAuthenticated) {
      setHasNavigated(false);
      return;
    }
    
    console.log("Auth state in AuthPage:", { isAuthenticated, userType, isOnboarded, currentUser });
    
    // Prevent multiple navigation attempts
    if (hasNavigated) return;
    
    // If user has a complete profile, redirect to dashboard
    if (userType && isOnboarded) {
      const dashboardUrl = userType === "seller" ? "/seller/dashboard" : "/customer/dashboard";
      console.log(`Redirecting to ${dashboardUrl}`);
      setHasNavigated(true);
      navigate(dashboardUrl, { replace: true });
      return;
    }
    
    // If user has type but not onboarded, go to onboarding
    if (userType && !isOnboarded) {
      console.log(`Redirecting to /${userType}/onboarding`);
      setHasNavigated(true);
      navigate(`/${userType}/onboarding`, { replace: true });
      return;
    }
    
    // If authenticated but no user type, redirect to onboarding with default type
    if (currentUser && !userType) {
      console.log(`No user type found, redirecting to onboarding as ${defaultType}`);
      setHasNavigated(true);
      navigate(`/${defaultType}/onboarding`, { replace: true });
      return;
    }
  }, [isAuthenticated, userType, isOnboarded, loading, currentUser, defaultType, navigate, hasNavigated]);
  
  const handleLogin = async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", email);
      setHasNavigated(false); // Reset navigation flag
      await login(email, password);
      
      toast({
        title: "Login successful!",
        description: `Welcome back to NextPlate!`,
      });
      
      // Navigation will be handled by useEffect
    } catch (error: any) {
      console.error("Login error:", error);
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
      setHasNavigated(false); // Reset navigation flag
      const signupResult = await signup(email, password, username);
      
      if (!signupResult || !signupResult.user) {
        throw new Error("Account creation failed. Please try again.");
      }
      
      console.log("Signup successful");
      
      toast({
        title: "Account created!",
        description: `Welcome to NextPlate!`,
      });
      
      // Navigation will be handled by useEffect
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Don't render auth form if user is authenticated and we're about to redirect
  if (isAuthenticated && !hasNavigated) {
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
