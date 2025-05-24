
import React, { useEffect } from "react";
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
  
  const { login, signup, isAuthenticated, currentUser, loading, checkAndResyncAuth } = useAuth();
  const { userType, setUserType, isOnboarded, resyncUserTypeData } = useUserType();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Simplified navigation logic to prevent infinite loops
  useEffect(() => {
    if (loading) return;
    
    if (!isAuthenticated) return;
    
    console.log("Auth state in AuthPage:", { isAuthenticated, userType, isOnboarded, currentUser });
    
    // If we have user type information, redirect accordingly
    if (userType) {
      if (!isOnboarded) {
        console.log(`Redirecting to /${userType}/onboarding`);
        navigate(`/${userType}/onboarding`, { replace: true });
      } else {
        const dashboardUrl = userType === "seller" ? "/seller/dashboard" : "/customer/dashboard";
        console.log(`Redirecting to ${dashboardUrl}`);
        navigate(dashboardUrl, { replace: true });
      }
    } 
    // If authenticated but no user type yet, redirect to onboarding with default type
    else if (currentUser) {
      console.log(`No user type found, redirecting to onboarding as ${defaultType}`);
      navigate(`/${defaultType}/onboarding`, { replace: true });
    }
  }, [isAuthenticated, userType, isOnboarded, loading, currentUser, defaultType, navigate]);
  
  const handleLogin = async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", email);
      await login(email, password);
      
      // Give time for auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Login successful!",
        description: `Welcome back to NextPlate!`,
      });
      
      // Navigation will be handled by useEffect
    } catch (error: any) {
      console.error("Login error:", error);
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
      
      // Give time for auth state to update
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Account created!",
        description: `Welcome to NextPlate!`,
      });
      
      // Navigation will be handled by useEffect
    } catch (error: any) {
      console.error("Signup error:", error);
      throw error;
    }
  };
  
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
