import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { 
  Calendar, 
  Package, 
  Search, 
  Filter, 
  ChevronDown, 
  Clock
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem 
} from "@/components/ui/dropdown-menu";
import { Order, OrderStatus } from "@/types/order";
import { format } from "date-fns";

// Mock data - would be replaced with actual API call
const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-001",
    customerId: "cust1",
    sellerId: "seller1",
    customerName: "Jane Smith",
    sellerName: "Mama's Kitchen",
    items: [
      {
        id: "item1",
        plateId: "plate1",
        name: "Chicken Alfredo Pasta",
        price: 12.99,
        quantity: 2,
      },
      {
        id: "item2",
        plateId: "plate2",
        name: "Garden Salad",
        price: 6.99,
        quantity: 1,
      }
    ],
    status: "pending",
    total: 32.97,
    createdAt: "2025-05-17T14:30:00Z",
    updatedAt: "2025-05-17T14:30:00Z",
    scheduledFor: "2025-05-18T18:00:00Z",
    paymentMethod: "card",
    deliveryMethod: "pickup",
  },
  {
    id: "ORD-002",
    customerId: "cust1",
    sellerId: "seller2",
    customerName: "Jane Smith",
    sellerName: "Healthy Eats",
    items: [
      {
        id: "item3",
        plateId: "plate3",
        name: "Beef Stir Fry",
        price: 14.99,
        quantity: 1,
      }
    ],
    status: "confirmed",
    total: 14.99,
    createdAt: "2025-05-17T10:15:00Z",
    updatedAt: "2025-05-17T10:20:00Z",
    scheduledFor: "2025-05-18T12:30:00Z",
    paymentMethod: "app",
    deliveryMethod: "delivery",
    address: "123 Main St, Apt 4B, Cityville"
  },
  {
    id: "ORD-003",
    customerId: "cust1",
    sellerId: "seller3",
    customerName: "Jane Smith",
    sellerName: "Spice Kingdom",
    items: [
      {
        id: "item4",
        plateId: "plate4",
        name: "Butter Chicken with Naan",
        price: 15.99,
        quantity: 1,
      },
      {
        id: "item5",
        plateId: "plate5",
        name: "Vegetable Samosas",
        price: 5.99,
        quantity: 2,
      }
    ],
    status: "delivered",
    total: 27.97,
    createdAt: "2025-05-16T16:45:00Z",
    updatedAt: "2025-05-17T09:30:00Z",
    scheduledFor: "2025-05-17T17:15:00Z",
    paymentMethod: "cash",
    deliveryMethod: "pickup",
  }
];

const CustomerOrders: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus[]>([]);

  const getStatusBadgeColor = (status: OrderStatus) => {
    switch(status) {
      case "pending": return "bg-gray-500";
      case "confirmed": return "bg-blue-500";
      case "ready": return "bg-amber-500";
      case "delivered": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };
  
  const filterOrders = () => {
    return MOCK_ORDERS.filter(order => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        order.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter.length === 0 || 
        statusFilter.includes(order.status);
      
      return matchesSearch && matchesStatus;
    });
  };

  const filteredOrders = filterOrders();
  
  // Group orders by status for tabs
  const activeOrders = filteredOrders.filter(order => 
    order.status === "pending" || order.status === "confirmed" || order.status === "ready"
  );
  const completedOrders = filteredOrders.filter(order => order.status === "delivered");

  const getPickupTimeText = (order: Order) => {
    const date = new Date(order.scheduledFor);
    const today = new Date();
    
    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${format(date, "h:mm a")}`;
    }
    
    // Check if it's tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${format(date, "h:mm a")}`;
    }
    
    // Otherwise return formatted date
    return `${format(date, "MMM d")} at ${format(date, "h:mm a")}`;
  };

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <Navigation />
      
      <div className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <h1 className="text-3xl font-bold mb-4 md:mb-0">My Orders</h1>
            
            <div className="flex gap-4 items-center">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders..."
                  className="bg-nextplate-darkgray border-none pl-10 text-white"
                />
              </div>
              
              <OrderFilterDropdown 
                title="Status"
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "confirmed", label: "Confirmed" },
                  { value: "ready", label: "Ready" },
                  { value: "delivered", label: "Delivered" },
                ]}
                selectedValues={statusFilter}
                onSelectionChange={setStatusFilter}
              />
            </div>
          </div>
          
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList className="w-full bg-nextplate-darkgray">
              <TabsTrigger value="active" className="flex-1">
                Active Orders
                {activeOrders.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeOrders.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex-1">
                Past Orders
                {completedOrders.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {completedOrders.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="space-y-4">
              {activeOrders.length === 0 ? (
                <div className="bg-nextplate-darkgray rounded-xl p-6 flex-center">
                  <div className="text-center py-16">
                    <Package size={64} className="mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold mb-1">No active orders</h3>
                    <p className="text-gray-400">
                      You don't have any orders in progress.
                    </p>
                    <Button 
                      className="mt-4 bg-nextplate-orange hover:bg-orange-600"
                      onClick={() => navigate('/customer/dashboard')}
                    >
                      Find something delicious
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeOrders.map(order => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      getStatusBadgeColor={getStatusBadgeColor}
                      getPickupTimeText={getPickupTimeText}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {completedOrders.length === 0 ? (
                <div className="bg-nextplate-darkgray rounded-xl p-6 flex-center">
                  <div className="text-center py-16">
                    <Package size={64} className="mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold mb-1">No past orders</h3>
                    <p className="text-gray-400">
                      Your completed orders will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedOrders.map(order => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      getStatusBadgeColor={getStatusBadgeColor}
                      getPickupTimeText={getPickupTimeText}
                      isCompleted
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

interface OrderFilterDropdownProps {
  title: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onSelectionChange: (values: any[]) => void;
}

const OrderFilterDropdown: React.FC<OrderFilterDropdownProps> = ({ 
  title, 
  options, 
  selectedValues, 
  onSelectionChange 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex gap-1 border-gray-700">
          <Filter size={16} />
          {title}
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {options.map(option => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selectedValues.includes(option.value)}
            onCheckedChange={(checked) => {
              if (checked) {
                onSelectionChange([...selectedValues, option.value]);
              } else {
                onSelectionChange(selectedValues.filter(v => v !== option.value));
              }
            }}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface OrderCardProps {
  order: Order;
  getStatusBadgeColor: (status: OrderStatus) => string;
  getPickupTimeText: (order: Order) => string;
  isCompleted?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  getStatusBadgeColor, 
  getPickupTimeText,
  isCompleted = false
}) => {
  return (
    <Card className="bg-nextplate-darkgray border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md">
          Order from <span className="text-nextplate-orange">{order.sellerName}</span>
        </CardTitle>
        <Badge className={`${getStatusBadgeColor(order.status)} capitalize`}>
          {order.status}
        </Badge>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-400">
            <Calendar className="mr-2" size={14} />
            <span>{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
          </div>
          
          {!isCompleted && (
            <div className="flex items-center text-sm">
              <Clock className="mr-2 text-nextplate-orange" size={14} />
              <span>Pickup {getPickupTimeText(order)}</span>
            </div>
          )}
          
          <div className="border-t border-gray-800 my-2 pt-2">
            <p className="text-sm text-gray-300 mb-1">Items:</p>
            <ul className="space-y-1">
              {order.items.map((item, index) => (
                <li key={index} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-gray-300">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-gray-800 pt-3 flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="capitalize border-gray-700">
            {order.paymentMethod}
          </Badge>
          <Badge variant="outline" className="capitalize border-gray-700">
            {order.deliveryMethod}
          </Badge>
        </div>
        
        <div className="font-bold">
          Total: ${order.total.toFixed(2)}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CustomerOrders;
