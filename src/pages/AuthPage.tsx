
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
  const { userType, isOnboarded } = useUserType();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [redirectTimeout, setRedirectTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Simplified redirect logic with timeout
  useEffect(() => {
    // Clear any existing timeout
    if (redirectTimeout) {
      clearTimeout(redirectTimeout);
    }

    // Don't redirect if still loading
    if (loading) {
      return;
    }
    
    if (isAuthenticated && currentUser) {
      console.log("User authenticated, preparing redirect...");
      
      // Set a timeout to ensure redirect happens even if logic gets complex
      const timeout = setTimeout(() => {
        console.log("Redirect timeout - forcing navigation");
        const fallbackUrl = defaultType === "customer" ? "/customer/dashboard" : "/seller/dashboard";
        navigate(fallbackUrl, { replace: true });
      }, 2000);
      
      setRedirectTimeout(timeout);
      
      // Quick redirect logic
      if (userType && isOnboarded) {
        const dashboardUrl = userType === "seller" ? "/seller/dashboard" : "/customer/dashboard";
        console.log(`Redirecting to ${dashboardUrl}`);
        navigate(dashboardUrl, { replace: true });
        return;
      }
      
      if (userType && !isOnboarded) {
        console.log(`Redirecting to /${userType}/onboarding`);
        navigate(`/${userType}/onboarding`, { replace: true });
        return;
      }
      
      const userRole = supabaseUser?.user_metadata?.role || supabaseUser?.app_metadata?.role;
      if (userRole === "customer") {
        navigate("/customer/dashboard", { replace: true });
        return;
      } else if (userRole === "seller") {
        navigate("/seller/onboarding", { replace: true });
        return;
      }
      
      // Default fallback
      navigate(`/${defaultType}/onboarding`, { replace: true });
    }

    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [isAuthenticated, userType, isOnboarded, loading, currentUser, supabaseUser, defaultType, navigate]);
  
  const handleLogin = async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", email);
      await login(email, password);
      
      toast({
        title: "Login successful!",
        description: `Welcome back to NextPlate!`,
      });
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
  
  // Show loading state with timeout
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nextplate-orange mx-auto mb-4"></div>
          <div>Loading NextPlate...</div>
        </div>
      </div>
    );
  }
  
  // If authenticated, show brief redirect message
  if (isAuthenticated && currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nextplate-orange mx-auto mb-4"></div>
          <div>Redirecting...</div>
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
