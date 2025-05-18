
export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'delivered';

export interface OrderItem {
  id: string;
  plateId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  customerId: string;
  sellerId: string;
  customerName: string;
  sellerName: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  scheduledFor: string; // Date string for scheduled pickup/delivery
  paymentMethod: 'cash' | 'card' | 'app';
  deliveryMethod: 'pickup' | 'delivery';
  address?: string; // For delivery orders
}
