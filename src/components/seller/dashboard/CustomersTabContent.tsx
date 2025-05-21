
import React from "react";
import { Users } from "lucide-react";

const CustomersTabContent: React.FC = () => {
  return (
    <div className="bg-nextplate-darkgray rounded-xl p-6 flex-center">
      <div className="text-center py-16">
        <Users size={64} className="mx-auto text-gray-500 mb-4" />
        <h3 className="text-xl font-bold mb-1">No customers yet</h3>
        <p className="text-gray-400">
          Customers who follow your store will appear here.
        </p>
      </div>
    </div>
  );
};

export default CustomersTabContent;
