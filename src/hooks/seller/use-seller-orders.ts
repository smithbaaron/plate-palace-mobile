
import { useState, useEffect } from 'react';
import { Order } from '@/types/order';
import { supabase, checkIfTableExists } from '@/lib/supabase';

export const useSellerOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate stats from orders
  const calculateStats = () => {
    // Filter out refunded orders for both sales and orders count calculation
    const validOrders = orders.filter(order => order.status !== 'refunded');
    
    const totalSales = validOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrdersCount = validOrders.length; // Only count non-refunded orders
    
    return {
      totalSales,
      totalOrdersCount,
    };
  };

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if orders table exists
      const ordersTableExists = await checkIfTableExists('orders');
      
      if (!ordersTableExists) {
        // No orders table yet, return empty data
        setOrders([]);
        return;
      }

      // TODO: Replace with actual Supabase query when orders table is implemented
      // For now, we'll use the mock data from OrdersTabContent
      const mockOrders: Order[] = [
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

      setOrders(mockOrders);

    } catch (err) {
      console.error("Error loading orders:", err);
      setError("Failed to load orders data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const stats = calculateStats();

  return {
    orders,
    isLoading,
    error,
    loadOrders,
    ...stats,
  };
};
