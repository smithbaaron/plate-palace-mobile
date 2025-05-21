
import React from "react";
import { Loader2 } from "lucide-react";

const LoadingState: React.FC = () => {
  return (
    <div className="pt-20 px-4 flex items-center justify-center h-[80vh]">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-nextplate-orange mb-4" />
        <p>Loading your menu...</p>
      </div>
    </div>
  );
};

export default LoadingState;
