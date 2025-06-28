
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";

interface DesktopNavigationProps {
  isAuthenticated: boolean;
  userType: string | null;
  dashboardUrl: string;
  unreadNotifications: number;
  handleLogout: () => Promise<void>;
}

const DesktopNavigation = ({ 
  isAuthenticated, 
  userType, 
  dashboardUrl, 
  unreadNotifications, 
  handleLogout 
}: DesktopNavigationProps) => {
  return (
    <div className="hidden md:flex items-center space-x-4">
      {isAuthenticated ? (
        <>
          <Link to={dashboardUrl}>
            <Button variant="ghost" className="text-white hover:text-nextplate-orange">
              Dashboard
            </Button>
          </Link>
          {userType === "customer" && (
            <Link to="/customer/orders">
              <Button variant="ghost" className="text-white hover:text-nextplate-orange">
                My Orders
              </Button>
            </Link>
          )}
          <Link to="/profile">
            <Button variant="ghost" className="text-white hover:text-nextplate-orange">
              Profile
            </Button>
          </Link>
          
          <NotificationDropdown unreadCount={unreadNotifications} />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white hover:text-nextplate-orange border border-gray-600 hover:border-nextplate-orange">
                <Menu size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[100] bg-black border-gray-700 shadow-xl">
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-white hover:bg-gray-700 cursor-pointer focus:bg-gray-700"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <Link to="/auth">
          <Button className="bg-nextplate-orange hover:bg-orange-600 text-white">
            Sign In
          </Button>
        </Link>
      )}
    </div>
  );
};

export default DesktopNavigation;
