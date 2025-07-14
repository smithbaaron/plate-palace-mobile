import React, { useState, useEffect } from "react";
import { PackageCheck, Calendar, Filter, ChevronDown, Search, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Order, OrderStatus } from "@/types/order";
import { useNotifications } from "@/hooks/use-notifications";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useSellerOrders } from "@/hooks/seller/use-seller-orders";

const OrdersTabContent: React.FC = () => {
  const { notifyInfo } = useNotifications();
  const { currentUser } = useAuth();
  const { orders, isLoading, error, loadOrders } = useSellerOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<string[]>([]);
  const [deliveryFilter, setDeliveryFilter] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filterOrders = () => {
    return orders.filter(order => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter.length === 0 || 
        statusFilter.includes(order.status);
      
      // Payment filter
      const matchesPayment = paymentFilter.length === 0 || 
        paymentFilter.includes(order.paymentMethod);
      
      // Delivery filter
      const matchesDelivery = deliveryFilter.length === 0 || 
        deliveryFilter.includes(order.deliveryMethod);
      
      return matchesSearch && matchesStatus && matchesPayment && matchesDelivery;
    });
  };

  const filteredOrders = filterOrders();

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    // TODO: Implement backend API call to update order status
    notifyInfo("Status Update", `Order ${orderId} status would be updated to ${newStatus}`);
    // For now, just reload the orders to get fresh data
    loadOrders();
  };

  const getStatusBadgeColor = (status: OrderStatus) => {
    switch(status) {
      case "pending": return "bg-gray-500";
      case "confirmed": return "bg-blue-500";
      case "ready": return "bg-amber-500";
      case "delivered": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-80 bg-nextplate-darkgray" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20 bg-nextplate-darkgray" />
            <Skeleton className="h-10 w-20 bg-nextplate-darkgray" />
            <Skeleton className="h-10 w-20 bg-nextplate-darkgray" />
          </div>
        </div>
        
        <div className="bg-nextplate-darkgray rounded-xl overflow-hidden">
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-20 bg-gray-700" />
                <Skeleton className="h-4 w-32 bg-gray-700" />
                <Skeleton className="h-4 w-24 bg-gray-700" />
                <Skeleton className="h-4 w-16 bg-gray-700" />
                <Skeleton className="h-4 w-16 bg-gray-700" />
                <Skeleton className="h-4 w-16 bg-gray-700" />
                <Skeleton className="h-4 w-20 bg-gray-700" />
                <Skeleton className="h-8 w-24 bg-gray-700" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (filteredOrders.length === 0 && (searchQuery || statusFilter.length > 0 || paymentFilter.length > 0 || deliveryFilter.length > 0)) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-full max-w-xs relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="bg-nextplate-darkgray border-none pl-10 text-white"
            />
          </div>
          <div className="flex gap-2">
            <OrderFilterDropdown 
              title="Status"
              options={[
                { value: "pending", label: "Pending" },
                { value: "confirmed", label: "Confirmed" },
                { value: "ready", label: "Ready" },
                { value: "delivered", label: "Delivered" },
                { value: "cancelled", label: "Cancelled" },
              ]}
              selectedValues={statusFilter}
              onSelectionChange={setStatusFilter}
            />
            <OrderFilterDropdown 
              title="Payment"
              options={[
                { value: "cash", label: "Cash" },
                { value: "card", label: "Card" },
                { value: "app", label: "App" },
              ]}
              selectedValues={paymentFilter}
              onSelectionChange={setPaymentFilter}
            />
            <OrderFilterDropdown 
              title="Method"
              options={[
                { value: "pickup", label: "Pickup" },
                { value: "delivery", label: "Delivery" },
              ]}
              selectedValues={deliveryFilter}
              onSelectionChange={setDeliveryFilter}
            />
          </div>
        </div>
        
        <div className="bg-nextplate-darkgray rounded-xl p-6 flex-center">
          <div className="text-center py-16">
            <PackageCheck size={64} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-bold mb-1">No orders match your filter</h3>
            <p className="text-gray-400">
              Try adjusting your search or filter settings.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setStatusFilter([]);
                setPaymentFilter([]);
                setDeliveryFilter([]);
              }}
              className="mt-4"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (filteredOrders.length === 0) {
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
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-full max-w-xs relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="bg-nextplate-darkgray border-none pl-10 text-white"
            />
          </div>
          <div className="flex gap-2">
            <OrderFilterDropdown 
              title="Status"
              options={[
                { value: "pending", label: "Pending" },
                { value: "confirmed", label: "Confirmed" },
                { value: "ready", label: "Ready" },
                { value: "delivered", label: "Delivered" },
                { value: "cancelled", label: "Cancelled" },
              ]}
              selectedValues={statusFilter}
              onSelectionChange={setStatusFilter}
            />
            <OrderFilterDropdown 
              title="Payment"
              options={[
                { value: "cash", label: "Cash" },
                { value: "card", label: "Card" },
                { value: "app", label: "App" },
              ]}
              selectedValues={paymentFilter}
              onSelectionChange={setPaymentFilter}
            />
            <OrderFilterDropdown 
              title="Method"
              options={[
                { value: "pickup", label: "Pickup" },
                { value: "delivery", label: "Delivery" },
              ]}
              selectedValues={deliveryFilter}
              onSelectionChange={setDeliveryFilter}
            />
          </div>
        </div>

        <div className="bg-nextplate-darkgray rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-black bg-opacity-40">
                <TableRow>
                  <TableHead className="text-gray-300">Order ID</TableHead>
                  <TableHead className="text-gray-300">Customer</TableHead>
                  <TableHead className="text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-300">Total</TableHead>
                  <TableHead className="text-gray-300">Payment</TableHead>
                  <TableHead className="text-gray-300">Method</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map(order => (
                  <TableRow key={order.id} className="hover:bg-black hover:bg-opacity-20 border-gray-800">
                    <TableCell className="font-medium">
                      <button
                        onClick={() => handleOrderClick(order)}
                        className="text-orange-400 hover:text-orange-300 hover:underline transition-colors"
                      >
                        {order.id}
                      </button>
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(order.createdAt), "h:mm a")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {order.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {order.deliveryMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`capitalize ${getStatusBadgeColor(order.status)}`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusDropdown 
                        orderId={order.id}
                        currentStatus={order.status} 
                        onStatusChange={handleStatusChange} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={closeOrderModal}>
        <DialogContent className="bg-nextplate-darkgray border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Order Details - {selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-300 mb-2">Customer Information</h3>
                  <p className="text-white">{selectedOrder.customerName}</p>
                  {selectedOrder.deliveryMethod === 'delivery' && selectedOrder.address && (
                    <p className="text-sm text-gray-400 mt-1">{selectedOrder.address}</p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-300 mb-2">Order Information</h3>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-gray-400">Status:</span>{" "}
                      <Badge className={`capitalize ${getStatusBadgeColor(selectedOrder.status)} ml-1`}>
                        {selectedOrder.status}
                      </Badge>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-400">Payment:</span>{" "}
                      <Badge variant="outline" className="capitalize ml-1">
                        {selectedOrder.paymentMethod}
                      </Badge>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-400">Method:</span>{" "}
                      <Badge variant="outline" className="capitalize ml-1">
                        {selectedOrder.deliveryMethod}
                      </Badge>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-400">Scheduled for:</span>{" "}
                      <span className="text-white">
                        {format(new Date(selectedOrder.scheduledFor), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-300 mb-3">Items Purchased</h3>
                <div className="bg-black bg-opacity-30 rounded-lg p-4">
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{item.name}</h4>
                          {item.notes && (
                            <p className="text-sm text-gray-400 mt-1">Note: {item.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-white">
                            {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-400">
                            = ${(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Order Total */}
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-300">Total:</span>
                      <span className="text-xl font-bold text-white">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div>
                <h3 className="font-semibold text-gray-300 mb-3">Order Timeline</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400">Ordered:</span>{" "}
                    <span className="text-white">
                      {format(new Date(selectedOrder.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-400">Last Updated:</span>{" "}
                    <span className="text-white">
                      {format(new Date(selectedOrder.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

interface FilterDropdownProps {
  title: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onSelectionChange: (values: any[]) => void;
}

const OrderFilterDropdown: React.FC<FilterDropdownProps> = ({ 
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

interface StatusDropdownProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ orderId, currentStatus, onStatusChange }) => {
  const statusOptions: {value: OrderStatus, label: string}[] = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "ready", label: "Ready" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" }
  ];
  
  // Determine which statuses should be available next
  const getAvailableStatuses = (current: OrderStatus) => {
    if (current === "cancelled") {
      return [];
    }
    
    switch(current) {
      case "pending":
        return ["confirmed", "ready", "cancelled"];
      case "confirmed":
        return ["ready", "cancelled"];
      case "ready":
        return ["delivered", "cancelled"];
      case "delivered":
        return ["cancelled"];
      default:
        return [];
    }
  };

  const availableStatuses = getAvailableStatuses(currentStatus);
  
  if (availableStatuses.length === 0) {
    return <Button size="sm" disabled>Complete</Button>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm">Update Status</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {statusOptions
          .filter(option => availableStatuses.includes(option.value))
          .map(option => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={currentStatus === option.value}
              onCheckedChange={() => onStatusChange(orderId, option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrdersTabContent;
