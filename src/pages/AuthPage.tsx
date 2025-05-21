
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
      const signupResult = await signup(email, password, username);
      
      // Fix: Check if signupResult exists and has user property before accessing it
      if (!signupResult || !signupResult.user) {
        console.error("Signup returned no user");
        toast({
          title: "Signup Error",
          description: "Account creation failed. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Signup successful, waiting for auth state to update");
      
      // Give more time for Supabase to complete the signup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Force refresh auth state to make sure we have the latest user data
      let authSuccess = false;
      let retryCount = 0;
      
      while (!authSuccess && retryCount < 3) {
        console.log(`Attempt ${retryCount + 1} to refresh auth state`);
        authSuccess = await checkAndResyncAuth();
        if (!authSuccess) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!authSuccess) {
        console.error("Signup was successful but could not retrieve user data");
        toast({
          title: "Partial Success",
          description: "Account created, but we had trouble setting up your profile. Please try logging in.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Auth refreshed after signup");
      
      // Also sync user type data before setting new user type
      await resyncUserTypeData();
      
      // Set user type with improved retry mechanism
      const selectedType = defaultType as UserType;
      let typeSetSuccess = false;
      let typeRetryCount = 0;
      
      while (!typeSetSuccess && typeRetryCount < 5) {
        try {
          console.log(`Attempt ${typeRetryCount + 1} to set user type to ${selectedType}`);
          await setUserType(selectedType);
          typeSetSuccess = true;
          console.log("User type set successfully");
        } catch (error) {
          typeRetryCount++;
          console.error(`Error setting user type (attempt ${typeRetryCount})`, error);
          if (typeRetryCount >= 5) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * typeRetryCount));
        }
      }
      
      if (typeSetSuccess) {
        toast({
          title: "Account created!",
          description: `Welcome to NextPlate as a ${defaultType}!`,
        });
      } else {
        // Even if setting user type fails, the account was created
        toast({
          title: "Account created!",
          description: `Welcome to NextPlate! We had trouble setting your user type, but you can try again.`,
        });
      }
      
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
