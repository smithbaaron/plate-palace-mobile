
import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "./AuthContext";
import { UserType, getUserTypeData, updateUserType, completeUserOnboarding } from "@/lib/userTypeUtils";

interface UserTypeContextType {
  userType: UserType;
  setUserType: (type: UserType) => Promise<void>;
  isOnboarded: boolean;
  completeOnboarding: () => Promise<void>;
  resyncUserTypeData: () => Promise<void>;
  navigateToAuth: () => void;
}

const UserTypeContext = createContext<UserTypeContextType | undefined>(undefined);

export const useUserType = () => {
  const context = useContext(UserTypeContext);
  if (!context) {
    throw new Error("useUserType must be used within a UserTypeProvider");
  }
  return context;
};

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

      // Get fresh data from the database with retry mechanism
      const maxRetries = 3;
      let retryCount = 0;
      let userData;
      
      while (retryCount < maxRetries) {
        try {
          userData = await getUserTypeData(currentUser.id);
          console.log("Resynced user type data:", userData);
          break;
        } catch (error) {
          retryCount++;
          console.warn(`Failed to get user data, retry ${retryCount}/${maxRetries}`);
          if (retryCount >= maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      if (userData) {
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
      
      // Update the user in Supabase with retry mechanism
      let success = false;
      const maxRetries = 3;
      let retryCount = 0;
      
      while (retryCount < maxRetries && !success) {
        try {
          success = await updateUserType(currentUser.id, type);
          if (!success) throw new Error("Failed to update user type");
          break;
        } catch (error) {
          retryCount++;
          console.warn(`Failed to update user type, retry ${retryCount}/${maxRetries}`);
          if (retryCount >= maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      if (!success) {
        // Revert state if update fails
        console.error("Failed to update user type in database after retries");
        setUserTypeState(null);
        throw new Error("Failed to update user type");
      }
      
      // After successful update, refresh user data to ensure consistency
      await resyncUserTypeData();
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
      
      // Update the user in Supabase with retry mechanism
      let success = false;
      const maxRetries = 3;
      let retryCount = 0;
      
      while (retryCount < maxRetries && !success) {
        try {
          success = await completeUserOnboarding(currentUser.id);
          if (!success) throw new Error("Failed to complete onboarding");
          break;
        } catch (error) {
          retryCount++;
          console.warn(`Failed to update onboarding status, retry ${retryCount}/${maxRetries}`);
          if (retryCount >= maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
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
