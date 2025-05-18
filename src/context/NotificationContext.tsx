
import React, { createContext, useContext, ReactNode } from "react";
import { toast } from "sonner";

// Types of notifications
export type NotificationType = "success" | "error" | "warning" | "info";

// Shape of a notification
export interface Notification {
  id?: string;
  title: string;
  message: string;
  type: NotificationType;
}

// Context interface
interface NotificationContextType {
  showNotification: (notification: Notification) => void;
  // Future real-time push notification methods
  registerDevice?: (token: string) => Promise<void>;
  unregisterDevice?: (token: string) => Promise<void>;
}

// Create the context with default values
const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
});

// Custom hook to use the notification context
export const useNotification = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // Function to display notifications using sonner
  const showNotification = ({ title, message, type }: Notification) => {
    switch (type) {
      case "success":
        toast.success(title, {
          description: message,
          className: "bg-green-50 border-green-200 text-green-800",
        });
        break;
      case "error":
        toast.error(title, {
          description: message,
          className: "bg-red-50 border-red-200 text-red-800",
        });
        break;
      case "warning":
        toast.warning(title, { 
          description: message,
          className: "bg-amber-50 border-amber-200 text-amber-800",
        });
        break;
      case "info":
      default:
        toast.info(title, { 
          description: message,
          className: "bg-blue-50 border-blue-200 text-blue-800",
        });
        break;
    }
  };

  // Future implementation for real-time push notifications
  const registerDevice = async (token: string) => {
    console.log("Device registration functionality will be implemented here", token);
    // In the future, this will call an API to register the device token
  };

  const unregisterDevice = async (token: string) => {
    console.log("Device unregistration functionality will be implemented here", token);
    // In the future, this will call an API to unregister the device token
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        showNotification,
        registerDevice, 
        unregisterDevice 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
