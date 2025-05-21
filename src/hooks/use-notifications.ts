
import { useNotification, NotificationType, Notification } from "@/context/NotificationContext";

export const useNotifications = () => {
  const { showNotification } = useNotification();
  
  // Helper functions for each notification type
  const notifySuccess = (title: string, message: string) => {
    showNotification({ title, message, type: "success" });
  };
  
  const notifyError = (title: string, message: string) => {
    showNotification({ title, message, type: "error" });
  };
  
  const notifyWarning = (title: string, message: string) => {
    showNotification({ title, message, type: "warning" });
  };
  
  const notifyInfo = (title: string, message: string) => {
    showNotification({ title, message, type: "info" });
  };
  
  // General notify function that accepts a type
  const notify = (title: string, message: string, type: NotificationType = "info") => {
    showNotification({ title, message, type });
  };

  // Functions specifically for common app scenarios
  const notifyPlateAdded = (plateName: string) => {
    notifySuccess("Plate Added", `${plateName} has been added to your menu.`);
  };
  
  const notifyOrderStatusChanged = (orderId: string, newStatus: string) => {
    notifyInfo("Order Status Updated", `Order #${orderId} is now ${newStatus}.`);
  };
  
  return {
    notify,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    // App-specific notifications
    notifyPlateAdded,
    notifyOrderStatusChanged,
  };
};
