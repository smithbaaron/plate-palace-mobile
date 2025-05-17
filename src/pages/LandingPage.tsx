
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/context/AuthContext";
import { useUserType } from "@/context/UserTypeContext";
import { Package, Calendar, Bell } from "lucide-react";

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const { userType } = useUserType();
  
  // Determine dashboard URL based on user type
  const dashboardUrl = userType === "seller" ? "/seller/dashboard" : "/customer/dashboard";

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <main className="pt-24 pb-16 px-4 md:px-0">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-glow">
            Next<span className="text-nextplate-orange">Plate</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-300">
            The platform for independent food sellers to connect with hungry customers
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isAuthenticated ? (
              <Link to={dashboardUrl}>
                <Button className="bg-nextplate-orange hover:bg-orange-600 text-white text-lg px-8 py-6">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth?type=seller">
                  <Button className="bg-nextplate-orange hover:bg-orange-600 text-white text-lg px-8 py-6">
                    I'm a Seller
                  </Button>
                </Link>
                <Link to="/auth?type=customer">
                  <Button className="bg-nextplate-red hover:bg-red-600 text-white text-lg px-8 py-6">
                    I'm a Customer
                  </Button>
                </Link>
              </>
            )}
          </div>
        </section>
        
        {/* Features Section */}
        <section className="max-w-7xl mx-auto mb-20 grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0">
          <div className="bg-nextplate-darkgray p-6 rounded-xl hover:bg-opacity-80 transition-all duration-200 animate-fade-in">
            <div className="h-12 w-12 bg-nextplate-orange rounded-full mb-4 flex-center">
              <Package size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Single Plates</h3>
            <p className="text-gray-400">Create, manage and sell individual meal plates with customizable options.</p>
          </div>
          
          <div className="bg-nextplate-darkgray p-6 rounded-xl hover:bg-opacity-80 transition-all duration-200 animate-fade-in" style={{animationDelay: "0.1s"}}>
            <div className="h-12 w-12 bg-nextplate-orange rounded-full mb-4 flex-center">
              <Calendar size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Meal Prep Packages</h3>
            <p className="text-gray-400">Offer weekly meal prep packages with flexible meal counts and delivery options.</p>
          </div>
          
          <div className="bg-nextplate-darkgray p-6 rounded-xl hover:bg-opacity-80 transition-all duration-200 animate-fade-in" style={{animationDelay: "0.2s"}}>
            <div className="h-12 w-12 bg-nextplate-orange rounded-full mb-4 flex-center">
              <Bell size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Real-time Notifications</h3>
            <p className="text-gray-400">Keep your customers updated with alerts about new menu items and order status.</p>
          </div>
        </section>
        
        {/* How It Works */}
        <section className="max-w-7xl mx-auto mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* For Sellers */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-nextplate-orange">For Food Sellers</h3>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="h-8 w-8 rounded-full bg-nextplate-orange text-white flex-center font-bold">1</span>
                  <div>
                    <p className="font-semibold">Sign up and create your store</p>
                    <p className="text-gray-400">Set your unique username and customize your store profile.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="h-8 w-8 rounded-full bg-nextplate-orange text-white flex-center font-bold">2</span>
                  <div>
                    <p className="font-semibold">Create your menu</p>
                    <p className="text-gray-400">Add single plates or meal prep packages with photos and details.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="h-8 w-8 rounded-full bg-nextplate-orange text-white flex-center font-bold">3</span>
                  <div>
                    <p className="font-semibold">Manage orders</p>
                    <p className="text-gray-400">Track payments, prepare orders, and coordinate pickups/deliveries.</p>
                  </div>
                </li>
              </ol>
              <div className="mt-8">
                <Link to="/auth?type=seller">
                  <Button className="bg-nextplate-orange hover:bg-orange-600 text-white">
                    Start Selling
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* For Customers */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-nextplate-red">For Customers</h3>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="h-8 w-8 rounded-full bg-nextplate-red text-white flex-center font-bold">1</span>
                  <div>
                    <p className="font-semibold">Create an account</p>
                    <p className="text-gray-400">Sign up and add your favorite local food sellers.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="h-8 w-8 rounded-full bg-nextplate-red text-white flex-center font-bold">2</span>
                  <div>
                    <p className="font-semibold">Browse available meals</p>
                    <p className="text-gray-400">See what's on the menu from your favorite home chefs.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="h-8 w-8 rounded-full bg-nextplate-red text-white flex-center font-bold">3</span>
                  <div>
                    <p className="font-semibold">Order and enjoy</p>
                    <p className="text-gray-400">Place your order, make a payment, and pick up or receive your food.</p>
                  </div>
                </li>
              </ol>
              <div className="mt-8">
                <Link to="/auth?type=customer">
                  <Button className="bg-nextplate-red hover:bg-red-600 text-white">
                    Find Food
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-nextplate-darkgray py-10 text-center text-gray-400">
        <div className="max-w-7xl mx-auto px-4">
          <p className="mb-2">
            <span className="font-bold text-white">Next</span>
            <span className="font-bold text-nextplate-orange">Plate</span> © {new Date().getFullYear()}
          </p>
          <p className="text-sm">Connecting independent food sellers with hungry customers</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
