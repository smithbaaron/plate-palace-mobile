
import { useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/use-notifications";

interface NotificationDropdownProps {
  unreadCount: number;
}

// Mock notifications data - in a real app this would come from an API
const mockNotifications = [
  {
    id: "1",
    title: "New Order Received",
    message: "You have a new order for Jollof Rice",
    timestamp: "2 minutes ago",
    isRead: false,
    type: "order" as const,
  },
  {
    id: "2",
    title: "Payment Received",
    message: "Payment of $25.99 has been processed",
    timestamp: "1 hour ago",
    isRead: false,
    type: "payment" as const,
  },
  {
    id: "3",
    title: "Profile Updated",
    message: "Your seller profile has been successfully updated",
    timestamp: "Yesterday",
    isRead: true,
    type: "info" as const,
  },
];

const NotificationDropdown = ({ unreadCount }: NotificationDropdownProps) => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const { notifySuccess } = useNotifications();

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    notifySuccess("All notifications marked as read", "");
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const unreadNotifications = notifications.filter(notif => !notif.isRead);
  const currentUnreadCount = unreadNotifications.length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-white hover:text-nextplate-orange relative">
          <Bell size={20} />
          {currentUnreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 min-w-5 p-0 flex items-center justify-center rounded-full text-xs"
            >
              {currentUnreadCount > 9 ? "9+" : currentUnreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-black border-gray-700 shadow-xl z-[100] max-h-96 overflow-y-auto"
      >
        <div className="px-4 py-3 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Notifications</h3>
            {currentUnreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-nextplate-orange hover:text-orange-400 text-xs h-auto p-1"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-400">
            <Bell size={32} className="mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="py-2">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <DropdownMenuItem
                  className={`px-4 py-3 cursor-pointer focus:bg-gray-800 ${
                    !notification.isRead ? "bg-gray-900" : ""
                  }`}
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex items-start justify-between w-full gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-sm font-medium ${
                          !notification.isRead ? "text-white" : "text-gray-300"
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-nextplate-orange rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {notification.timestamp}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                        >
                          <Check size={12} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  </div>
                </DropdownMenuItem>
                {index < notifications.length - 1 && (
                  <DropdownMenuSeparator className="bg-gray-800" />
                )}
              </div>
            ))}
          </div>
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-gray-800" />
            <div className="px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-nextplate-orange hover:text-orange-400 justify-center"
                onClick={() => setIsOpen(false)}
              >
                View All Notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
