
import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingCart, Bell, Menu } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const location = useLocation();
  
  // Only show on authenticated pages
  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    // This will be handled by the parent Navigation component
    // For now, we'll redirect to auth page
    window.location.href = '/auth';
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black bg-opacity-95 border-t border-gray-800 z-40">
      <div className="flex justify-around items-center py-2 px-4">
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center p-2 ${
            location.pathname === "/" ? "text-nextplate-orange" : "text-gray-400"
          }`}
        >
          <Home size={20} />
          <span className="text-xs mt-1">Home</span>
        </Link>

        {/* Dashboard */}
        <Link
          to={dashboardUrl}
          className={`flex flex-col items-center p-2 ${
            location.pathname.includes("dashboard") ? "text-nextplate-orange" : "text-gray-400"
          }`}
        >
          <ShoppingCart size={20} />
          <span className="text-xs mt-1">Dashboard</span>
        </Link>

        {/* Orders (for customers) */}
        {userType === "customer" && (
          <Link
            to="/customer/orders"
            className={`flex flex-col items-center p-2 ${
              location.pathname.includes("orders") ? "text-nextplate-orange" : "text-gray-400"
            }`}
          >
            <ShoppingCart size={20} />
            <span className="text-xs mt-1">Orders</span>
          </Link>
        )}

        {/* Notifications */}
        <button className="flex flex-col items-center p-2 text-gray-400 relative">
          <Bell size={20} />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-nextplate-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          )}
          <span className="text-xs mt-1">Alerts</span>
        </button>

        {/* Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center p-2 text-gray-400">
              <Menu size={20} />
              <span className="text-xs mt-1">Menu</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            side="top"
            className="bg-black border-gray-800 text-white mb-2"
          >
            {isAuthenticated ? (
              <>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-red-400 focus:text-red-400"
                >
                  Logout
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem asChild>
                <Link to="/auth" className="cursor-pointer">
                  Sign In
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MobileBottomNavigation;
