
import React from "react";
import { CalendarCheck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FinalStepProps {
  handlePreviousStep: () => void;
  handleCompletion: () => void;
  isSubmitting: boolean;
}

const FinalStep: React.FC<FinalStepProps> = ({ 
  handlePreviousStep, 
  handleCompletion,
  isSubmitting
}) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <CalendarCheck className="mr-2 text-nextplate-orange" />
        Ready to Start Selling!
      </h2>
      
      <div className="text-center">
        <div className="w-20 h-20 mx-auto bg-nextplate-orange rounded-full flex items-center justify-center mb-6">
          <Package size={40} className="text-white" />
        </div>
        
        <h3 className="text-xl font-bold mb-4">Your NextPlate seller account is set up!</h3>
        <p className="text-gray-300 mb-6">
          You're ready to start creating your menu and selling to customers.
          Your next step is to add plates or meal prep packages to your menu.
        </p>
      </div>
      
      <div className="mt-8 flex justify-between">
        <Button
          onClick={handlePreviousStep}
          variant="outline"
          className="border-nextplate-lightgray text-white hover:bg-nextplate-lightgray"
        >
          Back
        </Button>
        <Button
          onClick={handleCompletion}
          className="bg-nextplate-orange hover:bg-orange-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Go to Dashboard"}
        </Button>
      </div>
    </div>
  );
};

export default FinalStep;
