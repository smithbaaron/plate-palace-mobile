
import React from "react";
import { Package, MapPin, CalendarCheck } from "lucide-react";

interface StepProps {
  currentStep: number;
}

const OnboardingSteps: React.FC<StepProps> = ({ currentStep }) => {
  return (
    <div className="flex justify-between mb-8">
      <div className={`flex-1 text-center ${currentStep >= 1 ? "text-nextplate-orange" : "text-gray-500"}`}>
        <div className={`h-8 w-8 rounded-full ${currentStep >= 1 ? "bg-nextplate-orange" : "bg-gray-700"} mx-auto mb-2 flex items-center justify-center`}>
          <span className="text-white">1</span>
        </div>
        <span className="text-sm">Basic Info</span>
      </div>
      <div className={`flex-1 text-center ${currentStep >= 2 ? "text-nextplate-orange" : "text-gray-500"}`}>
        <div className={`h-8 w-8 rounded-full ${currentStep >= 2 ? "bg-nextplate-orange" : "bg-gray-700"} mx-auto mb-2 flex items-center justify-center`}>
          <span className="text-white">2</span>
        </div>
        <span className="text-sm">Delivery Options</span>
      </div>
      <div className={`flex-1 text-center ${currentStep >= 3 ? "text-nextplate-orange" : "text-gray-500"}`}>
        <div className={`h-8 w-8 rounded-full ${currentStep >= 3 ? "bg-nextplate-orange" : "bg-gray-700"} mx-auto mb-2 flex items-center justify-center`}>
          <span className="text-white">3</span>
        </div>
        <span className="text-sm">Complete</span>
      </div>
    </div>
  );
};

export default OnboardingSteps;
