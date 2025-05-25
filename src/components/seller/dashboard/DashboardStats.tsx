
import React from "react";
import { Bell } from "lucide-react";
import { useSellerOrders } from "@/hooks/seller/use-seller-orders";

interface DashboardStatsProps {
  todayPlatesCount: number;
  futurePlatesCount: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ todayPlatesCount, futurePlatesCount }) => {
  const { totalSales, totalOrdersCount, isLoading } = useSellerOrders();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      <div className="bg-nextplate-darkgray rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-black bg-opacity-50 rounded-lg">
            <p className="text-sm text-gray-400">Total Sales</p>
            <p className="text-2xl font-bold">
              {isLoading ? "..." : `$${totalSales.toFixed(2)}`}
            </p>
          </div>
          <div className="p-3 bg-black bg-opacity-50 rounded-lg">
            <p className="text-sm text-gray-400">Total Orders</p>
            <p className="text-2xl font-bold">
              {isLoading ? "..." : totalOrdersCount}
            </p>
          </div>
          <div className="p-3 bg-black bg-opacity-50 rounded-lg">
            <p className="text-sm text-gray-400">Current Menu</p>
            <p className="text-2xl font-bold">{todayPlatesCount}</p>
          </div>
          <div className="p-3 bg-black bg-opacity-50 rounded-lg">
            <p className="text-sm text-gray-400">Future Menu</p>
            <p className="text-2xl font-bold">{futurePlatesCount}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-nextplate-darkgray rounded-xl p-6 md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Recent Activity</h3>
          <Bell size={18} className="text-gray-400" />
        </div>
        <div className="p-6 flex-center bg-black bg-opacity-50 rounded-lg">
          <p className="text-gray-400">No recent activity</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
