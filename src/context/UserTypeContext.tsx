
import React, { createContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { UserType } from "@/lib/userTypeUtils";
import { fetchUserTypeData, updateUserTypeWithRetry, completeOnboardingWithRetry } from "@/services/userTypeService";
// Re-export the hook from here to maintain backward compatibility
export { useUserType } from "@/hooks/useUserTypeContext";

interface UserTypeContextType {
  userType: UserType;
  setUserType: (type: UserType) => Promise<void>;
  isOnboarded: boolean;
  completeOnboarding: () => Promise<void>;
  resyncUserTypeData: () => Promise<void>;
  navigateToAuth: () => void;
}

export const UserTypeContext = createContext<UserTypeContextType | undefined>(undefined);

interface UserTypeProviderProps {
  children: React.ReactNode;
  navigateToAuth?: () => void;
}

export const UserTypeProvider: React.FC<UserTypeProviderProps> = ({ 
  children, 
  navigateToAuth = () => window.location.href = '/auth'
}) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [userType, setUserTypeState] = useState<UserType>(currentUser?.userType || null);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(currentUser?.isOnboarded || false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Resync user type data from backend
  const resyncUserTypeData = async () => {
    try {
      if (!isAuthenticated || !currentUser) {
        console.log("Cannot sync user type data - not authenticated or no current user");
        setUserTypeState(null);
        setIsOnboarded(false);
        return;
      }

      const userData = await fetchUserTypeData(currentUser.id);
      
      if (userData) {
        console.log("Synced user type data:", userData);
        setUserTypeState(userData.userType);
        setIsOnboarded(userData.isOnboarded);
      }
    } catch (error) {
      console.error("Error syncing user type data:", error);
    } finally {
      setIsInitialized(true);
    }
  };

  // Update state when currentUser changes
  useEffect(() => {
    if (currentUser) {
      console.log("Current user updated in UserTypeContext:", currentUser);
      setUserTypeState(currentUser.userType);
      setIsOnboarded(currentUser.isOnboarded || false);
      setIsInitialized(true);
    } else if (isInitialized) {
      console.log("Current user is null in UserTypeContext");
      setUserTypeState(null);
      setIsOnboarded(false);
    }
  }, [currentUser]);

  // Initial sync on mount and when auth state changes
  useEffect(() => {
    console.log("Auth state in UserTypeContext:", { isAuthenticated });
    if (isAuthenticated) {
      resyncUserTypeData();
    } else {
      // Ensure we reset state when not authenticated
      setUserTypeState(null);
      setIsOnboarded(false);
    }
  }, [isAuthenticated]);

  const setUserType = async (type: UserType) => {
    try {
      console.log("Setting user type to:", type);
      
      // First check if we have a current user
      if (!currentUser) {
        console.error("No current user found when setting user type");
        throw new Error("No current user");
      }
      
      // Set the state first for immediate UI update
      setUserTypeState(type);
      
      // Add a delay before updating to ensure auth state is stable
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const success = await updateUserTypeWithRetry(currentUser.id, type);
      
      if (!success) {
        // Revert state if update fails
        console.error("Failed to update user type in database after retries");
        setUserTypeState(null);
        throw new Error("Failed to update user type");
      }
      
      // After successful update, refresh user data to ensure consistency
      await resyncUserTypeData();
      
      return; // Explicitly return to indicate success
    } catch (error) {
      console.error("Error setting user type:", error);
      throw error;
    }
  };

  const completeOnboarding = async () => {
    try {
      console.log("Completing onboarding");
      
      // Check if we have a current user
      if (!currentUser) {
        console.error("No current user found when completing onboarding");
        throw new Error("No current user");
      }
      
      // Set the state first for immediate UI update
      setIsOnboarded(true);
      
      const success = await completeOnboardingWithRetry(currentUser.id);
      
      if (!success) {
        // Revert state if update fails
        setIsOnboarded(false);
        throw new Error("Failed to complete onboarding");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      throw error;
    }
  };

  return (
    <UserTypeContext.Provider value={{ 
      userType, 
      setUserType, 
      isOnboarded, 
      completeOnboarding, 
      resyncUserTypeData,
      navigateToAuth 
    }}>
      {children}
    </UserTypeContext.Provider>
  );
};
