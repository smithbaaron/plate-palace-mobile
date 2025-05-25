
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserType } from "@/context/UserTypeContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home, User, Package, Calendar, Bell, Menu, X, LogOut } from "lucide-react";

const Navigation = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { userType } = useUserType();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3); // Mock unread notification count
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  // Close menu when changing routes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Simulate fetching notifications
  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now we're just using the mock data
    // This would be replaced with an actual data fetch
  }, []);
  
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
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/b6811eb7-aad2-470d-87d0-ef8e2cc34abe.png" 
                alt="NextPlate Logo" 
                className="h-9"
              />
            </Link>
          </div>
          
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
                <div className="relative">
                  <Button variant="ghost" className="text-white hover:text-nextplate-orange">
                    <Bell size={20} />
                    {unreadNotifications > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 min-w-5 p-0 flex items-center justify-center rounded-full"
                      >
                        {unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                </div>
                
                {/* Menu dropdown for logout */}
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
          
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-nextplate-orange focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-black bg-opacity-95 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                <Link to={dashboardUrl} className="block px-3 py-2 text-white hover:text-nextplate-orange">
                  Dashboard
                </Link>
                {userType === "customer" && (
                  <Link to="/customer/orders" className="block px-3 py-2 text-white hover:text-nextplate-orange">
                    My Orders
                  </Link>
                )}
                <Link to="/profile" className="block px-3 py-2 text-white hover:text-nextplate-orange">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-white hover:text-nextplate-orange"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/auth" className="block px-3 py-2 text-white hover:text-nextplate-orange">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
      
      {/* Bottom mobile navigation bar - only shown if user is logged in */}
      {isAuthenticated && (
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
      )}
    </nav>
  );
};

export default Navigation;
