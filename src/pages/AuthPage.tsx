import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserType } from "@/hooks/useUserTypeContext";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import AuthContainer from "@/components/auth/AuthContainer";

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get("type") || "seller";
  
  const { login, signup, isAuthenticated, supabaseUser, loading } = useAuth();
  const { userType, isOnboarded } = useUserType();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  console.log("🎯 AuthPage render - loading:", loading, "isAuthenticated:", isAuthenticated, "userType:", userType, "isOnboarded:", isOnboarded);
  
  // Simple redirect logic for authenticated users
  useEffect(() => {
    console.log("🔄 AuthPage useEffect - loading:", loading, "isAuthenticated:", isAuthenticated);
    
    if (loading || !isAuthenticated) {
      console.log("⏳ Still loading or not authenticated, waiting...");
      return;
    }
    
    const userRole = supabaseUser?.user_metadata?.role || supabaseUser?.app_metadata?.role;
    console.log("👤 User role from metadata:", userRole, "userType:", userType, "isOnboarded:", isOnboarded);
    
    // Priority 1: If user has type and is onboarded, go to dashboard
    if (userType && isOnboarded) {
      const dashboardUrl = userType === "seller" ? "/seller/dashboard" : "/customer/dashboard";
      console.log("✅ User is onboarded with type, redirecting to:", dashboardUrl);
      navigate(dashboardUrl, { replace: true });
      return;
    }
    
    // Priority 2: If user has type but not onboarded, go to onboarding
    if (userType && !isOnboarded) {
      console.log("📋 User has type but not onboarded, redirecting to onboarding:", userType);
      navigate(`/${userType}/onboarding`, { replace: true });
      return;
    }
    
    // Priority 3: If user has role metadata, use that
    if (userRole) {
      if (userRole === "seller") {
        console.log("🏪 Seller role detected, redirecting to seller onboarding");
        navigate("/seller/onboarding", { replace: true });
      } else if (userRole === "customer") {
        console.log("🛒 Customer role detected, redirecting to customer dashboard");
        navigate("/customer/dashboard", { replace: true });
      }
      return;
    }
    
    // Priority 4: Default to the type specified in URL params
    console.log(`🔄 No specific user data, defaulting to ${defaultType} onboarding`);
    navigate(`/${defaultType}/onboarding`, { replace: true });
    
  }, [isAuthenticated, userType, isOnboarded, loading, supabaseUser, navigate]);
  
  const handleLogin = async (email: string, password: string) => {
    try {
      console.log("🔐 Handling login for:", email);
      await login(email, password);
      toast({
        title: "Login successful!",
        description: "Welcome back to NextPlate!",
      });
    } catch (error: any) {
      console.error("💥 Login error:", error);
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
      console.log("📝 Handling signup for:", email, username);
      const signupResult = await signup(email, password, username);
      
      if (!signupResult?.user) {
        throw new Error("Account creation failed. Please try again.");
      }
      
      toast({
        title: "Account created!",
        description: "Welcome to NextPlate!",
      });
    } catch (error: any) {
      console.error("💥 Signup error:", error);
      toast({
        title: "Signup failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Show loading state
  if (loading) {
    console.log("⏳ Showing loading state");
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nextplate-orange mx-auto mb-4"></div>
          <div>Loading NextPlate...</div>
        </div>
      </div>
    );
  }
  
  // Show redirecting state for authenticated users
  if (isAuthenticated) {
    console.log("🔄 Showing redirecting state");
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nextplate-orange mx-auto mb-4"></div>
          <div>Redirecting...</div>
        </div>
      </div>
    );
  }
  
  console.log("📋 Showing auth form");
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
