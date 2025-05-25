
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Home, Package, Calendar, Bell } from "lucide-react";

interface MobileBottomNavigationProps {
  isAuthenticated: boolean;
  userType: string | null;
  dashboardUrl: string;
  unreadNotifications: number;
}

const MobileBottomNavigation = ({ 
  isAuthenticated, 
  userType, 
  dashboardUrl, 
  unreadNotifications 
}: MobileBottomNavigationProps) => {
  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-90 backdrop-blur-lg border-t border-gray-800 md:hidden">
      <div className="grid grid-cols-4 h-16">
        <Link to={dashboardUrl} className="flex-center flex-col text-xs text-white hover:text-nextplate-orange">
          <Home size={20} />
          <span className="mt-1">Home</span>
        </Link>
        {userType === "seller" ? (
          <Link to="/seller/dashboard?tab=orders" className="flex-center flex-col text-xs text-white hover:text-nextplate-orange">
            <Package size={20} />
            <span className="mt-1">Orders</span>
          </Link>
        ) : (
          <Link to="/customer/orders" className="flex-center flex-col text-xs text-white hover:text-nextplate-orange">
            <Package size={20} />
            <span className="mt-1">Orders</span>
          </Link>
        )}
        <Link to="/calendar" className="flex-center flex-col text-xs text-white hover:text-nextplate-orange">
          <Calendar size={20} />
          <span className="mt-1">Calendar</span>
        </Link>
        <div className="flex-center flex-col text-xs text-white hover:text-nextplate-orange relative">
          <Bell size={20} />
          {unreadNotifications > 0 && (
            <Badge
              variant="destructive" 
              className="absolute -top-1 right-3 h-5 min-w-5 p-0 flex items-center justify-center rounded-full"
            >
              {unreadNotifications}
            </Badge>
          )}
          <span className="mt-1">Alerts</span>
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNavigation;
