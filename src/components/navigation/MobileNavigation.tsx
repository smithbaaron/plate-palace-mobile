
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

interface MobileNavigationProps {
  isAuthenticated: boolean;
  userType: string | null;
  dashboardUrl: string;
  isOpen: boolean;
  toggleMenu: () => void;
  handleLogout: () => Promise<void>;
}

const MobileNavigation = ({ 
  isAuthenticated, 
  userType, 
  dashboardUrl, 
  isOpen, 
  toggleMenu, 
  handleLogout 
}: MobileNavigationProps) => {
  return (
    <>
      <div className="md:hidden flex items-center">
        <button
          onClick={toggleMenu}
          className="text-white hover:text-nextplate-orange focus:outline-none"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
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
    </>
  );
};

export default MobileNavigation;
