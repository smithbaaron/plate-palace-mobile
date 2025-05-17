
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserType } from "@/context/UserTypeContext";
import { Button } from "@/components/ui/button";
import { Home, User, Package, Calendar, Bell, Menu, X } from "lucide-react";

const Navigation = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { userType } = useUserType();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // Mock notification count
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  // Close menu when changing routes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);
  
  // Determine dashboard URL based on user type
  const dashboardUrl = userType === "seller" ? "/seller/dashboard" : "/customer/dashboard";
  
  return (
    <nav className="fixed w-full z-50 bg-black bg-opacity-90 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-white mr-1">Next</span>
              <span className="text-2xl font-bold text-nextplate-orange">Plate</span>
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
                <Link to="/profile">
                  <Button variant="ghost" className="text-white hover:text-nextplate-orange">
                    Profile
                  </Button>
                </Link>
                <Button variant="ghost" onClick={logout} className="text-white hover:text-nextplate-orange">
                  Logout
                </Button>
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
                <Link to="/profile" className="block px-3 py-2 text-white hover:text-nextplate-orange">
                  Profile
                </Link>
                <button
                  onClick={logout}
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
              <Link to="/seller/orders" className="flex-center flex-col text-xs text-white hover:text-nextplate-orange">
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
              {notifications > 0 && (
                <span className="absolute top-0 right-4 bg-nextplate-red text-white rounded-full w-4 h-4 text-[10px] flex-center">
                  {notifications}
                </span>
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
