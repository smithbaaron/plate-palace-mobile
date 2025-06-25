
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
  
  const { login, signup, isAuthenticated, currentUser, supabaseUser, loading } = useAuth();
  const { userType, setUserType, isOnboarded } = useUserType();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Handle navigation after authentication
  useEffect(() => {
    // Don't redirect if we're still loading
    if (loading) {
      return;
    }
    
    if (isAuthenticated && currentUser) {
      console.log("User is authenticated, checking redirect path:", { userType, isOnboarded, currentUser });
      
      // For sellers, prioritize onboarding flow if not completed
      if (defaultType === "seller") {
        if (userType === "seller" && isOnboarded) {
          console.log("Seller is onboarded, redirecting to dashboard");
          navigate("/seller/dashboard", { replace: true });
          return;
        } else {
          console.log("Seller needs onboarding, redirecting to onboarding");
          navigate("/seller/onboarding", { replace: true });
          return;
        }
      }
      
      // For customers
      if (defaultType === "customer") {
        if (userType === "customer" && isOnboarded) {
          console.log("Customer is onboarded, redirecting to dashboard");
          navigate("/customer/dashboard", { replace: true });
          return;
        } else {
          console.log("Customer needs onboarding, redirecting to onboarding");
          navigate("/customer/onboarding", { replace: true });
          return;
        }
      }
      
      // Fallback - if no specific type is determined, use the URL type
      console.log(`Fallback redirect to ${defaultType} onboarding`);
      navigate(`/${defaultType}/onboarding`, { replace: true });
    }
  }, [isAuthenticated, userType, isOnboarded, loading, currentUser, defaultType, navigate]);
  
  const handleLogin = async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", email);
      await login(email, password);
      
      toast({
        title: "Login successful!",
        description: `Welcome back to NextPlate!`,
      });
      
      // The useEffect will handle the redirect
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
      const signupResult = await signup(email, password, username);
      
      if (!signupResult || !signupResult.user) {
        throw new Error("Account creation failed. Please try again.");
      }
      
      console.log("Signup successful");
      
      toast({
        title: "Account created!",
        description: `Welcome to NextPlate!`,
      });
      
      // The useEffect will handle the redirect
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
  
  // Show loading state while auth is loading (but with a timeout)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nextplate-orange mx-auto mb-4"></div>
          <div>Loading NextPlate...</div>
          <div className="text-sm text-gray-400 mt-2">
            If this takes too long, please refresh the page
          </div>
        </div>
      </div>
    );
  }
  
  // If authenticated, don't show the auth form - just redirect (handled by useEffect)
  if (isAuthenticated && currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nextplate-orange mx-auto mb-4"></div>
          <div>Redirecting to your dashboard...</div>
        </div>
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
