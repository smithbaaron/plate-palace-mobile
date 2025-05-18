
import React from "react";
import { PackageCheck } from "lucide-react";

const OrdersTabContent: React.FC = () => {
  return (
    <div className="bg-nextplate-darkgray rounded-xl p-6 flex-center">
      <div className="text-center py-16">
        <PackageCheck size={64} className="mx-auto text-gray-500 mb-4" />
        <h3 className="text-xl font-bold mb-1">No orders yet</h3>
        <p className="text-gray-400">
          Orders will appear here once customers start purchasing.
        </p>
      </div>
    </div>
  );
};

export default OrdersTabContent;
