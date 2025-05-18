
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserType } from "@/context/UserTypeContext";
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
  
  // Simplified and more reliable navigation logic
  useEffect(() => {
    if (loading) return; // Skip while loading
    
    if (!isAuthenticated) return; // Skip if not authenticated
    
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
    // If authenticated but no user type yet, set the default type and redirect to onboarding
    else if (currentUser) {
      console.log(`Setting user type to ${defaultType} and redirecting to onboarding`);
      setUserType(defaultType as UserType)
        .then(() => {
          console.log("User type set successfully, redirecting to onboarding");
          navigate(`/${defaultType}/onboarding`, { replace: true });
        })
        .catch(error => {
          console.error("Error setting user type:", error);
          toast({
            title: "Error",
            description: "Failed to set user type. Please try again.",
            variant: "destructive",
          });
        });
    }
  }, [isAuthenticated, userType, isOnboarded, loading, currentUser]);
  
  const handleLogin = async (email: string, password: string) => {
    try {
      // Attempt login
      console.log("Attempting login with:", email);
      await login(email, password);
      
      // Give more time for auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force refresh auth state to make sure we have the latest user data
      const authSuccess = await checkAndResyncAuth();
      
      if (authSuccess) {
        // Also sync user type data
        await resyncUserTypeData();
        
        toast({
          title: "Login successful!",
          description: `Welcome back to NextPlate!`,
        });
        
        // The useEffect hook will handle redirection once auth state updates
      } else {
        throw new Error("Login failed. Could not retrieve user data.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw error; // Re-throw for the form component to handle
    }
  };
  
  const handleSignup = async (email: string, password: string, username: string) => {
    try {
      console.log("Attempting signup with:", email, username);
      await signup(email, password, username);
      
      // Give more time for Supabase to complete the signup process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Force refresh auth state to make sure we have the latest user data
      const authSuccess = await checkAndResyncAuth();
      
      if (!authSuccess) {
        throw new Error("Signup was successful but could not retrieve user data.");
      }
      
      console.log("Auth refreshed after signup:", { currentUser: authSuccess });
      
      // Also sync user type data before setting new user type
      await resyncUserTypeData();
      
      // Set user type with improved retry mechanism
      const selectedType = defaultType as UserType;
      let typeSetSuccess = false;
      let retryCount = 0;
      
      while (!typeSetSuccess && retryCount < 3) {
        try {
          console.log(`Attempt ${retryCount + 1} to set user type to ${selectedType}`);
          await setUserType(selectedType);
          typeSetSuccess = true;
          console.log("User type set successfully");
        } catch (error) {
          retryCount++;
          console.error(`Error setting user type (attempt ${retryCount})`, error);
          if (retryCount >= 3) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
      toast({
        title: "Account created!",
        description: `Welcome to NextPlate as a ${defaultType}!`,
      });
      
      // The useEffect hook will handle redirection once auth state updates
    } catch (error: any) {
      console.error("Signup error:", error);
      throw error; // Re-throw for the form component to handle
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
