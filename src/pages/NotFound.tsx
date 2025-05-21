
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 text-nextplate-orange">404</h1>
          <p className="text-2xl text-white mb-6">Oops! This page isn't on the menu.</p>
          <p className="text-gray-400 mb-8">We couldn't find the page you were looking for.</p>
          <Link to="/">
            <Button className="bg-nextplate-orange hover:bg-orange-600">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
