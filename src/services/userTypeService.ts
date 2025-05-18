
import { getUserTypeData, updateUserType, completeUserOnboarding } from "@/lib/userTypeUtils";
import { UserType } from "@/lib/userTypeUtils";

/**
 * Fetch user type data from backend with retry mechanism
 * @param userId User ID to fetch data for
 * @returns User type data or null
 */
export const fetchUserTypeData = async (userId: string | undefined) => {
  try {
    if (!userId) {
      console.log("Cannot sync user type data - no user ID provided");
      return null;
    }

    // Get fresh data from the database with retry mechanism
    const maxRetries = 3;
    let retryCount = 0;
    let userData;
    
    while (retryCount < maxRetries) {
      try {
        userData = await getUserTypeData(userId);
        console.log("Fetched user type data:", userData);
        break;
      } catch (error) {
        retryCount++;
        console.warn(`Failed to get user data, retry ${retryCount}/${maxRetries}`, error);
        if (retryCount >= maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 500 * retryCount)); // Increasing backoff
      }
    }
    
    return userData;
  } catch (error) {
    console.error("Error fetching user type data:", error);
    return null;
  }
};

/**
 * Update a user's type with retry mechanism
 * @param userId User ID to update
 * @param type New user type
 * @returns Success status
 */
export const updateUserTypeWithRetry = async (userId: string | undefined, type: UserType) => {
  if (!userId) {
    console.error("No user ID provided when updating user type");
    throw new Error("No user ID");
  }
  
  // Update the user in database with retry mechanism
  let success = false;
  const maxRetries = 5; // Increased from 3
  let retryCount = 0;
  
  while (retryCount < maxRetries && !success) {
    try {
      console.log(`Attempt ${retryCount + 1}/${maxRetries} to update user type for ${userId} to ${type}`);
      success = await updateUserType(userId, type);
      if (!success) throw new Error("Failed to update user type");
      console.log(`Successfully updated user type for ${userId} to ${type}`);
      break;
    } catch (error) {
      retryCount++;
      console.warn(`Failed to update user type, retry ${retryCount}/${maxRetries}`, error);
      if (retryCount >= maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 700 * retryCount)); // Increasing backoff
    }
  }
  
  return success;
};

/**
 * Complete user onboarding with retry mechanism
 * @param userId User ID to update
 * @returns Success status
 */
export const completeOnboardingWithRetry = async (userId: string | undefined) => {
  if (!userId) {
    console.error("No user ID provided when completing onboarding");
    throw new Error("No user ID");
  }
  
  // Update onboarding status with retry mechanism
  let success = false;
  const maxRetries = 5; // Increased from 3
  let retryCount = 0;
  
  while (retryCount < maxRetries && !success) {
    try {
      console.log(`Attempt ${retryCount + 1}/${maxRetries} to complete onboarding for ${userId}`);
      success = await completeUserOnboarding(userId);
      if (!success) throw new Error("Failed to complete onboarding");
      console.log(`Successfully completed onboarding for ${userId}`);
      break;
    } catch (error) {
      retryCount++;
      console.warn(`Failed to update onboarding status, retry ${retryCount}/${maxRetries}`, error);
      if (retryCount >= maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 700 * retryCount)); // Increasing backoff
    }
  }
  
  return success;
};
