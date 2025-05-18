
import { useContext } from "react";
import { UserTypeContext } from "@/context/UserTypeContext";

/**
 * Hook for accessing the UserType context
 * @returns The UserType context
 * @throws Error if used outside a UserTypeProvider
 */
export const useUserType = () => {
  const context = useContext(UserTypeContext);
  if (!context) {
    throw new Error("useUserType must be used within a UserTypeProvider");
  }
  return context;
};
