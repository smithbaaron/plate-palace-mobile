
import React, { useState } from "react";
import { PackageCheck, Calendar, Filter, ChevronDown, Search } from "lucide-react";
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
import { Order, OrderStatus } from "@/types/order";
import { useNotifications } from "@/hooks/use-notifications";
import { format } from "date-fns";

// Mock data - would be replaced with actual API call
const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-001",
    customerId: "cust1",
    sellerId: "seller1",
    customerName: "Jane Smith",
    sellerName: "Your Store",
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
    customerId: "cust2",
    sellerId: "seller1",
    customerName: "Alex Johnson",
    sellerName: "Your Store",
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
    customerId: "cust3",
    sellerId: "seller1",
    customerName: "Sam Taylor",
    sellerName: "Your Store",
    items: [
      {
        id: "item4",
        plateId: "plate1",
        name: "Chicken Alfredo Pasta",
        price: 12.99,
        quantity: 3,
      }
    ],
    status: "ready",
    total: 38.97,
    createdAt: "2025-05-16T16:45:00Z",
    updatedAt: "2025-05-17T09:30:00Z",
    scheduledFor: "2025-05-18T17:15:00Z",
    paymentMethod: "cash",
    deliveryMethod: "pickup",
  }
];

const OrdersTabContent: React.FC = () => {
  const { notifyInfo } = useNotifications();
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<string[]>([]);
  const [deliveryFilter, setDeliveryFilter] = useState<string[]>([]);

  const filterOrders = () => {
    return MOCK_ORDERS.filter(order => {
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
    const updatedOrders = orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } 
        : order
    );
    setOrders(updatedOrders);
    notifyInfo("Order Updated", `Order ${orderId} status changed to ${newStatus}`);
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
                  <TableCell className="font-medium">{order.id}</TableCell>
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
    { value: "delivered", label: "Delivered" }
  ];
  
  // Determine which statuses should be available next
  const getAvailableStatuses = (current: OrderStatus) => {
    switch(current) {
      case "pending":
        return ["confirmed", "ready"];
      case "confirmed":
        return ["ready"];
      case "ready":
        return ["delivered"];
      case "delivered":
        return [];
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
