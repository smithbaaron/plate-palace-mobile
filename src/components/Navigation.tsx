
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserType } from "@/context/UserTypeContext";

// Import refactored components
import NavigationLogo from "@/components/navigation/NavigationLogo";
import DesktopNavigation from "@/components/navigation/DesktopNavigation";
import MobileNavigation from "@/components/navigation/MobileNavigation";
import MobileBottomNavigation from "@/components/navigation/MobileBottomNavigation";

const Navigation = () => {
  const { isAuthenticated, logout, currentUser } = useAuth();
  const { userType } = useUserType();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  // Close menu when changing routes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Fetch real notification count
  useEffect(() => {
    if (currentUser?.id) {
      fetchUnreadNotificationCount();
    }
  }, [currentUser?.id]);

  const fetchUnreadNotificationCount = async () => {
    try {
      // TODO: Implement actual unread count fetching from database
      // const { count } = await supabase
      //   .from('notifications')
      //   .select('*', { count: 'exact', head: true })
      //   .eq('user_id', currentUser.id)
      //   .eq('is_read', false);
      
      // For now, set to 0 since we don't have notifications yet
      setUnreadNotifications(0);
    } catch (error) {
      console.error('Error fetching notification count:', error);
      setUnreadNotifications(0);
    }
  };
  
  // Determine dashboard URL based on user type
  const dashboardUrl = userType === "seller" ? "/seller/dashboard" : "/customer/dashboard";
  
  const handleLogout = async () => {
    await logout();
    // This will automatically redirect to auth page via the auth context
  };
  
  return (
    <nav className="fixed w-full z-50 bg-black bg-opacity-90 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <NavigationLogo />
          
          <DesktopNavigation 
            isAuthenticated={isAuthenticated}
            userType={userType}
            dashboardUrl={dashboardUrl}
            unreadNotifications={unreadNotifications}
            handleLogout={handleLogout}
          />
          
          <MobileNavigation 
            isAuthenticated={isAuthenticated}
            userType={userType}
            dashboardUrl={dashboardUrl}
            isOpen={isOpen}
            toggleMenu={toggleMenu}
            handleLogout={handleLogout}
          />
        </div>
      </div>
      
      <MobileBottomNavigation 
        isAuthenticated={isAuthenticated}
        userType={userType}
        dashboardUrl={dashboardUrl}
        unreadNotifications={unreadNotifications}
      />
    </nav>
  );
};

export default Navigation;
