
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";

type UserType = "seller" | "customer" | null;

interface UserTypeContextType {
  userType: UserType;
  setUserType: (type: UserType) => void;
  isOnboarded: boolean;
  completeOnboarding: () => void;
}

const UserTypeContext = createContext<UserTypeContextType | undefined>(undefined);

export const useUserType = () => {
  const context = useContext(UserTypeContext);
  if (!context) {
    throw new Error("useUserType must be used within a UserTypeProvider");
  }
  return context;
};

export const UserTypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [userType, setUserTypeState] = useState<UserType>(currentUser?.userType || null);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(currentUser?.isOnboarded || false);

  useEffect(() => {
    if (currentUser) {
      setUserTypeState(currentUser.userType);
      setIsOnboarded(currentUser.isOnboarded);
    } else {
      setUserTypeState(null);
      setIsOnboarded(false);
    }
  }, [currentUser]);

  const setUserType = async (type: UserType) => {
    setUserTypeState(type);
    
    // Update the user in Supabase
    if (currentUser) {
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: type })
        .eq('id', currentUser.id);
        
      if (error) {
        console.error("Error updating user type:", error);
      }
    }
  };

  const completeOnboarding = async () => {
    setIsOnboarded(true);
    
    // Update the user in Supabase
    if (currentUser) {
      const { error } = await supabase
        .from('profiles')
        .update({ is_onboarded: true })
        .eq('id', currentUser.id);
        
      if (error) {
        console.error("Error completing onboarding:", error);
      }
    }
  };

  return (
    <UserTypeContext.Provider value={{ userType, setUserType, isOnboarded, completeOnboarding }}>
      {children}
    </UserTypeContext.Provider>
  );
};
