
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DatabaseSetupRequiredProps {
  onRetryClick: () => void;
}

const DatabaseSetupRequired: React.FC<DatabaseSetupRequiredProps> = ({ onRetryClick }) => {
  return (
    <div className="bg-nextplate-darkgray rounded-xl p-6">
      <div className="flex flex-col items-center py-16 text-center">
        <AlertTriangle size={64} className="text-amber-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Database Setup Required</h3>
        <p className="text-gray-400 mb-6 max-w-md">
          Your plates table hasn't been set up yet. Make sure you've run all database migrations.
        </p>
        <Button 
          onClick={onRetryClick}
          className="bg-nextplate-orange hover:bg-orange-600"
        >
          Retry Connection
        </Button>
      </div>
    </div>
  );
};

export default DatabaseSetupRequired;
