import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/context/AuthContext";
import { getCustomerOrders, cancelOrder, deleteOrder } from "@/lib/orders-service";
import { 
  Calendar, 
  Package, 
  Search, 
  Filter, 
  ChevronDown, 
  Clock,
  Trash2,
  X
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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Order, OrderStatus } from "@/types/order";
import { format } from "date-fns";

// Real orders will be fetched from the database


const CustomerOrders: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const customerOrders = await getCustomerOrders(currentUser.id);
      setOrders(customerOrders);
    } catch (error) {
      console.error('❌ Failed to fetch orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  const handleCancelOrder = async (orderId: string) => {
    if (!currentUser) return;
    
    try {
      await cancelOrder(orderId, currentUser.id);
      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully.",
      });
      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('❌ Failed to cancel order:', error);
      toast({
        title: "Error",
        description: "Failed to cancel order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!currentUser) return;
    
    try {
      await deleteOrder(orderId, currentUser.id);
      toast({
        title: "Order Deleted",
        description: "Your order has been deleted successfully.",
      });
      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('❌ Failed to delete order:', error);
      toast({
        title: "Error",
        description: "Failed to delete order. Please try again.",
        variant: "destructive",
      });
    }
  };

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
    return orders.filter(order => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pb-16">
        <Navigation />
        <div className="pt-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading your orders...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                      onCancel={handleCancelOrder}
                      onDelete={handleDeleteOrder}
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
                      onCancel={handleCancelOrder}
                      onDelete={handleDeleteOrder}
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
  onCancel: (orderId: string) => void;
  onDelete: (orderId: string) => void;
  isCompleted?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  getStatusBadgeColor, 
  getPickupTimeText,
  onCancel,
  onDelete,
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
        
        <div className="flex items-center gap-3">
          <div className="font-bold">
            Total: ${order.total.toFixed(2)}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            {/* Cancel button - only for pending orders */}
            {order.status === "pending" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <X size={14} className="mr-1" />
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-nextplate-darkgray border-gray-800">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Cancel Order?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      Are you sure you want to cancel this order? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-gray-700">Keep Order</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onCancel(order.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Cancel Order
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            {/* Delete button - only for cancelled orders */}
            {order.status === "cancelled" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-nextplate-darkgray border-gray-800">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Delete Order?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      Are you sure you want to permanently delete this order? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-gray-700">Keep Order</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(order.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete Order
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CustomerOrders;
