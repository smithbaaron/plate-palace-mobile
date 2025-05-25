
import { Link } from "react-router-dom";

const NavigationLogo = () => {
  return (
    <div className="flex items-center">
      <Link to="/" className="flex items-center">
        <img 
          src="/lovable-uploads/b6811eb7-aad2-470d-87d0-ef8e2cc34abe.png" 
          alt="NextPlate Logo" 
          className="h-9"
        />
      </Link>
    </div>
  );
};

export default NavigationLogo;
