
import { useState, useEffect } from "react";
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
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface NotificationDropdownProps {
  unreadCount: number;
}

interface DatabaseNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: string;
}

const NotificationDropdown = ({ unreadCount }: NotificationDropdownProps) => {
  const [notifications, setNotifications] = useState<DatabaseNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { notifySuccess } = useNotifications();
  const { currentUser } = useAuth();

  // Fetch real notifications from database
  useEffect(() => {
    if (currentUser?.id) {
      fetchNotifications();
    }
  }, [currentUser?.id]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // For now, we'll return empty array since we don't have a notifications table yet
      // In the future, this would fetch from a notifications table
      console.log('📱 Fetching notifications for user:', currentUser?.id);
      
      // TODO: Implement actual notification fetching from database
      // const { data, error } = await supabase
      //   .from('notifications')
      //   .select('*')
      //   .eq('user_id', currentUser.id)
      //   .order('created_at', { ascending: false });
      
      setNotifications([]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // TODO: Update notification in database
      // await supabase
      //   .from('notifications')
      //   .update({ is_read: true })
      //   .eq('id', notificationId);
      
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // TODO: Update all notifications in database
      // await supabase
      //   .from('notifications')
      //   .update({ is_read: true })
      //   .eq('user_id', currentUser.id);
      
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      notifySuccess("All notifications marked as read", "");
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      // TODO: Delete notification from database
      // await supabase
      //   .from('notifications')
      //   .delete()
      //   .eq('id', notificationId);
      
      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
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

        {loading ? (
          <div className="px-4 py-6 text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nextplate-orange mx-auto mb-2"></div>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
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
