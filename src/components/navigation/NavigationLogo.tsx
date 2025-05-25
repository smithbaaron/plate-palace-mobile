
import { Link } from "react-router-dom";

const NavigationLogo = () => {
  return (
    <div className="flex items-center">
      <Link to="/" className="flex items-center">
        <img 
          src="/lovable-uploads/7b3638b5-87a3-48c9-b506-2a97a7586b84.png" 
          alt="NextPlate Logo" 
          className="h-12"
        />
      </Link>
    </div>
  );
};

export default NavigationLogo;
