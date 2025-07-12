
import { Link } from "react-router-dom";

const NavigationLogo = () => {
  return (
    <div className="flex items-center">
      <Link to="/" className="flex items-center">
        <img 
          src="/lovable-uploads/dabcde3c-2ce5-46ff-bb33-e32bacb4fb8b.png" 
          alt="BestPlate Logo" 
          className="h-12"
        />
      </Link>
    </div>
  );
};

export default NavigationLogo;
