
import React from "react";
import { Users, Star, ShoppingBag, DollarSign, Clock, Mail, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSellerCustomers } from "@/hooks/seller/use-seller-customers";
import LoadingState from "./LoadingState";

const CustomersTabContent: React.FC = () => {
  const { customers, isLoading, error } = useSellerCustomers();

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="bg-nextplate-darkgray rounded-xl p-6 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-nextplate-darkgray rounded-xl p-6 flex-center">
        <div className="text-center py-16">
          <Users size={64} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-bold mb-1">No customers yet</h3>
          <p className="text-gray-400">
            Customers who follow your store or place orders will appear here.
          </p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Customers</h2>
          <p className="text-gray-400">
            {customers.length} customer{customers.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-nextplate-red" />
            <span>{customers.filter(c => c.isFollowing).length} followers</span>
          </div>
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} className="text-blue-400" />
            <span>{customers.filter(c => c.orderCount > 0).length} buyers</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {customers.map((customer) => (
          <Card key={customer.id} className="bg-nextplate-darkgray border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-nextplate-red/20 flex items-center justify-center">
                    <Users size={20} className="text-nextplate-red" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                      {customer.isFollowing && (
                        <Badge variant="secondary" className="bg-nextplate-red/20 text-nextplate-red border-nextplate-red/30">
                          <Heart size={12} className="mr-1" />
                          Following
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-gray-400 text-sm mb-3">
                      <Mail size={14} />
                      <span>{customer.email}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <ShoppingBag size={16} className="text-blue-400" />
                        <span className="text-gray-400">Orders:</span>
                        <span className="font-semibold">{customer.orderCount}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-green-400" />
                        <span className="text-gray-400">Total Spent:</span>
                        <span className="font-semibold">{formatCurrency(customer.totalSpent)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-orange-400" />
                        <span className="text-gray-400">Last Order:</span>
                        <span className="font-semibold">{formatDate(customer.lastOrderDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomersTabContent;
